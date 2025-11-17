import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed some hazards with industryId
  await prisma.hazard.createMany({
    data: [
      {
        code: 'ELEC-001',
        name: 'Electrical Shock',
        description: 'Contact with live electrical conductors',
        category: 'Electrical',
        industryId: 'electrical',
        preControlRisk: 4,
        postControlRisk: 2
      },
      {
        code: 'ELEC-002',
        name: 'Arc Flash',
        description: 'Explosive release of electrical energy',
        category: 'Electrical',
        industryId: 'electrical',
        preControlRisk: 4,
        postControlRisk: 2
      },
      {
        code: 'HEIGHT-001',
        name: 'Falls from Height',
        description: 'Working at heights above 2m',
        category: 'Physical',
        industryId: 'electrical',
        preControlRisk: 3,
        postControlRisk: 1
      }
    ]
  });

  // Seed some controls
  await prisma.control.createMany({
    data: [
      {
        code: 'CTRL-001',
        title: 'Electrical Safety Training',
        type: 'Training',
        description: 'Comprehensive electrical safety training',
        validityDays: 1095 // 3 years
      },
      {
        code: 'CTRL-002',
        title: 'PPE - Insulated Gloves',
        type: 'PPE',
        description: 'Class 00 insulated gloves',
        validityDays: 180 // 6 months inspection
      }
    ]
  });

  console.log('✅ Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });