import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL!;

// Predefined Indonesian Names
const MALE_FIRST_NAMES = [
  "Budi", "Joko", "Bambang", "Agus", "Hendra", "Aditya", "Rian", "Andi", "Rudi", "Yusuf",
  "Arif", "Wawan", "Hendri", "Taufik", "Deni", "Fajar", "Rizky", "Kevin", "Akbar", "Rizal"
];
const FEMALE_FIRST_NAMES = [
  "Siti", "Aminah", "Dewi", "Gita", "Lestari", "Permata", "Indah", "Rini", "Sri", "Yanti",
  "Kartika", "Mega", "Dian", "Wulan", "Ani", "Fitri", "Lilis", "Ratna", "Sari", "Putri"
];
const LAST_NAMES = [
  "Santoso", "Wijaya", "Hidayat", "Saputra", "Pratama", "Kusuma", "Siregar", "Nasution",
  "Harahap", "Halim", "Ginting", "Gunawan", "Setiawan", "Kurniawan", "Wibowo", "Budiman",
  "Hartono", "Nugroho", "Tanjung", "Sinaga"
];

// Predefined Indonesian Addresses & Locations (Jabodetabek & Bandung)
interface LocationData {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

const LOCATIONS: LocationData[] = [
  { address: "Jl. Sudirman No. 21, Kebayoran Baru", city: "Jakarta Selatan", latitude: -6.2189, longitude: 106.8024 },
  { address: "Jl. Merdeka No. 5, Sumur Bandung", city: "Bandung", latitude: -6.9147, longitude: 107.6098 },
  { address: "Jl. Margonda Raya No. 100, Beji", city: "Depok", latitude: -6.3916, longitude: 106.8256 },
  { address: "Jl. Gading Serpong Boulevard No. 12", city: "Tangerang", latitude: -6.2425, longitude: 106.6283 },
  { address: "Jl. Ahmad Yani No. 12, Bekasi Selatan", city: "Bekasi", latitude: -6.2349, longitude: 106.9924 },
  { address: "Jl. MH Thamrin No. 8, Menteng", city: "Jakarta Pusat", latitude: -6.1953, longitude: 106.8231 },
  { address: "Jl. Setiabudi No. 229, Gegerkalong", city: "Bandung", latitude: -6.8604, longitude: 107.5973 },
  { address: "Jl. Letjen S. Parman No. 28, Grogol", city: "Jakarta Barat", latitude: -6.1795, longitude: 106.7905 },
  { address: "Jl. BSD Boulevard Raya No. 8", city: "Tangerang Selatan", latitude: -6.3016, longitude: 106.6536 },
  { address: "Jl. Pemuda No. 15, Pulo Gadung", city: "Jakarta Timur", latitude: -6.1931, longitude: 106.8904 },
  { address: "Jl. Buah Batu No. 142, Lengkong", city: "Bandung", latitude: -6.9489, longitude: 107.6285 },
  { address: "Jl. Raya Bogor KM 30, Cimanggis", city: "Depok", latitude: -6.3683, longitude: 106.8687 },
  { address: "Jl. KH. Noer Ali No. 1, Kalimalang", city: "Bekasi", latitude: -6.2464, longitude: 106.9744 },
  { address: "Jl. Danau Sunter Utara No. 18", city: "Jakarta Utara", latitude: -6.1389, longitude: 106.8653 },
  { address: "Jl. Raya Karawaci No. 50, Karawaci", city: "Tangerang", latitude: -6.2235, longitude: 106.6116 },
  { address: "Jl. Kemang Raya No. 12, Mampang Prapatan", city: "Jakarta Selatan", latitude: -6.2735, longitude: 106.8164 },
  { address: "Jl. Riau No. 56, Citarum", city: "Bandung", latitude: -6.9084, longitude: 107.6189 },
  { address: "Jl. Puri Indah Raya No. 2", city: "Jakarta Barat", latitude: -6.1884, longitude: 106.7385 },
  { address: "Jl. Bintaro Utama No. 8, Ciputat", city: "Tangerang Selatan", latitude: -6.2843, longitude: 106.7275 },
  { address: "Jl. Nusantara Raya No. 4, Pancoran Mas", city: "Depok", latitude: -6.3951, longitude: 106.8012 }
];

const BODY_GOALS = ["weight_loss", "muscle_gain", "healthy_life", "budget_healthy"];
const ACTIVITY_LEVELS = [
  "Sedentary (Jarang olahraga)",
  "Lightly Active (Olahraga 1-3 hari/minggu)",
  "Moderately Active (Olahraga 3-5 hari/minggu)",
  "Very Active (Olahraga 6-7 hari/minggu)"
];
const ALLERGIES = ["Kacang", "Susu", "Seafood", "Telur", "Gluten"];
const PREFERENCES = ["Pedas", "Tanpa MSG", "Rendah Garam", "Vegetarian", "Manis"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset<T>(arr: T[], maxCount: number = 2): T[] {
  const count = Math.floor(Math.random() * (maxCount + 1));
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomFloat(min: number, max: number, decimals: number = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  console.log("🔌 Connecting to database using Prisma Neon Http adapter...");
  const adapter = new PrismaNeonHttp(DATABASE_URL, { arrayMode: false, fullResults: true });
  const prisma = new PrismaClient({ adapter } as any);

  const defaultPassword = "User@Mealit123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  console.log("👤 Seeding 20 random users with Indonesian identities...");
  for (let i = 0; i < 20; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? getRandomElement(MALE_FIRST_NAMES) : getRandomElement(FEMALE_FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    
    // Generate unique email
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${getRandomInt(10, 999)}@gmail.com`;
    
    const loc = LOCATIONS[i % LOCATIONS.length];
    
    const age = getRandomInt(18, 50);
    const height = getRandomFloat(150, 185);
    const weight = getRandomFloat(45, 90);
    const bodyGoal = getRandomElement(BODY_GOALS);
    const activityLevel = getRandomElement(ACTIVITY_LEVELS);
    
    const dailyBudget = getRandomElement([40000, 50000, 60000, 75000, 100000]);
    const walletBalance = getRandomInt(10, 100) * 5000; // e.g. Rp 50.000 to Rp 500.000
    
    const userAllergies = getRandomSubset(ALLERGIES);
    const userPreferences = getRandomSubset(PREFERENCES);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "user",
          gender: isMale ? "male" : "female",
          age,
          height,
          weight,
          bodyGoal,
          activityLevel,
          address: `${loc.address}, ${loc.city}`,
          latitude: loc.latitude,
          longitude: loc.longitude,
          dailyBudget,
          walletBalance,
          allergies: userAllergies,
          preferences: userPreferences
        }
      });
      console.log(`   ✅ Created User: ${name} (${email}) - ${loc.city}`);
    } else {
      console.log(`   ⚠️ User already exists: ${name} (${email})`);
    }
  }

  console.log("\n🏪 Seeding 2 new vendors with Indonesian owner identities...");

  // Vendor 1: Jakarta
  const vendorUser1Email = "warung.budi@mealit.com";
  let vendorUser1 = await prisma.user.findUnique({ where: { email: vendorUser1Email } });
  
  if (!vendorUser1) {
    vendorUser1 = await prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: vendorUser1Email,
        password: hashedPassword,
        role: "vendor",
        allergies: [],
        preferences: []
      }
    });
  }

  const vendor1Name = "Warung Makan Bu Budi";
  const existingVendor1 = await prisma.vendor.findUnique({ where: { userId: vendorUser1.id } });
  if (!existingVendor1) {
    await prisma.vendor.create({
      data: {
        userId: vendorUser1.id,
        name: vendor1Name,
        description: "Makanan rumah khas Indonesia, sehat dan bergizi tinggi cocok untuk kebutuhan harian Anda.",
        address: "Jl. Senopati No. 45, Kebayoran Baru",
        city: "Jakarta Selatan",
        contact: "081234567890",
        category: "Tinggi Protein",
        latitude: -6.2244,
        longitude: 106.8085,
        isVerified: true,
        isActive: true,
        deliveryFee: 10000,
        isDeliveryEnabled: true,
        deliveryRadius: 10.0,
        plan: "FREE",
        subscriptionStatus: "INACTIVE"
      }
    });
    console.log(`   ✅ Created Vendor: ${vendor1Name} owned by Budi Santoso`);
  } else {
    console.log(`   ⚠️ Vendor already exists: ${vendor1Name}`);
  }

  // Vendor 2: Bandung
  const vendorUser2Email = "dapur.siti@mealit.com";
  let vendorUser2 = await prisma.user.findUnique({ where: { email: vendorUser2Email } });

  if (!vendorUser2) {
    vendorUser2 = await prisma.user.create({
      data: {
        name: "Siti Aminah",
        email: vendorUser2Email,
        password: hashedPassword,
        role: "vendor",
        allergies: [],
        preferences: []
      }
    });
  }

  const vendor2Name = "Dapur Sehat Bu Siti";
  const existingVendor2 = await prisma.vendor.findUnique({ where: { userId: vendorUser2.id } });
  if (!existingVendor2) {
    await prisma.vendor.create({
      data: {
        userId: vendorUser2.id,
        name: vendor2Name,
        description: "Spesialis katering diet rendah kalori dan vegetarian sehat dengan bahan lokal pilihan.",
        address: "Jl. Dago No. 102, Coblong",
        city: "Bandung",
        contact: "089876543210",
        category: "Diet",
        latitude: -6.8892,
        longitude: 107.6160,
        isVerified: true,
        isActive: true,
        deliveryFee: 8000,
        isDeliveryEnabled: true,
        deliveryRadius: 8.0,
        plan: "FREE",
        subscriptionStatus: "INACTIVE"
      }
    });
    console.log(`   ✅ Created Vendor: ${vendor2Name} owned by Siti Aminah`);
  } else {
    console.log(`   ⚠️ Vendor already exists: ${vendor2Name}`);
  }

  console.log("\n🎉 Seeding completed successfully!");
  console.log(`🔑 Standard password for all new users: ${defaultPassword}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error("❌ Error during seeding:", e);
  process.exit(1);
});
