const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

const PREDEFINED_ROLES = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Full system control, access to all modules, staff roles, and settings',
    isSystem: true,
    permissions: [
      '*',
      'leads.view', 'leads.verify', 'leads.assign', 'leads.delete',
      'requirements.view', 'requirements.create', 'requirements.edit', 'requirements.approve',
      'procurement.view', 'procurement.send_rfq', 'procurement.compare', 'procurement.assign',
      'labor.view', 'labor.send_rfq', 'labor.compare', 'labor.assign',
      'vendors.view', 'vendors.create', 'vendors.edit', 'vendors.delete', 'vendors.verify_kyc',
      'quotations.view', 'quotations.create', 'quotations.approve', 'quotations.reject',
      'projects.view', 'projects.manage', 'projects.close',
      'users.view', 'users.edit',
      'reports.view', 'reports.export',
      'settings.view', 'settings.edit',
      'rbac.manage',
      'services.view', 'services.edit',
      'bookings.view', 'bookings.assign', 'bookings.refund',
      'chat.view', 'chat.respond'
    ]
  },
  {
    name: 'TELECALLER',
    displayName: 'Telecaller & Lead Qualification',
    description: 'Receives new leads from customer actions, calls customers, verifies and qualifies leads for engineering inspection',
    isSystem: true,
    permissions: [
      'leads.view',
      'leads.verify',
      'leads.contact',
      'leads.reject',
      'users.view',
      'chat.view',
      'chat.respond'
    ]
  },
  {
    name: 'CIVIL_ENGINEER',
    displayName: 'Civil Engineer / Field Specialist',
    description: 'Conducts site visits, creates requirement analysis (material & labor), reviews vendor quotations, and supervises project execution',
    isSystem: true,
    permissions: [
      'leads.view',
      'leads.assign',
      'requirements.view',
      'requirements.create',
      'requirements.edit',
      'requirements.approve',
      'procurement.view',
      'labor.view',
      'labor.send_rfq',
      'labor.compare',
      'labor.assign',
      'projects.view',
      'projects.manage',
      'quotations.view',
      'quotations.review',
      'vendors.view'
    ]
  },
  {
    name: 'PURCHASE_PERSON',
    displayName: 'Purchase & Procurement Manager',
    description: 'Controls purchasing of materials and products, matches requirements with material vendors, ensures quality and budget, and sends RFQs',
    isSystem: true,
    permissions: [
      'requirements.view',
      'procurement.view',
      'procurement.send_rfq',
      'procurement.compare',
      'procurement.assign',
      'vendors.view',
      'vendors.create',
      'vendors.edit',
      'quotations.view',
      'reports.view'
    ]
  }
];

async function seedRolesAndStaff() {
  console.log('Seeding predefined roles...');
  const roleMap = {};

  for (const roleDef of PREDEFINED_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        permissions: roleDef.permissions
      },
      create: {
        name: roleDef.name,
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        isActive: true,
        permissions: roleDef.permissions
      }
    });
    roleMap[role.name] = role;
    console.log(`✓ Role ready: ${role.displayName} (${role.name})`);
  }

  // Migrate existing Admin accounts to StaffMember with SUPER_ADMIN role
  const existingAdmins = await prisma.admin.findMany();
  console.log(`Found ${existingAdmins.length} existing admin accounts in Admin table.`);

  const superAdminRole = roleMap['SUPER_ADMIN'];

  for (const admin of existingAdmins) {
    const staff = await prisma.staffMember.upsert({
      where: { email: admin.email.toLowerCase().trim() },
      update: {
        name: admin.name || 'Super Administrator',
        phone: admin.phone || null,
        password: admin.password,
        roleId: superAdminRole.id,
        isActive: admin.isActive !== false
      },
      create: {
        name: admin.name || 'Super Administrator',
        email: admin.email.toLowerCase().trim(),
        phone: admin.phone || null,
        password: admin.password,
        roleId: superAdminRole.id,
        isActive: admin.isActive !== false
      }
    });
    console.log(`✓ Migrated admin to StaffMember: ${staff.email} [${staff.id}]`);
  }

  // Ensure at least one default super admin exists if table was empty
  const staffCount = await prisma.staffMember.count();
  if (staffCount === 0) {
    const defaultPasswordHash = await bcrypt.hash('Hipro@Admin2026', 10);
    const defaultStaff = await prisma.staffMember.create({
      data: {
        name: 'Master Administrator',
        email: 'admin@hipro.in',
        password: defaultPasswordHash,
        roleId: superAdminRole.id,
        isActive: true
      }
    });
    console.log(`✓ Created initial default StaffMember: ${defaultStaff.email} (password: Hipro@Admin2026)`);
  }

  console.log('Role and staff seeding complete!');
}

if (require.main === module) {
  seedRolesAndStaff()
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { seedRolesAndStaff, PREDEFINED_ROLES };
