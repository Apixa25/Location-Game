// ═══════════════════════════════════════════════════════════════════════════
// BLACK BART'S GOLD - DATABASE SEED SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
// 
// Creates test data for development and testing:
// - Test user account with credentials
// - Wallet balance (gas + gold)
// - Nearby coins to find
// - Transaction history
//
// Run with: npm run db:seed
// ═══════════════════════════════════════════════════════════════════════════

import { PrismaClient, CoinType, CoinStatus, CoinTier, HuntType, TransactionType, TransactionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// TEST USER CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════

const TEST_USER = {
  email: 'pirate@blackbartsgold.com',
  password: 'treasure123',  // Plain text - will be hashed
  age: 25,
};

// Test location (San Francisco - adjust to your testing area)
// You can change these to your actual location for testing
const TEST_LOCATION = {
  latitude: 37.7749,    // San Francisco
  longitude: -122.4194,
};

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  // Delete in order of dependencies
  await prisma.coinFind.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.coin.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.grid.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database cleared');
}

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: TEST_USER.email,
      passwordHash,
      age: TEST_USER.age,
      hapticEnabled: true,
      soundEnabled: true,
      notificationsEnabled: true,
      deviceIds: ['test-device-001'],
      lastLoginAt: new Date(),
      
      // Create stats
      stats: {
        create: {
          findLimit: 10.00,  // Can find coins up to $10
          totalFoundCount: 5,
          totalFoundValue: 12.50,
          totalHiddenCount: 2,
          totalHiddenValue: 15.00,
          highestHiddenValue: 10.00,
        },
      },
      
      // Create wallet with good balance for testing
      wallet: {
        create: {
          totalBalance: 50.00,     // Total BBG
          gasTank: 15.00,          // ~45 days of gas ($0.33/day)
          parked: 25.00,           // Saved gold
          pending: 10.00,          // Recently found, pending confirmation
          lastGasCharge: new Date(),
        },
      },
    },
    include: {
      stats: true,
      wallet: true,
    },
  });
  
  console.log(`✅ Created user: ${user.email}`);
  console.log(`   - Find Limit: $${user.stats?.findLimit.toFixed(2)}`);
  console.log(`   - Gas Tank: $${user.wallet?.gasTank.toFixed(2)}`);
  console.log(`   - Total Balance: $${user.wallet?.totalBalance.toFixed(2)}`);
  
  return user;
}

async function createTestCoins(userId: string) {
  console.log('🪙 Creating test coins...');
  
  // Create coins at various distances from test location
  const coins = [
    // CLOSE COINS (within 100m) - Easy to find
    {
      coinType: CoinType.fixed,
      value: 0.50,
      contribution: 0.50,
      latitude: TEST_LOCATION.latitude + 0.0003,   // ~33m north
      longitude: TEST_LOCATION.longitude + 0.0002, // ~17m east
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
    },
    {
      coinType: CoinType.fixed,
      value: 1.00,
      contribution: 1.00,
      latitude: TEST_LOCATION.latitude - 0.0005,   // ~55m south
      longitude: TEST_LOCATION.longitude + 0.0003, // ~25m east
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
    },
    
    // MEDIUM COINS (100-500m) - Worth walking for
    {
      coinType: CoinType.fixed,
      value: 2.50,
      contribution: 2.50,
      latitude: TEST_LOCATION.latitude + 0.002,    // ~220m north
      longitude: TEST_LOCATION.longitude - 0.001,  // ~85m west
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
    },
    {
      coinType: CoinType.pool,  // Pool coin - random value at collection
      value: null,
      contribution: 5.00,
      latitude: TEST_LOCATION.latitude - 0.003,    // ~330m south
      longitude: TEST_LOCATION.longitude - 0.002,  // ~170m west
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
      currentTier: CoinTier.gold,
    },
    
    // FAR COINS (500m-1km) - Adventure worthy
    {
      coinType: CoinType.fixed,
      value: 5.00,
      contribution: 5.00,
      latitude: TEST_LOCATION.latitude + 0.005,    // ~550m north
      longitude: TEST_LOCATION.longitude + 0.004,  // ~340m east
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
    },
    {
      coinType: CoinType.fixed,
      value: 10.00,  // This one matches find limit exactly
      contribution: 10.00,
      latitude: TEST_LOCATION.latitude - 0.006,    // ~660m south
      longitude: TEST_LOCATION.longitude + 0.003,  // ~255m east
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
    },
    
    // LOCKED COIN (above find limit) - To test locked UI
    {
      coinType: CoinType.fixed,
      value: 25.00,  // Above $10 find limit
      contribution: 25.00,
      latitude: TEST_LOCATION.latitude + 0.001,    // ~110m north
      longitude: TEST_LOCATION.longitude - 0.0005, // ~42m west
      status: CoinStatus.visible,
      huntType: HuntType.direct_navigation,
    },
  ];
  
  const createdCoins = [];
  for (const coinData of coins) {
    const coin = await prisma.coin.create({
      data: {
        ...coinData,
        hiderId: userId,
      },
    });
    createdCoins.push(coin);
  }
  
  console.log(`✅ Created ${createdCoins.length} test coins:`);
  createdCoins.forEach((coin, i) => {
    const valueStr = coin.value ? `$${coin.value.toFixed(2)}` : 'Pool';
    const distance = calculateDistance(
      TEST_LOCATION.latitude,
      TEST_LOCATION.longitude,
      coin.latitude,
      coin.longitude
    );
    console.log(`   ${i + 1}. ${valueStr} coin - ${Math.round(distance)}m away`);
  });
  
  return createdCoins;
}

