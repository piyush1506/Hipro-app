const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

async function seedSampleStaff() {
  console.log('Seeding demo staff accounts for testing each role...');

  const roles = await prisma.role.findMany();
  const roleMap = {};
  roles.forEach(r => { roleMap[r.name] = r.id; });

  const sampleStaff = [
    {
      name: 'Riya Sharma (Telecaller)',
      email: 'telecaller@hipro.in',
      phone: '+91 98290 11111',
      password: await bcrypt.hash('Telecaller@123', 10),
      roleId: roleMap['TELECALLER']
    },
    {
      name: 'Er. Rajesh Verma (Civil Engineer)',
      email: 'engineer@hipro.in',
      phone: '+91 98290 22222',
      password: await bcrypt.hash('Engineer@123', 10),
      roleId: roleMap['CIVIL_ENGINEER']
    },
    {
      name: 'Amit Patel (Procurement Head)',
      email: 'purchaser@hipro.in',
      phone: '+91 98290 33333',
      password: await bcrypt.hash('Purchaser@123', 10),
      roleId: roleMap['PURCHASE_PERSON']
    }
  ];

  for (const staff of sampleStaff) {
    if (!staff.roleId) {
      console.warn(`Role not found for ${staff.email}`);
      continue;
    }
    const created = await prisma.staffMember.upsert({
      where: { email: staff.email },
      update: {
        name: staff.name,
        phone: staff.phone,
        password: staff.password,
        roleId: staff.roleId,
        isActive: true
      },
      create: {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        password: staff.password,
        roleId: staff.roleId,
        isActive: true
      }
    });
    console.log(`✓ Sample staff ready: ${created.name} (${created.email})`);
  }

  console.log('Sample staff accounts ready for testing!');
}

if (require.main === module) {
  seedSampleStaff()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { seedSampleStaff };
