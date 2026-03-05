/**
 * Check if a username is rare (2 or 3 characters)
 * @param {string} username - Username to check
 * @returns {boolean} True if rare
 */
export function checkUsernameRarity(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }

  const length = username.length;
  return length === 2 || length === 3;
}

/**
 * Check if boost level is rare (≥ 3)
 * @param {string|null} boostLevel - Boost level (e.g., 'BoostLevel3')
 * @returns {boolean} True if rare
 */
export function checkBoostRarity(boostLevel) {
  if (!boostLevel || typeof boostLevel !== 'string') {
    return false;
  }

  const levelMatch = boostLevel.match(/BoostLevel(\d+)/);
  if (!levelMatch) {
    return false;
  }

  const level = parseInt(levelMatch[1], 10);
  return level >= 3;
}

/**
 * List of badges considered rare
 */
const RARE_BADGES = [
  'Staff',
  'Partner',
  'CertifiedModerator',
  'Hypesquad',
  'Developer',
  'PremiumEarlySupporter',
  'EarlySupporter',
  'early_supporter',
  'BugHunterLevel1',
  'BugHunterLevel2',
  'VerifiedDeveloper',
  'ActiveDeveloper',
];

/**
 * Check if user has rare badges
 * @param {Array<string>} badges - Array of user badges
 * @returns {boolean} True if has any rare badge
 */
export function checkBadgeRarity(badges) {
  if (!Array.isArray(badges) || badges.length === 0) {
    return false;
  }

  return badges.some(badge => RARE_BADGES.includes(badge));
}

/**
 * Check if account is considered rare based on all criteria
 * @param {Object} profileData - Processed profile data
 * @returns {boolean} True if account is rare
 */
export function isRareAccount(profileData) {
  if (!profileData) {
    return false;
  }

  const usernameRare = checkUsernameRarity(profileData.username);
  const boostRare = profileData.boost ? checkBoostRarity(profileData.boost.level) : false;
  const badgeRare = checkBadgeRarity(profileData.badges);

  return usernameRare || boostRare || badgeRare;
}

/**
 * Get description of rarity criteria met
 * @param {Object} profileData - Processed profile data
 * @returns {Array<string>} Array with descriptions of criteria met
 */
export function getRarityReasons(profileData) {
  const reasons = [];

  if (checkUsernameRarity(profileData.username)) {
    reasons.push(`Rare Username (${profileData.username.length} characters)`);
  }

  if (profileData.boost && checkBoostRarity(profileData.boost.level)) {
    reasons.push(`Boost ${profileData.boost.level}`);
  }

  if (checkBadgeRarity(profileData.badges)) {
    const rareBadges = profileData.badges.filter(badge => RARE_BADGES.includes(badge));
    reasons.push(`Rare Badges: ${rareBadges.join(', ')}`);
  }

  return reasons;
}