async function createTransactionHistory(userId: string, coinIds: string[]) {
  console.log('📝 Creating transaction history...');
  
  const transactions = [
    // Initial gas purchase
    {
      userId,
      type: TransactionType.purchased,
      amount: 10.00,
      status: TransactionStatus.confirmed,
      description: 'Initial gas purchase',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    // Found a coin
    {
      userId,
      type: TransactionType.found,
      amount: 2.50,
      coinId: coinIds[0],
      status: TransactionStatus.confirmed,
      description: 'Found treasure!',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    // Gas consumed
    {
      userId,
      type: TransactionType.gas_consumed,
      amount: -0.33,
      status: TransactionStatus.confirmed,
      description: 'Daily gas consumption',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    // Parked coins
    {
      userId,
      type: TransactionType.parked,
      amount: -5.00,
      status: TransactionStatus.confirmed,
      description: 'Parked coins for safekeeping',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    // Found another coin (pending)
    {
      userId,
      type: TransactionType.found,
      amount: 10.00,
      coinId: coinIds[1],
      status: TransactionStatus.pending,
      description: 'Found treasure! Pending verification...',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ];
  
  for (const txData of transactions) {
    await prisma.transaction.create({ data: txData });
  }
  
  console.log(`✅ Created ${transactions.length} transactions`);
}

async function createTestGrid() {
  console.log('🗺️ Creating grid...');
  
  // Create grid cell for test location
  const grid = await prisma.grid.create({
    data: {
      latitude: Math.floor(TEST_LOCATION.latitude * 20) / 20,  // Round to ~5km grid
      longitude: Math.floor(TEST_LOCATION.longitude * 20) / 20,
      activeUsers: 1,
      coinCount: 7,
      lastActivity: new Date(),
    },
  });
  
  console.log(`✅ Created grid at (${grid.latitude}, ${grid.longitude})`);
  return grid;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n🏴‍☠️ ═══════════════════════════════════════════════════════════');
  console.log('   BLACK BART\'S GOLD - SEEDING DATABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  try {
    // Clear and seed
    await clearDatabase();
    const user = await createTestUser();
    const coins = await createTestCoins(user.id);
    await createTransactionHistory(user.id, coins.map(c => c.id));
    await createTestGrid();
    
    console.log('\n🎉 ═══════════════════════════════════════════════════════════');
    console.log('   SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📋 Test Account Credentials:');
    console.log(`   Email:    ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log('\n💰 Account Status:');
    console.log(`   Find Limit:    $10.00 (can find coins up to $10)`);
    console.log(`   Gas Tank:      $15.00 (~45 days)`);
    console.log(`   Parked:        $25.00`);
    console.log(`   Pending:       $10.00`);
    console.log(`   Total Balance: $50.00`);
    console.log('\n🗺️ Test Location:');
    console.log(`   Latitude:  ${TEST_LOCATION.latitude}`);
    console.log(`   Longitude: ${TEST_LOCATION.longitude}`);
    console.log('   (Coins are placed around San Francisco)');
    console.log('\n💡 To change location, edit TEST_LOCATION in prisma/seed.ts\n');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
