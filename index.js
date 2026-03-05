import { Client, WebhookClient, MessageEmbed } from 'discord.js-selfbot-v13';
import { readFileSync, writeFileSync } from 'fs';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';
import moment from 'moment';
import colors from 'colors';
import { fetchUserProfile, processProfileData } from './utils/api.js';

// Patch discord.js-selfbot-v13 to fix friend_source_flags issue
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const filePath = join(__dirname, 'node_modules', 'discord.js-selfbot-v13', 'src', 'managers', 'ClientUserSettingManager.js');
  
  let content = readFileSync(filePath, 'utf-8');
  
  if (!content.includes('// PATCHED')) {
    // Find and replace the problematic line
    content = content.replace(
      /this\.addFriendFrom = \{\s*all: data\.friend_source_flags\.all/g,
      'this.addFriendFrom = {\n      all: data.friend_source_flags?.all || false'
    );
    
    content = content.replace(
      /mutual_friends: data\.friend_source_flags\.all \? true : data\.friend_source_flags\.mutual_friends/g,
      'mutual_friends: data.friend_source_flags?.all ? true : (data.friend_source_flags?.mutual_friends || false)'
    );
    
    content = content.replace(
      /mutual_guilds: data\.friend_source_flags\.all \? true : data\.friend_source_flags\.mutual_guilds/g,
      'mutual_guilds: data.friend_source_flags?.all ? true : (data.friend_source_flags?.mutual_guilds || false)'
    );
    
    // Add marker
    content = '// PATCHED\n' + content;
    
    writeFileSync(filePath, content, 'utf-8');
    console.log('[PATCH]'.bgGreen + ' Successfully patched discord.js-selfbot-v13'.green);
  }
} catch (error) {
  console.log('[WARN]'.bgYellow + ' Could not patch discord.js-selfbot-v13, continuing anyway...'.yellow);
}

// Load configuration
let config;
try {
  const configFile = readFileSync('./config.json', 'utf-8');
  config = JSON.parse(configFile);
} catch (error) {
  console.error('❌ Error loading config.json:', error.message);
  process.exit(1);
}

if (!config.token) {
  console.error('❌ Token not configured in config.json');
  process.exit(1);
}

if (!config.webhook_url) {
  console.error('❌ Webhook URL not configured in config.json');
  process.exit(1);
}

const client = new Client({ checkUpdate: false });
const webhook = new WebhookClient({ url: config.webhook_url });
const webhookBoostNitro = config.webhook_boost_nitro ? new WebhookClient({ url: config.webhook_boost_nitro }) : null;
const webhookBadges = config.webhook_badges ? new WebhookClient({ url: config.webhook_badges }) : null;

// Badge emoji mappings
const emojiBadges = {
  '2c': '<:2c:1462561755476525167>',
  '3c': '<:3c:1462561791996592250>',
  BoostLevel1: '<:discordboost1:1462546187751002205>',
  BoostLevel2: '<:discordboost2:1462546229161623758>',
  BoostLevel3: '<:discordboost3:1462546258030755981>',
  BoostLevel4: '<:discordboost4:1462546284647809290>',
  BoostLevel5: '<:discordboost5:1462546311587827763>',
  BoostLevel6: '<:discordboost6:1462546341304729662>',
  BoostLevel7: '<:discordboost7:1462546372057235778>',
  BoostLevel8: '<:discordboost8:1462546396589592839>',
  BoostLevel9: '<:discordboost9:1462546423450042569>',
  'premium_tenure_1_month_v2': '<:bronze:1462546149079519313>',
  'premium_tenure_3_month_v2': '<:silver:1462546147401793722>',
  'premium_tenure_6_month_v2': '<:gold:1462546140321939517>',
  'premium_tenure_12_month_v2': '<:platinum:1462546142972874894>',
  'premium_tenure_24_month_v2': '<:diamond:1462546150354845851>',
  'premium_tenure_36_month_v2': '<:emerald:1462546138631639112>',
  'premium_tenure_60_month_v2': '<:ruby:1462546145220755690>',
  'premium_tenure_72_month_v2': '<:opal:1462546141731098695>',
  HypeSquadOnlineHouse1: '<:hypesquadbalance:1462545536501416040>',
  HypeSquadOnlineHouse2: '<:hypesquadbravery:1462545566935290058>',
  HypeSquadOnlineHouse3: '<:hypesquadbrilliance:1462545593791549460>',
  EarlySupporter: '<:discordearlysupporter:1462545300710232216>',
  'early_supporter': '<:discordearlysupporter:1462545300710232216>',
  VerifiedDeveloper: '<:discordbotdev:1462545206158033027>',
  ActiveDeveloper: '<:activedev:1147277422337720462>',
  Hypesquad: '<:hypesquadevents:1462545625026527355>',
  Nitro: '<:discordnitro:1462545376946159678>',
  Staff: '<:discordstaff:1462545486044074218>',
  CertifiedModerator: '<:discordmod:1462545336131129535>',
  BugHunterLevel1: '<:discordbughunter1:1462545246930866475>',
  BugHunterLevel2: '<:discordbughunter2:1462544674865807645>',
  Partner: '<:discordpartner:1462545451403313152>',
  'Username': '<:username:1462545054282420378>',
  'Orb': '<:orb:1462545655934488746>',
  'Quest': '<:quest:1462545052680323144>',
  'quest_completed': '<:quest:1462545052680323144>',
};

// Rare badges for scraping
const scrapBadgeEmojis = {
  BoostLevel3: '<:discordboost3:1462546258030755981>',
  BoostLevel4: '<:discordboost4:1462546284647809290>',
  BoostLevel5: '<:discordboost5:1462546311587827763>',
  BoostLevel6: '<:discordboost6:1462546341304729662>',
  BoostLevel7: '<:discordboost7:1462546372057235778>',
  BoostLevel8: '<:discordboost8:1462546396589592839>',
  BoostLevel9: '<:discordboost9:1462546423450042569>',
  EarlySupporter: '<:discordearlysupporter:1462545300710232216>',
  'early_supporter': '<:discordearlysupporter:1462545300710232216>',
  BugHunterLevel1: '<:discordbughunter1:1462545246930866475>',
  BugHunterLevel2: '<:discordbughunter2:1462544674865807645>',
  Hypesquad: '<:hypesquadevents:1462545625026527355>',
  VerifiedDeveloper: '<:discordbotdev:1462545206158033027>',
  Partner: '<:discordpartner:1462545451403313152>',
  CertifiedModerator: '<:discordmod:1462545336131129535>',
  Staff: '<:discordstaff:1462545486044074218>',
  'premium_tenure_12_month_v2': '<:platinum:1462546142972874894>',
  'premium_tenure_24_month_v2': '<:diamond:1462546150354845851>',
  'premium_tenure_36_month_v2': '<:emerald:1462546138631639112>',
  'premium_tenure_60_month_v2': '<:ruby:1462546145220755690>',
  'premium_tenure_72_month_v2': '<:opal:1462546141731098695>',
};

// Badge display order
const badgeDisplayOrder = [
  '2c', '3c', 'Nitro',
  'premium_tenure_1_month_v2', 'premium_tenure_3_month_v2', 'premium_tenure_6_month_v2',
  'premium_tenure_12_month_v2', 'premium_tenure_24_month_v2', 'premium_tenure_36_month_v2',
  'premium_tenure_60_month_v2', 'premium_tenure_72_month_v2',
  'BoostLevel1', 'BoostLevel2', 'BoostLevel3', 'BoostLevel4', 'BoostLevel5',
  'BoostLevel6', 'BoostLevel7', 'BoostLevel8', 'BoostLevel9',
  'Staff', 'Partner', 'CertifiedModerator', 'Hypesquad',
  'HypeSquadOnlineHouse1', 'HypeSquadOnlineHouse2', 'HypeSquadOnlineHouse3',
  'BugHunterLevel1', 'BugHunterLevel2', 'ActiveDeveloper', 'VerifiedDeveloper',
  'PremiumEarlySupporter', 'EarlySupporter', 'early_supporter',
  'Username', 'Quest', 'Orb',
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUsers(guildId) {
  try {
    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch();
    
    const allMembers = Array.from(guild.members.cache.values());
    const memberIds = allMembers
      .filter((member) => !member.user.bot)
      .map((member) => member.id);
    
    await fs.mkdir('./files', { recursive: true });
    await fs.writeFile(`./files/${guildId}.txt`, memberIds.join('\n'));
    
    console.log('[SUCCESS]'.bgGreen + ` Saved ${memberIds.length} member IDs to ${guildId}.txt\n`.green);
    
    await delay(5000);
    showBanner();
  } catch (error) {
    console.error(`❌ Error fetching users:`, error.message);
  }
}

async function getServerInvite(guild) {
  try {
    const inviteChannel = guild.channels.cache.find(
      channel => 
        channel.type === 0 && 
        channel.permissionsFor(guild.members.me)?.has('CreateInstantInvite')
    );
    
    if (inviteChannel) {
      const url = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0 });
      return `[${guild.name}](${url})\n[\`${guild.id}\`]`;
    }
  } catch (error) {
    // Failed to create invite
  }
  
  if (guild.vanityURLCode) {
    const url = `https://discord.gg/${guild.vanityURLCode}`;
    return `[${guild.name}](${url})\n[\`${guild.id}\`]`;
  }
  
  return '*No Invite*';
}

function isRareUsername(username) {
  if (!username) return false;
  const length = username.length;
  return length === 2 || length === 3;
}

async function badgeScrapper(guildId) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const invite = await getServerInvite(guild);
    
    const memberIdsString = await fs.readFile(`./files/${guildId}.txt`, 'utf8');
    const memberIds = memberIdsString.split('\n').filter(id => id.trim());
    
    const processedIdsFile = './files/processed_ids.txt';
    const rareAccountsFile = './files/rare_accounts.txt';
    
    let processedIds = new Set();
    try {
      const processedIdsString = await fs.readFile(processedIdsFile, 'utf8');
      processedIdsString.split('\n').forEach(id => {
        if (id.trim()) processedIds.add(id.trim());
      });
    } catch (error) {
      await fs.writeFile(processedIdsFile, '', 'utf8');
    }
    
    // Create rare accounts file if it doesn't exist
    try {
      await fs.access(rareAccountsFile);
    } catch (error) {
      await fs.writeFile(rareAccountsFile, '', 'utf8');
    }

    let scannedCount = 0;
    let rareCount = 0;
    const totalMembers = memberIds.length;

    console.log(`\n${'[INFO]'.bgCyan} Starting scan of ${totalMembers} members...\n`.cyan);

    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      if (!memberId) continue;
      
      if (processedIds.has(memberId)) {
        scannedCount++;
        continue;
      }

      scannedCount++;

      try {
        const proxyConfig = config.use_proxy ? (config.proxy || null) : null;
        const profileData = await fetchUserProfile(memberId, config.token, proxyConfig);

        let userFlags = [];
        try {
          const fullUser = await client.users.fetch(memberId);
          if (fullUser.flags) {
            userFlags = fullUser.flags.toArray();
          }
        } catch (error) {
          // Failed to fetch user flags
        }

        const processedData = processProfileData(profileData, userFlags);

        const rarePremiumTenureBadges = [
          'premium_tenure_12_month_v2',
          'premium_tenure_24_month_v2',
          'premium_tenure_36_month_v2',
          'premium_tenure_48_month_v2',
          'premium_tenure_60_month_v2',
          'premium_tenure_72_month_v2'
        ];
        
        const premiumTenureBadges = processedData.badges.filter(badge => 
          badge && (badge.startsWith('premium_tenure_') || badge.includes('premium_tenure_'))
        );
        const hasPremiumTenure = premiumTenureBadges.some(badge => 
          rarePremiumTenureBadges.includes(badge)
        );
        
        const hasRareBadges = processedData.badges.some(badge => {
          if (scrapBadgeEmojis[badge]) return true;
          if (badge && rarePremiumTenureBadges.includes(badge)) return true;
          return false;
        });
        
        const hasRareBoost = processedData.boost && 
          ['BoostLevel3', 'BoostLevel4', 'BoostLevel5', 'BoostLevel6', 'BoostLevel7', 'BoostLevel8', 'BoostLevel9']
            .includes(processedData.boost.level);
        
        const hasRareUsername = isRareUsername(processedData.username);

        const shouldSend = hasPremiumTenure || hasRareBadges || hasRareBoost || hasRareUsername;
        
        if (shouldSend) {
          let allBadgesForDisplay = [...processedData.badges];
          
          if (hasRareUsername) {
            const usernameLength = processedData.username.length;
            if (usernameLength === 2) {
              allBadgesForDisplay.unshift('2c');
            } else if (usernameLength === 3) {
              allBadgesForDisplay.unshift('3c');
            }
          }
          
          const premiumTenureBadgesDisplay = allBadgesForDisplay.filter(badge => 
            badge && (badge.startsWith('premium_tenure_') || badge.includes('premium_tenure_'))
          );
          const hasPremiumTenureDisplay = premiumTenureBadgesDisplay.length > 0;
          
          if (hasPremiumTenureDisplay) {
            allBadgesForDisplay = allBadgesForDisplay.filter(badge => badge !== 'Nitro');
          }
          
          if (processedData.premiumType && !hasPremiumTenureDisplay && !allBadgesForDisplay.includes('Nitro')) {
            allBadgesForDisplay.push('Nitro');
          }
          
          if (processedData.boost?.level && !allBadgesForDisplay.includes(processedData.boost.level)) {
            allBadgesForDisplay.push(processedData.boost.level);
          }
          
          allBadgesForDisplay.sort((a, b) => {
            const indexA = badgeDisplayOrder.indexOf(a);
            const indexB = badgeDisplayOrder.indexOf(b);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
          
          const allEmojisArray = allBadgesForDisplay
            .map((badge) => {
              if (badge === 'quest_completed') return emojiBadges['Quest'] || '';
              if (badge && badge.startsWith('guild_booster_lvl')) {
                const level = badge.replace('guild_booster_lvl', '');
                const boostLevel = `BoostLevel${level}`;
                return emojiBadges[boostLevel] || '';
              }
              return emojiBadges[badge] || '';
            })
            .filter(Boolean)
            .join('');

          const globalName = processedData.globalName || processedData.username;
          const avatarUrl = processedData.avatar 
            ? `https://cdn.discordapp.com/avatars/${memberId}/${processedData.avatar}.${processedData.avatar.startsWith('a_') ? 'gif' : 'png'}?size=4096`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(processedData.discriminator) % 5}.png`;

          const embed = new MessageEmbed()
            .setAuthor({ 
              name: `${globalName} (@${processedData.username})`, 
              iconURL: avatarUrl 
            })
            .setThumbnail(avatarUrl)
            .setColor('#5865F2')
            .addFields([
              { name: 'User ID', value: `\`${memberId}\``, inline: true },
              { name: 'Badges', value: allEmojisArray || 'None', inline: true },
              { 
                name: 'Account Created', 
                value: processedData.createdAt 
                  ? `<t:${moment(processedData.createdAt).unix()}:R>`
                  : 'N/A', 
                inline: true 
              },
              { name: 'Server', value: invite, inline: false }
            ])
            .setFooter({ 
              text: '317 Scraper by dayix317', 
              iconURL: config.footer_icon_url || 'https://cdn.discordapp.com/emojis/1462545054282420378.png' 
            })
            .setTimestamp();

          if (processedData.boost) {
            const currentBoostLevel = processedData.boost.level;
            const nextBoostLevel = processedData.boost.nextLevel;

            const currentBoostEmoji = emojiBadges[currentBoostLevel] || currentBoostLevel;
            const nextBoostEmoji = emojiBadges[nextBoostLevel] || nextBoostLevel;

            embed.addFields([
              { 
                name: 'Boosting Since', 
                value: `${currentBoostEmoji} <t:${moment(processedData.boost.date).unix()}:R>`, 
                inline: true 
              }
            ]);

            if (processedData.boost.level !== 'BoostLevel9' && processedData.boost.nextDate) {
              embed.addFields([
                { 
                  name: 'Next Level', 
                  value: `${nextBoostEmoji} <t:${moment(processedData.boost.nextDate).unix()}:R>`, 
                  inline: true 
                }
              ]);
            }
          }

          const components = {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: '👤 View Profile',
                url: `https://discord.com/users/${memberId}`,
              },
            ],
          };

          if (invite && invite !== '*No Invite*') {
            const inviteMatch = invite.match(/\(https?:\/\/[^)]+\)/);
            if (inviteMatch) {
              const inviteUrl = inviteMatch[0].slice(1, -1);
              components.components.push({
                type: 2,
                style: 5,
                label: '🌐 Join Server',
                url: inviteUrl,
              });
            }
          }

          // Determine which webhook to use
          let targetWebhook = webhook; // Default webhook
          
          // Check if account has boost or nitro (use boost/nitro webhook)
          const hasBoostOrNitro = processedData.boost || 
            allBadgesForDisplay.some(badge => 
              badge.startsWith('premium_tenure_') || 
              badge.startsWith('BoostLevel')
            );
          
          // Check if account has special badges or rare username (use badges webhook)
          const hasSpecialBadges = allBadgesForDisplay.some(badge => 
            ['Staff', 'Partner', 'CertifiedModerator', 'Hypesquad', 
             'BugHunterLevel1', 'BugHunterLevel2', 'VerifiedDeveloper', 
             'ActiveDeveloper', 'EarlySupporter', 'early_supporter',
             '2c', '3c'].includes(badge)
          );
          
          // Priority: Special badges/rare username > Boost/Nitro > Default
          if (hasSpecialBadges && webhookBadges) {
            targetWebhook = webhookBadges;
          } else if (hasBoostOrNitro && webhookBoostNitro) {
            targetWebhook = webhookBoostNitro;
          }

          await targetWebhook.send({
            embeds: [embed],
            components: [components]
          });
          
          rareCount++;
          const percentage = ((scannedCount / totalMembers) * 100).toFixed(1);
          
          // Get badge names instead of emojis for console
          const badgeNames = allBadgesForDisplay
            .filter(badge => {
              // Include rare badges, boost levels, premium tenure, and rare usernames
              return scrapBadgeEmojis[badge] || 
                     badge === '2c' || 
                     badge === '3c' || 
                     badge.startsWith('BoostLevel') || 
                     badge.startsWith('premium_tenure_');
            })
            .map(badge => {
              if (badge === '2c') return '2-Char';
              if (badge === '3c') return '3-Char';
              
              // Map boost levels to months
              if (badge.startsWith('BoostLevel')) {
                const level = badge.replace('BoostLevel', '');
                const boostMonths = {
                  '1': '1m',
                  '2': '3m',
                  '3': '6m',
                  '4': '9m',
                  '5': '12m',
                  '6': '15m',
                  '7': '18m',
                  '8': '24m',
                  '9': '24m+'
                };
                return `Boost-${boostMonths[level] || level}`;
              }
              
              if (badge.startsWith('premium_tenure_')) {
                const months = badge.match(/\d+/)?.[0];
                return `Nitro-${months}m`;
              }
              return badge;
            })
            .join(', ');
          
          console.log(`${'[RARE]'.bgMagenta} [${scannedCount}/${totalMembers}] (${percentage}%) @${processedData.username} [${badgeNames}]`.magenta);
          
          // Save rare account info to separate file
          const rareInfo = `${memberId} | @${processedData.username} | ${badgeNames}\n`;
          await fs.appendFile(rareAccountsFile, rareInfo, 'utf8');
        } else {
          // Not rare, show normal scan
          const percentage = ((scannedCount / totalMembers) * 100).toFixed(1);
          console.log(`${'[SCAN]'.bgBlue} [${scannedCount}/${totalMembers}] (${percentage}%) @${processedData.username}`.blue);
        }
        
        // Save ALL processed IDs (both rare and normal)
        processedIds.add(memberId);
        await fs.appendFile(processedIdsFile, `${memberId}\n`, 'utf8');
      } catch (error) {
        console.log(`${'[ERROR]'.bgRed} [${scannedCount}/${totalMembers}] ${memberId}: ${error.message}`.red);
        if (error.response) {
          console.log(`${'[ERROR]'.bgRed} Status: ${error.response.status}`.red);
        }
        if (error.message.startsWith('RATE_LIMIT')) {
          const retryAfter = parseInt(error.message.split(':')[1]) || 5;
          console.log(`${'[WARN]'.bgYellow} Rate limit reached! Waiting ${retryAfter} seconds...`.yellow);
          console.log(`${'[INFO]'.bgCyan} Proxy active: ${config.use_proxy ? 'YES' : 'NO'}`.cyan);
          if (config.use_proxy) {
            console.log(`${'[INFO]'.bgCyan} Proxy: ${config.proxy?.host}:${config.proxy?.port}`.cyan);
          }
          await delay(retryAfter * 1000);
          i--;
          scannedCount--;
        }
      }

      const checkDelay = config.user_check_delay_ms || 10000;
      const specialDelay = checkDelay + 5000;
      
      if ((i + 1) % 360 === 0) {
        await delay(specialDelay);
      } else {
        await delay(checkDelay);
      }
    }

    console.log(`\n${'═'.repeat(80)}`.cyan);
    console.log(`${'[COMPLETE]'.bgGreen} Scan finished successfully!`.green);
    console.log(`${'[STATS]'.bgCyan} Total Scanned: ${scannedCount} | Rare Found: ${rareCount} | Success Rate: ${((rareCount/scannedCount)*100).toFixed(2)}%`.cyan);
    console.log(`${'═'.repeat(80)}`.cyan);
  } catch (error) {
    console.error('\n❌ Error in scraper:', error.message);
  }
}

function showBanner() {
  console.clear();
  console.log(`
    
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║     ██████╗  ██╗ ███████╗                           ║
    ║     ╚════██╗███║ ╚════██║                           ║
    ║      █████╔╝╚██║     ██╔╝                           ║
    ║      ╚═══██╗ ██║    ██╔╝                            ║
    ║     ██████╔╝ ██║    ██║                             ║
    ║     ╚═════╝  ╚═╝    ╚═╝                             ║
    ║                                                       ║
    ║              317 Scraper by dayix317                 ║
    ║         Discord Rare Accounts Scanner                ║
    ║                                                       ║
    ║            Scanning for rare accounts...             ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝

`.cyan);
}

showBanner();

client.once('ready', async () => {
  console.log('[CONNECTED]'.bgCyan + ` Logged in as ${client.user.tag}`.cyan);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n[INPUT]'.bgYellow + ' Enter Server ID: '.yellow, async (guildId) => {
    await fetchUsers(guildId);
    await badgeScrapper(guildId);
    rl.close();
    await client.destroy();
    process.exit(0);
  });
});

client.on('error', (error) => {
  console.error('❌ Client error:', error.message);
});

client.login(config.token).catch((error) => {
  console.error('❌ Login error:', error.message);
  process.exit(1);
});
