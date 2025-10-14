import { prisma } from './prisma';

async function main() {
  // Create a role
  const electricianRole = await prisma.role.upsert({
    where: { name: 'Electrician' },
    update: {},
    create: {
      name: 'Electrician',
      description: 'Licensed electrician',
    }
  });

  // Create workers
  await prisma.worker.create({
    data: {
      employeeId: 'GMK001',
      firstName: 'Jim',
      lastName: 'Bob',
      email: 'jim.bob@gmk.com',
      companyId: 'gmk',
      roleId: electricianRole.id,
    }
  });

  await prisma.worker.create({
    data: {
      employeeId: 'GMK002',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@gmk.com',
      companyId: 'gmk',
      roleId: electricianRole.id,
    }
  });

  // Create hazards
  const elecShock = await prisma.hazard.create({
    data: {
      code: 'ELEC-001',
      name: 'Electric Shock',
      description: 'Contact with live conductors',
      category: 'Electrical',
      preControlRisk: 20,
      postControlRisk: 8,
    }
  });

  const confinedSpace = await prisma.hazard.create({
    data: {
      code: 'CONF-001',
      name: 'Confined Space Entry',
      description: 'Oxygen deficiency, toxic atmosphere',
      category: 'Confined Space',
      preControlRisk: 16,
      postControlRisk: 6,
    }
  });

  // Create controls
  const lvRescue = await prisma.control.create({
    data: {
      code: 'TR-EL-LV-RES-CPR',
      title: 'LV Rescue & CPR',
      type: 'Training',
      reference: 'AS/NZS 4836',
      validityDays: 365,
    }
  });

  const swmsElec = await prisma.control.create({
    data: {
      code: 'DOC-SWMS-EL-ISO',
      title: 'SWMS - Electrical Isolation',
      type: 'Document',
      reference: 'IMS-DOC-003',
      validityDays: 365,
    }
  });

  const crvIsolation = await prisma.control.create({
    data: {
      code: 'VER-CRV-ISOLATION',
      title: 'CRV - Isolation Checks',
      type: 'Verification',
      reference: 'WHS-CRV-001',
    }
  });

  // Link hazards to controls
  await prisma.hazardControl.createMany({
    data: [
      { hazardId: elecShock.id, controlId: lvRescue.id, isCritical: true },
      { hazardId: elecShock.id, controlId: swmsElec.id, isCritical: true },
      { hazardId: elecShock.id, controlId: crvIsolation.id, isCritical: true },
    ]
  });

  // Create KPI data
  await prisma.kPI.create({
    data: {
      period: '2025-09',
      hoursWorked: 100000,
      incidents: 1,
      nearMiss: 2,
      crvRate: 0.78,
    }
  });

  console.log('✅ Database seeded successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });