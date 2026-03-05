# 🔍 317 Scraper

**Discord Rare Accounts Scanner by dayix317**

An advanced, professional Discord scraper that identifies and monitors rare accounts in specific servers. Features beautiful embeds, comprehensive badge detection, intelligent rate limiting, multiple webhook support, and real-time progress tracking with month-based boost classification.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Author](https://img.shields.io/badge/author-dayix317-purple.svg)

<img width="493" height="273" alt="image" src="https://github.com/user-attachments/assets/255c444a-8e14-4b61-9693-377271804d9d" />


## ✨ Features

### 🎯 Rare Detection Criteria
- **Rare Usernames**: Identifies accounts with 2 or 3 character usernames
- **Rare Badges**: Detects Staff, Partner, Certified Moderator, Hypesquad, Bug Hunter, Early Supporter, Verified Developer, Active Developer
- **Boost Levels**: Monitors accounts with Boost Level 3+ (6+ months boost)
- **Nitro Badges**: Identifies Nitro Platinum, Diamond, Emerald, Ruby, and Opal badges (12+ months)

### 🛠️ Technical Features
- **Beautiful Embeds**: Professional Discord webhook embeds with custom emojis, user ID, and formatting
- **Multiple Webhooks**: Separate webhooks for badges, boost/nitro, and other rare accounts
- **Smart Routing**: Automatically routes rare accounts to appropriate webhooks based on priority
- **Month-Based Display**: Boost levels displayed as months (1m, 3m, 6m, 9m, 12m, 15m, 18m, 24m, 24m+)
- **Real-time Progress**: Live console updates showing scan progress and rare accounts found
- **Separate Tracking**: Rare accounts saved in dedicated file with detailed information
- **Rate Limiting**: Intelligent delay system to avoid API rate limits
- **Proxy Support**: Optional proxy configuration for enhanced privacy
- **Duplicate Prevention**: Tracks processed IDs to avoid scanning the same account twice
- **Error Handling**: Comprehensive error handling with detailed logging
- **Custom Footer**: Configurable footer with GIF support

## 📋 Requirements

- Node.js 16.0.0 or higher
- Discord user account token
- Discord Webhook URL(s)
- (Optional) Proxy server

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/dayix317/317-scraper.git
cd 317-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Configure `config.json`:
```json
{
  "token": "YOUR_USER_ACCOUNT_TOKEN",
  "webhook_url": "YOUR_DEFAULT_WEBHOOK_URL",
  "webhook_boost_nitro": "YOUR_BOOST_NITRO_WEBHOOK_URL",
  "webhook_badges": "YOUR_BADGES_WEBHOOK_URL",
  "footer_icon_url": "https://cdn.discordapp.com/attachments/YOUR_CHANNEL/YOUR_FILE/icon.gif",
  "use_proxy": false,
  "user_check_delay_ms": 10000,
  "proxy": {
    "protocol": "http",
    "host": "your-proxy.com",
    "port": 8080,
    "auth": {
      "username": "username",
      "password": "password"
    }
  }
}
```

## ⚙️ Configuration

### Basic Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `token` | Discord user account token | Required |
| `webhook_url` | Default webhook URL for notifications | Required |
| `webhook_boost_nitro` | Webhook for boost/nitro accounts | Optional |
| `webhook_badges` | Webhook for special badges & rare usernames | Optional |
| `footer_icon_url` | Footer icon URL (supports GIF) | Optional |
| `use_proxy` | Enable/disable proxy | `false` |
| `user_check_delay_ms` | Delay between user checks (ms) | `10000` |

### Webhook System

The scraper uses a smart webhook routing system with priority-based categorization:

**Priority 1: `webhook_badges`** - Special badges and rare usernames
- ⭐ Staff
- 🤝 Partner
- 🛡️ Certified Moderator
- 🎉 Hypesquad
- 🐛 Bug Hunter Level 1/2
- ✅ Verified Developer
- 💻 Active Developer
- 🎖️ Early Supporter
- 🔤 2 character usernames
- 🔤 3 character usernames

**Priority 2: `webhook_boost_nitro`** - Boost and Nitro accounts
- ⚡ All Boost levels (displayed as months: 1m, 3m, 6m, 9m, 12m, 15m, 18m, 24m, 24m+)
- 💎 All Nitro tenure badges (1m, 3m, 6m, 12m, 24m, 36m, 60m, 72m)

**Priority 3: `webhook_url`** - Default fallback
- Any other rare accounts not matching above categories

If optional webhooks are not configured, all notifications go to `webhook_url`.

### Proxy Settings (Optional)

Configure proxy settings in the `proxy` object:
- `protocol`: Proxy protocol (http/https)
- `host`: Proxy server hostname
- `port`: Proxy server port
- `auth`: Authentication credentials (optional)

### How to Get Your Token

⚠️ **Warning**: Never share your token with anyone!

1. Open Discord in your browser
2. Press `F12` to open Developer Tools
3. Go to the `Console` tab
4. Paste this code:
```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```
5. Copy the token (without quotes)

### How to Create a Webhook

1. Go to Server Settings → Integrations → Webhooks
2. Click "Create Webhook"
3. Customize name and channel
4. Copy the webhook URL
5. Repeat for multiple webhooks if needed

### How to Add Footer GIF

1. Upload a GIF to any Discord channel
2. Right-click the GIF → "Copy Link"
3. Paste the link in `footer_icon_url` in config.json

## 📖 Usage

1. Start the scraper:
```bash
npm start
```

2. Enter the server ID when prompted

3. The scraper will:
   - Fetch all server members
   - Process each account for rarity criteria
   - Display real-time progress in console with month-based boost display
   - Route notifications to appropriate webhooks based on priority
   - Save all processed IDs to prevent duplicates
   - Save rare accounts to separate file with detailed information

## 📊 Console Output

### Normal Scan
```
[SCAN] [15/1375] (1.1%) @username
[SCAN] [16/1375] (1.2%) @another_user
```

### Rare Account Found (with month-based boost display)
```
[RARE] [17/1375] (1.2%) @rare_user [Nitro-24m, Boost-24m, 3-Char]
[RARE] [18/1375] (1.3%) @cool_guy [Boost-12m, Staff]
[RARE] [19/1375] (1.4%) @vip [Boost-6m, Partner, 2-Char]
```

### Completion
```
════════════════════════════════════════════════════════════════════════════════
[COMPLETE] Scan finished successfully!
[STATS] Total Scanned: 1375 | Rare Found: 15 | Success Rate: 1.09%
════════════════════════════════════════════════════════════════════════════════
```

## 🎯 Rarity Criteria

### Rare Usernames
- 2 character usernames → `webhook_badges`
- 3 character usernames → `webhook_badges`

### Rare Badges
- Discord Staff → `webhook_badges`
- Partnered Server Owner → `webhook_badges`
- Certified Moderator → `webhook_badges`
- Hypesquad Events → `webhook_badges`
- Bug Hunter Level 1/2 → `webhook_badges`
- Early Supporter → `webhook_badges`
- Verified Bot Developer → `webhook_badges`
- Active Developer → `webhook_badges`

### Boost Levels (Month-Based Classification)
- Level 1 (0-2 months) → `Boost-1m` → `webhook_boost_nitro`
- Level 2 (2-3 months) → `Boost-3m` → `webhook_boost_nitro`
- Level 3 (3-6 months) → `Boost-6m` → `webhook_boost_nitro` ⭐
- Level 4 (6-9 months) → `Boost-9m` → `webhook_boost_nitro` ⭐
- Level 5 (9-12 months) → `Boost-12m` → `webhook_boost_nitro` ⭐
- Level 6 (12-15 months) → `Boost-15m` → `webhook_boost_nitro` ⭐
- Level 7 (15-18 months) → `Boost-18m` → `webhook_boost_nitro` ⭐
- Level 8 (18-24 months) → `Boost-24m` → `webhook_boost_nitro` ⭐
- Level 9 (24+ months) → `Boost-24m+` → `webhook_boost_nitro` ⭐

⭐ = Considered rare (Level 3+)

### Nitro Badges (Premium Tenure)
- Bronze (1 month) → `Nitro-1m` → `webhook_boost_nitro`
- Silver (3 months) → `Nitro-3m` → `webhook_boost_nitro`
- Gold (6 months) → `Nitro-6m` → `webhook_boost_nitro`
- Platinum (12 months) → `Nitro-12m` → `webhook_boost_nitro` ⭐
- Diamond (24 months) → `Nitro-24m` → `webhook_boost_nitro` ⭐
- Emerald (36 months) → `Nitro-36m` → `webhook_boost_nitro` ⭐
- Ruby (60 months) → `Nitro-60m` → `webhook_boost_nitro` ⭐
- Opal (72 months) → `Nitro-72m` → `webhook_boost_nitro` ⭐

⭐ = Considered rare (12+ months)

## 📊 Rate Limiting

The scraper implements intelligent rate limiting:

- **Configurable Delay**: Set via `user_check_delay_ms` (default: 10 seconds)
- **Special Delay**: Additional 5 seconds every 360 requests
- **Auto-Detection**: Automatically detects and handles rate limits
- **Proxy Support**: Use proxies to distribute requests

### Recommended Delays

| Speed | Delay (ms) | Risk Level |
|-------|-----------|------------|
| Fast | 2000-5000 | High |
| Normal | 10000 | Medium |
| Safe | 15000+ | Low |

## 🏗️ Project Structure

```
317-scraper/
├── index.js              # Main scraper file
├── config.json           # Configuration file
├── package.json          # Dependencies
├── utils/
│   ├── api.js           # Discord API functions
│   └── rarity.js        # Rarity verification logic
└── files/               # Generated files
    ├── {guildId}.txt    # Member IDs
    ├── processed_ids.txt # All processed IDs
    └── rare_accounts.txt # Rare accounts found
```

## 📁 Output Files

### `files/processed_ids.txt`
Contains all scanned user IDs (one per line) to prevent duplicate scans:
```
123456789012345678
234567890123456789
345678901234567890
```

### `files/rare_accounts.txt`
Contains detailed information about rare accounts found with month-based boost display:
```
123456789012345678 | @rare_user | Nitro-24m, Boost-24m, 3-Char
234567890123456789 | @cool_guy | Staff, Partner
345678901234567890 | @vip | Boost-12m, Nitro-36m
```

## 📬 Webhook Embed Format

Each rare account notification includes:
- **Author**: Display name and username with avatar
- **User ID**: Discord user ID (copyable)
- **Badges**: Custom emoji badges
- **Account Created**: Relative timestamp
- **Server**: Server name with invite link
- **Boosting Since**: If applicable, with current level emoji
- **Next Level**: If applicable, with next level emoji and ETA
- **Footer**: "317 Scraper by dayix317" with custom GIF
- **Buttons**: "👤 View Profile" and "🌐 Join Server"

## � Security & Privacy

⚠️ **Important Warnings**:
- This project uses a selfbot, which violates Discord's Terms of Service
- Use at your own risk - your account may be banned
- Never share your token with anyone
- Keep `config.json` private and never commit it to Git
- Use `.gitignore` to exclude sensitive files
- Secure all output files containing user data

## 🐛 Troubleshooting

### Error: "Token not configured"
- Check if `config.json` exists and contains the `token` field

### Error: "Rate limit reached"
- The bot automatically waits and retries
- Consider using a proxy if the problem persists
- Increase `user_check_delay_ms` value

### No rare accounts found
- Verify the server ID is correct
- Ensure the bot has permission to view members
- Check if the server has any rare accounts

### Webhook not receiving messages
- Verify all webhook URLs are correct
- Check if the webhook channels still exist
- Ensure the webhooks haven't been deleted
- Test with `webhook_url` first before adding optional webhooks

### Same accounts being scanned again
- Check if `files/processed_ids.txt` exists and is being written to
- Ensure the scraper has write permissions to the `files` folder
- Delete `processed_ids.txt` if you want to rescan all accounts

### Wrong webhook receiving notifications
- Check webhook priority system in configuration section
- Verify optional webhooks are properly configured
- Leave optional webhooks empty to use default for all

### Boost levels not displaying correctly
- Boost levels are automatically converted to months
- Check console output for month-based display (1m, 3m, 6m, etc.)
- Verify boost data is being fetched correctly from Discord API

## � Changelog

### Version 2.0.0
- Complete rewrite by dayix317
- Beautiful embed design with custom emojis
- User ID display in embeds
- Multiple webhook support with smart routing
- Month-based boost classification (1m, 3m, 6m, 9m, 12m, 15m, 18m, 24m, 24m+)
- Enhanced badge detection system
- Improved error handling and logging
- Better rate limiting system
- Separate rare accounts tracking
- Real-time progress display
- Configurable footer with GIF support
- Cleaner code structure
- Professional console output with colors
- Badge name display in console (readable format)
- Priority-based webhook routing

## 💡 Tips

1. **Multiple Webhooks**: Use separate webhooks to organize rare accounts by type
2. **Month Display**: Boost levels are shown as months for better readability
3. **Use Proxies**: For large servers, use proxies to avoid rate limits
4. **Adjust Delays**: Increase delays if you encounter rate limits frequently
5. **Monitor Logs**: Keep an eye on console output for errors
6. **Backup Data**: Regularly backup your `rare_accounts.txt` file
7. **Test First**: Test on small servers before scanning large ones
8. **Custom Footer**: Add a cool GIF to your webhook footer for branding
9. **Webhook Organization**: Create separate Discord channels for each webhook type
10. **Priority System**: Understand webhook priority to organize notifications effectively

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Copyright (c) 2026 dayix317

## ⚠️ Disclaimer

This project is for educational purposes only. The use of selfbots violates Discord's Terms of Service and may result in your account being banned. Use at your own risk. The developer (dayix317) is not responsible for any consequences resulting from the use of this software.

## 🤝 Contributing

This is a personal project by dayix317. Feel free to fork and modify for your own use, but please maintain attribution.

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review your configuration
3. Ensure all dependencies are installed
4. Check console logs for detailed error messages
5. Verify webhook URLs are correct
6. Test boost level display in console

---

Made with ❤️ by dayix317 | 317 Scraper v2.0
