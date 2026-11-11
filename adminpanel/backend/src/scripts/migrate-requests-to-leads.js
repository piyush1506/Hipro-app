const prisma = require('../prisma');

async function migrateExistingRequestsToLeads() {
  console.log('Migrating existing ServiceRequests to Leads...');
  const requests = await prisma.serviceRequest.findMany({
    include: { user: true }
  });

  console.log(`Found ${requests.length} service requests in database.`);
  let createdCount = 0;

  for (const req of requests) {
    const leadNumber = `LEAD-${req.requestNumber.replace(/^REQ-/, '')}`;
    const existing = await prisma.lead.findUnique({
      where: { leadNumber }
    });

    if (!existing) {
      // Map legacy status to pipeline status
      let leadStatus = 'NEW';
      if (req.status === 'ASSIGNED' || req.status === 'WORK_DONE' || req.status === 'COMPLETED') {
        leadStatus = 'PROJECT_STARTED';
      } else if (req.status === 'QUOTE_REQUESTED' || req.status === 'QUOTED') {
        leadStatus = 'PROCUREMENT_IN_PROGRESS';
      } else if (req.status === 'SITE_AUDIT' || req.status === 'AUDIT_SCHEDULED') {
        leadStatus = 'SITE_VISIT_SCHEDULED';
      } else if (req.status === 'ESTIMATING') {
        leadStatus = 'VERIFIED';
      }

      await prisma.lead.create({
        data: {
          leadNumber,
          source: 'INSPECTION',
          customerId: req.userId,
          customerName: req.user?.name || 'Customer',
          customerPhone: req.user?.phoneNumber || req.technicianPhone || 'N/A',
          customerEmail: req.user?.email || null,
          customerAddress: req.addressline || req.location || null,
          serviceId: req.serviceId,
          subServiceId: req.subServiceId,
          serviceName: req.servicecode,
          subServiceName: req.subServiceCode,
          issueDescription: req.issueDescription,
          mediaUrl: req.mediaUrl || [],
          propertyType: req.propertyType,
          propertySize: req.propertySize,
          location: req.location,
          city: req.cityId || 'Bhilwara',
          latitude: req.latitude,
          longitude: req.longitude,
          preferredDate: req.preferredDate,
          preferredTime: req.preferredTime,
          status: leadStatus,
          originalRequestId: req.id,
          statusHistory: {
            create: {
              fromStatus: 'NONE',
              toStatus: leadStatus,
              changedBy: 'MIGRATION_SCRIPT',
              notes: `Migrated from legacy service request ${req.requestNumber} [status: ${req.status}]`
            }
          }
        }
      });
      createdCount++;
    }
  }

  console.log(`✓ Migration complete! ${createdCount} new Leads created. Total leads: ${await prisma.lead.count()}`);
}

if (require.main === module) {
  migrateExistingRequestsToLeads()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { migrateExistingRequestsToLeads };
