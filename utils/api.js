import axios from 'axios';

/**
 * Calculate the difference in months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} finalDate - End date
 * @param {boolean} roundUpFractionalMonths - Round up fractional months
 * @returns {number} Difference in months
 */
function diffMonths(startDate, finalDate, roundUpFractionalMonths = false) {
  let start = new Date(startDate);
  let end = new Date(finalDate);
  let inverse = false;

  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
    inverse = true;
  }

  const yearsDifference = end.getFullYear() - start.getFullYear();
  const monthsDifference = end.getMonth() - start.getMonth();
  const daysDifference = end.getDate() - start.getDate();

  let monthCorrection = 0;
  if (roundUpFractionalMonths === true && daysDifference > 0) {
    monthCorrection = 1;
  } else if (roundUpFractionalMonths !== true && daysDifference < 0) {
    monthCorrection = -1;
  }

  return (
    (inverse ? -1 : 1) *
    (yearsDifference * 12 + monthsDifference + monthCorrection)
  );
}

/**
 * Calculate boost level based on month difference
 * @param {number} difference - Difference in months
 * @param {Date} boostDate - Boost date
 * @returns {Object} Current and next boost information
 */
function calculateBoostLevel(difference, boostDate) {
  const data = new Date(boostDate);
  let userBoost;
  let nextBoost;
  let nextBoostDate;

  if (difference >= 0 && difference < 2 && boostDate !== null) {
    userBoost = 'BoostLevel1';
    nextBoost = 'BoostLevel2';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 2));
  } else if (difference >= 2 && difference < 3 && boostDate !== null) {
    userBoost = 'BoostLevel2';
    nextBoost = 'BoostLevel3';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 3));
  } else if (difference >= 3 && difference < 6 && boostDate !== null) {
    userBoost = 'BoostLevel3';
    nextBoost = 'BoostLevel4';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 6));
  } else if (difference >= 6 && difference < 9 && boostDate !== null) {
    userBoost = 'BoostLevel4';
    nextBoost = 'BoostLevel5';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 9));
  } else if (difference >= 9 && difference < 12 && boostDate !== null) {
    userBoost = 'BoostLevel5';
    nextBoost = 'BoostLevel6';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 12));
  } else if (difference >= 12 && difference < 15 && boostDate !== null) {
    userBoost = 'BoostLevel6';
    nextBoost = 'BoostLevel7';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 15));
  } else if (difference >= 15 && difference < 18 && boostDate !== null) {
    userBoost = 'BoostLevel7';
    nextBoost = 'BoostLevel8';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 18));
  } else if (difference >= 18 && difference < 24 && boostDate !== null) {
    userBoost = 'BoostLevel8';
    nextBoost = 'BoostLevel9';
    nextBoostDate = new Date(data.setMonth(data.getMonth() + 24));
  } else if (difference >= 24 && boostDate !== null) {
    userBoost = 'BoostLevel9';
    nextBoost = 'MaxLevelReached';
    nextBoostDate = 'MaxLevelReached';
  } else {
    userBoost = null;
    nextBoost = null;
    nextBoostDate = null;
  }

  return { userBoost, nextBoost, nextBoostDate };
}

/**
 * Fetch complete user profile from Discord API
 * @param {string} userId - User ID
 * @param {string} token - Authentication token
 * @param {Object} proxyConfig - Proxy configuration (optional)
 * @returns {Promise<Object>} User profile data
 */
export async function fetchUserProfile(userId, token, proxyConfig = null) {
  const url = `https://discord.com/api/v10/users/${userId}/profile`;
  
  const requestConfig = {
    headers: {
      Authorization: token,
      'content-type': 'application/json',
    },
  };

  if (proxyConfig) {
    if (proxyConfig.auth) {
      requestConfig.proxy = {
        protocol: proxyConfig.protocol || 'http',
        host: proxyConfig.host,
        port: proxyConfig.port,
        auth: {
          username: proxyConfig.auth.username,
          password: proxyConfig.auth.password
        }
      };
    } else {
      requestConfig.proxy = {
        protocol: proxyConfig.protocol || 'http',
        host: proxyConfig.host,
        port: proxyConfig.port
      };
    }
  }

  try {
    const response = await axios.get(url, requestConfig);
    
    if (response.status === 200) {
      return response.data;
    }

    throw new Error(`Status code: ${response.status}`);
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;
      
      if (statusCode === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5;
        throw new Error(`RATE_LIMIT:${retryAfter}`);
      }
    }

    throw error;
  }
}

/**
 * Process profile data and extract relevant information
 * @param {Object} profileData - Raw API data
 * @param {Object} userFlags - User flags from Discord.js
 * @returns {Object} Processed data
 */
export function processProfileData(profileData, userFlags = []) {
  const user = profileData.user || {};
  const userProfile = profileData.user_profile || {};
  const badges = profileData.badges || [];
  const premiumGuildSince = profileData.premium_guild_since;
  const premiumType = profileData.premium_type;
  const premiumSince = profileData.premium_since;
  const connectedAccounts = profileData.connected_accounts || [];

  let boostInfo = null;
  
  if (premiumGuildSince) {
    const boostDiff = diffMonths(new Date(premiumGuildSince), new Date());
    const boostData = calculateBoostLevel(boostDiff, premiumGuildSince);
    
    if (boostData.userBoost) {
      boostInfo = {
        level: boostData.userBoost,
        date: new Date(premiumGuildSince),
        nextLevel: boostData.nextBoost,
        nextDate: boostData.nextBoostDate,
      };
    }
  }

  const flagsBadges = userFlags.filter(flag => typeof flag === 'string');
  
  const apiBadgesNames = (badges || []).map(badge => {
    const badgeIdMap = {
      'staff': 'Staff',
      'partner': 'Partner',
      'certified_moderator': 'CertifiedModerator',
      'hypesquad': 'Hypesquad',
      'hypesquad_balance': 'HypeSquadOnlineHouse1',
      'hypesquad_bravery': 'HypeSquadOnlineHouse2',
      'hypesquad_brilliance': 'HypeSquadOnlineHouse3',
      'bug_hunter_level_1': 'BugHunterLevel1',
      'bug_hunter_level_2': 'BugHunterLevel2',
      'active_developer': 'ActiveDeveloper',
      'verified_developer': 'VerifiedDeveloper',
      'premium_early_supporter': 'PremiumEarlySupporter',
      'premium_tenure_1_month_v2': 'premium_tenure_1_month_v2',
      'premium_tenure_3_month_v2': 'premium_tenure_3_month_v2',
      'premium_tenure_6_month_v2': 'premium_tenure_6_month_v2',
      'premium_tenure_12_month_v2': 'premium_tenure_12_month_v2',
      'premium_tenure_24_month_v2': 'premium_tenure_24_month_v2',
      'premium_tenure_36_month_v2': 'premium_tenure_36_month_v2',
      'premium_tenure_48_month_v2': 'premium_tenure_48_month_v2',
      'premium_tenure_60_month_v2': 'premium_tenure_60_month_v2',
      'premium_tenure_72_month_v2': 'premium_tenure_72_month_v2',
      'quest': 'Quest',
      'quest_completed': 'Quest',
      'orb': 'Orb',
      'username': 'Username',
      'legacy_username': 'Username',
      'guild_booster_lvl1': 'BoostLevel1',
      'guild_booster_lvl2': 'BoostLevel2',
      'guild_booster_lvl3': 'BoostLevel3',
      'guild_booster_lvl4': 'BoostLevel4',
      'guild_booster_lvl5': 'BoostLevel5',
      'guild_booster_lvl6': 'BoostLevel6',
      'guild_booster_lvl7': 'BoostLevel7',
      'guild_booster_lvl8': 'BoostLevel8',
      'guild_booster_lvl9': 'BoostLevel9',
    };
    const badgeId = typeof badge === 'string' ? badge : (badge?.id || badge);
    const normalizedBadgeId = typeof badgeId === 'string' ? badgeId.toLowerCase() : badgeId;
    const mappedBadge = badgeIdMap[normalizedBadgeId] || badgeIdMap[badgeId] || badgeId;
    return mappedBadge && typeof mappedBadge === 'string' ? mappedBadge : badgeId;
  }).filter(Boolean);

  let allBadges = [...new Set([...flagsBadges, ...apiBadgesNames])];
  
  allBadges = allBadges.map(badge => {
    if (badge === 'quest_completed') return 'Quest';
    if (badge && badge.startsWith('guild_booster_lvl')) {
      const level = badge.replace('guild_booster_lvl', '');
      return `BoostLevel${level}`;
    }
    return badge;
  });
  
  allBadges = [...new Set(allBadges)];
  
  const badgeOrder = [
    '2c', '3c', 'Nitro',
    'premium_tenure_1_month_v2', 'premium_tenure_3_month_v2', 'premium_tenure_6_month_v2',
    'premium_tenure_12_month_v2', 'premium_tenure_24_month_v2', 'premium_tenure_36_month_v2',
    'premium_tenure_48_month_v2', 'premium_tenure_60_month_v2', 'premium_tenure_72_month_v2',
    'BoostLevel1', 'BoostLevel2', 'BoostLevel3', 'BoostLevel4', 'BoostLevel5',
    'BoostLevel6', 'BoostLevel7', 'BoostLevel8', 'BoostLevel9',
    'Staff', 'Partner', 'CertifiedModerator', 'Hypesquad',
    'HypeSquadOnlineHouse1', 'HypeSquadOnlineHouse2', 'HypeSquadOnlineHouse3',
    'BugHunterLevel1', 'BugHunterLevel2', 'ActiveDeveloper', 'VerifiedDeveloper',
    'PremiumEarlySupporter', 'EarlySupporter', 'early_supporter',
    'Username', 'Quest', 'Orb',
  ];

  allBadges.sort((a, b) => {
    const indexA = badgeOrder.indexOf(a);
    const indexB = badgeOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const hasPremiumTenure = allBadges.some(badge => 
    badge && (badge.startsWith('premium_tenure_') || badge.includes('premium_tenure_'))
  );
  
  if (hasPremiumTenure) {
    allBadges = allBadges.filter(badge => badge !== 'Nitro');
  }
  
  if (premiumType && !hasPremiumTenure && !allBadges.includes('Nitro')) {
    allBadges.push('Nitro');
  }

  if (boostInfo && boostInfo.level && !allBadges.includes(boostInfo.level)) {
    allBadges.push(boostInfo.level);
  }

  allBadges.sort((a, b) => {
    const indexA = badgeOrder.indexOf(a);
    const indexB = badgeOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const processedData = {
    userId: user.id,
    username: user.username,
    discriminator: user.discriminator,
    globalName: user.global_name,
    legacyUsername: profileData.legacy_username,
    bio: user.bio || null,
    avatar: user.avatar,
    banner: userProfile.banner || null,
    badges: allBadges,
    apiBadges: badges,
    premiumType: premiumType === 1 ? 'NitroClassic' : premiumType === 2 ? 'Nitro' : premiumType === 3 ? 'NitroBasic' : null,
    premiumSince: premiumSince ? new Date(premiumSince) : null,
    boost: boostInfo,
    connectedAccounts: connectedAccounts.length > 0 ? connectedAccounts : null,
    isBot: user.bot || false,
    createdAt: user.id ? (() => {
      try {
        const snowflake = BigInt(user.id);
        const timestamp = Number((snowflake >> 22n) + 1420070400000n);
        return new Date(timestamp);
      } catch {
        const timestamp = parseInt(user.id) / 4194304 + 1420070400000;
        return new Date(timestamp);
      }
    })() : null,
  };

  return processedData;
}
