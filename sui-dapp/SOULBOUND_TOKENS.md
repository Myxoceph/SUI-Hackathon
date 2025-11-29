# Soulbound Token System

## Overview
This project implements a **soulbound token (SBT)** system using Move on the Sui blockchain. Soulbound tokens are non-transferable NFTs that represent achievements, credentials, or contributions tied to a specific wallet address.

## How It Works

### 1. Soulbound Badge Structure
Each badge is a unique NFT with the following properties:
- **Non-transferable**: Missing the `store` ability, making it impossible to trade or transfer
- **Project-specific**: Tied to a specific contribution
- **Permanent**: Lives in the user's wallet forever
- **Display-enabled**: Shows metadata in wallets and explorers

### 2. Automatic Minting
When a user submits a contribution, the system automatically:
1. Creates a `Contribution` object on-chain
2. Mints a `SoulboundBadge` NFT
3. Transfers the badge to the contributor's wallet
4. Emits events for both actions

### 3. Badge Types
Badges are categorized by contribution type:
- 🔧 **Development** - Code contributions
- 🎨 **Design** - UI/UX work
- 📊 **Research** - Research and analysis
- 📝 **Documentation** - Docs and guides
- 👥 **Community** - Community engagement
- 🔄 **Other** - Other contributions

## Technical Implementation

### Move Modules

#### `soulbound_badge.move`
```move
public struct SoulboundBadge has key {
    // Note: No 'store' ability = non-transferable
    id: UID,
    name: String,
    description: String,
    project_name: String,
    contribution_type: String,
    image_url: String,
    owner: address,
    contribution_id: ID,
    timestamp: u64,
}
```

#### Key Functions:
- `mint_badge()` - Creates and transfers a new badge
- `get_badge_details()` - Retrieves badge information
- No transfer function exists (intentionally)

### Frontend Integration

#### Viewing Badges
```javascript
const { getUserBadges } = useSuiTransaction();
const badges = await getUserBadges(userAddress);
```

#### Display
- Badges are displayed in the Passport page
- Uses the `BadgeCard` component
- Shows project name, type, timestamp, and soulbound status

## Why Soulbound?

### Benefits:
1. **Authentic Reputation** - Can't buy or sell achievements
2. **True Identity** - Tied to the contributor's actual work
3. **Permanent Record** - On-chain proof of contributions
4. **Anti-Gaming** - Prevents badge trading/farming

### Use Cases:
- Developer portfolios
- Contribution tracking
- Reputation systems
- Access control (gated communities)
- Proof of participation

## Deployment

### Build the contracts:
```bash
cd move
sui move build
```

### Deploy to testnet:
```bash
sui client publish --gas-budget 100000000
```

### Update package ID:
After deployment, update the package ID in:
- `src/hooks/useSuiTransaction.js`

## Future Enhancements

1. **Badge Levels** - Bronze, Silver, Gold tiers
2. **Composable Badges** - Combine multiple badges
3. **Time-locked Badges** - Expire after a period
4. **DAO Voting Power** - Use badges for governance
5. **Achievement Trees** - Unlock advanced badges
6. **Batch Minting** - Mint multiple badges at once
7. **Custom Metadata** - Add skills, tags, etc.

## Resources
- [Sui Move Documentation](https://docs.sui.io/guides/developer/first-app)
- [Soulbound Tokens](https://vitalik.ca/general/2022/01/26/soulbound.html)
- [Object Display Standard](https://docs.sui.io/standards/display)
