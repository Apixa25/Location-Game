# 🌫️ Dynamic Coin Distribution

The algorithm that ensures coins are always available where players are active.

---

## 💡 Core Concept

Coins are NOT placed with fixed values. **System coins get their value assigned at the moment of collection** based on the finder's history.

This is DIFFERENT from user-hidden or sponsor-hidden coins which have fixed values.

---

## 🏦 The Communal Pool

```
┌─────────────────────────────────────────────────────────────┐
│                    COMMUNAL COIN POOL                       │
│                                                             │
│  All unassigned value from the $9 allocations               │
│  Constantly refilled as users pay $10                       │
│  Distributed to grids with active users                     │
│  Recycled from inactive grids                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
              Distributed to active grids
                           ↓
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Grid A  │  │ Grid B  │  │ Grid C  │  │ Grid D  │
│ 3 coins │  │ 3 coins │  │ 0 coins │  │ 3 coins │
│ 2 users │  │ 1 user  │  │ 0 users │  │ 5 users │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## 📊 Distribution Rules

### Grid Coin Count
| Active Users in Grid | Coins Maintained |
|---------------------|------------------|
| 0 users | 0 coins (recycled after 24h) |
| 1+ users | 3 coins minimum |

### Reseeding
- When a coin is found, grid is immediately reseeded
- Target: Always 3 coins per active grid
- Multiple users in same grid see the same 3 coins

---

## 🎰 Dynamic Valuation (The Brilliant Part)

**System-placed coins have NO value until collected.**

When a user collects a system coin, the value is calculated based on:

### Factors
1. User's recent find history (last 10 coins)
2. User's total lifetime finds
3. Company profit margin requirements
4. Randomness for excitement

### Balancing Algorithm (Concept)

```
IF user's last 3 finds were high value ($5+):
    → Next coin: 25¢ to $1 range (cool down)

IF user's last 5 finds were low value (<$1):
    → Next coin: $2 to $5 range (reward)

IF user is new (first week):
    → Higher variance, exciting finds early

IF user is grinding heavily:
    → Diminishing returns to protect company
```

### Two Users, Same Coin, Different Values

```
User A: Last 3 finds = $10, $8, $5
        → Finds coin → Gets 50¢

User B: Last 3 finds = 25¢, 10¢, 50¢
        → Finds SAME coin → Gets $3

Both users see the same coin marker.
First to collect gets their personalized value.
```

---

## 💰 Revenue Protection

### The 10% Guarantee
- User pays $10
- $1 is immediate profit (gas fee structure)
- $9 goes to coin pool for distribution
- Company always makes 10% minimum

### Payout Limits
- System must track total payouts vs total deposits
- If payouts approach deposits, reduce coin values
- Heavy grinders get diminishing returns
- Casual players get better ratios (keeps them engaged)

---

## ⏱️ Timing Rules

### Initial Distribution
1. User pays $10
2. Immediately: 3 coins placed within 1 mile
3. As they find: Pool releases more to their area
4. Average location tracked to determine "home area"

### The Denver Airport Problem (Solved)
```
User signs up at Denver Airport
     ↓
3 coins placed nearby
     ↓
User boards plane, flies to San Francisco
     ↓
After 2 hours with no players at Denver Airport:
  → Coins recycle to pool
     ↓
User arrives in San Francisco, opens app
     ↓
3 coins placed in their new grid
```

### Recycling Timeline
| Condition | Coins Recycle After |
|-----------|---------------------|
| Grid has 0 active users | 24 hours |
| Grid has 0 users nearby | 2 hours (faster recycle) |
| Coin not found, users present | Never (stays available) |

---

## 🎯 User Experience Goals

### For Grinders
- Can find $10, $20, $50+ per day if dedicated
- But returns diminish to protect company
- Encouraged to hide coins to increase limits

### For Casuals
- Always 3 coins nearby
- Feel the game is populated and active
- Steady, predictable experience

### For New Users
- Exciting first finds (hook them)
- Tutorial coin experience
- Quick wins to understand mechanics

---

## 🔢 Fixed vs Dynamic Coins

| Coin Type | Value Set | When Value Known |
|-----------|-----------|------------------|
| System-placed | At collection | User finds it |
| User-hidden | At hiding | Always visible |
| Sponsor-hidden | At hiding | Always visible |

**Important**: User and sponsor coins have FIXED values because:
- Users pay real money to hide specific amounts
- Sponsors pay for specific coin values
- These cannot be dynamically adjusted

---

## 📈 Denomination Variety

System ensures users don't only find one denomination:

### Tracking
- Last 10 finds recorded per user
- Denomination distribution calculated
- If too skewed, next coin corrects

### Example Correction
```
User found: 10¢, 10¢, 25¢, 10¢, 10¢, 25¢, 10¢, 10¢, 10¢, 25¢
           (90% low value)

System: "Time for a $2-5 coin to keep it exciting"
```

---

## 🔗 Related Documents

- [Economy & Currency](./economy-and-currency.md)
- [Coins & Collection](./coins-and-collection.md)
- [Project Scope](./project-scope.md)
