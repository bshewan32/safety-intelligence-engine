import { PrismaClient } from '@prisma/client';
import { importMultiplePacks } from '../hazard-packs/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Import all industry hazard packs
  console.log('\n📦 Importing hazard packs...');
  
  const results = await importMultiplePacks(prisma, [
    'electrical',
    'construction',
    'manufacturing'
  ]);
  
  // Display results for each pack
  for (const [packId, result] of Object.entries(results)) {
    console.log(`\n✅ ${packId.toUpperCase()} PACK:`);
    console.log(`   - Hazards created: ${result.hazardsCreated}`);
    console.log(`   - Hazards updated: ${result.hazardsUpdated}`);
    console.log(`   - Controls created: ${result.controlsCreated}`);
    console.log(`   - Controls updated: ${result.controlsUpdated}`);
    console.log(`   - Mappings created: ${result.mappingsCreated}`);
    
    if (result.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${result.errors.length}`);
      result.errors.slice(0, 3).forEach(err => console.log(`      - ${err}`));
    }
  }
  
  // Calculate totals
  const totals = Object.values(results).reduce((acc, r) => ({
    hazardsCreated: acc.hazardsCreated + r.hazardsCreated,
    hazardsUpdated: acc.hazardsUpdated + r.hazardsUpdated,
    controlsCreated: acc.controlsCreated + r.controlsCreated,
    controlsUpdated: acc.controlsUpdated + r.controlsUpdated,
    mappingsCreated: acc.mappingsCreated + r.mappingsCreated,
    errors: acc.errors + r.errors.length
  }), {
    hazardsCreated: 0,
    hazardsUpdated: 0,
    controlsCreated: 0,
    controlsUpdated: 0,
    mappingsCreated: 0,
    errors: 0
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TOTAL SUMMARY:');
  console.log('='.repeat(50));
  console.log(`Hazards:   ${totals.hazardsCreated} created, ${totals.hazardsUpdated} updated`);
  console.log(`Controls:  ${totals.controlsCreated} created, ${totals.controlsUpdated} updated`);
  console.log(`Mappings:  ${totals.mappingsCreated} created`);
  console.log(`Errors:    ${totals.errors}`);
  console.log('='.repeat(50));
  
  console.log('\n✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });