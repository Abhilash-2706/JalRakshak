import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AREAS = ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'HSR Layout', 'Marathahalli', 'Yelahanka', 'Rajajinagar'];
const LEAK_TYPES = ['Water pipeline', 'Sewage pipeline', 'Water pipeline', 'Water pipeline'];
const CATEGORIES = ['Small leak', 'Major leak', 'Burst pipeline', 'Continuous water flow', 'Underground leakage'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'REPAIR_IN_PROGRESS', 'RESOLVED'];

async function main() {
  console.log('🌱 Seeding JalRakshak database...');

  const hash = await bcrypt.hash('password123', 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'System Administrator', password: hash, role: 'ADMIN', phone: '9999999999' },
  });

  const officer = await prisma.user.upsert({
    where: { email: 'officer@example.com' },
    update: {},
    create: { email: 'officer@example.com', name: 'Field Officer Raj Kumar', password: hash, role: 'OFFICER', phone: '8888888888' },
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: { email: 'citizen@example.com', name: 'Rahul Sharma', password: hash, role: 'CITIZEN', phone: '7777777777' },
  });

  // Extra citizens
  const citizens = [citizen];
  for (let i = 1; i <= 9; i++) {
    const c = await prisma.user.upsert({
      where: { email: `citizen${i}@example.com` },
      update: {},
      create: { email: `citizen${i}@example.com`, name: `Citizen User ${i}`, password: hash, role: 'CITIZEN' },
    });
    citizens.push(c);
  }

  console.log('✅ Users created');

  // Seed 30 complaints
  const existingCount = await prisma.complaint.count();
  if (existingCount === 0) {
    for (let i = 1; i <= 30; i++) {
      const severity = SEVERITIES[i % 4];
      const priority = severity === 'Critical' ? 'CRITICAL' : severity === 'High' ? 'HIGH' : severity === 'Medium' ? 'MEDIUM' : 'LOW';
      const status = STATUSES[i % STATUSES.length];
      const area = AREAS[i % AREAS.length];
      const leakType = LEAK_TYPES[i % LEAK_TYPES.length];
      const lat = 12.9 + Math.random() * 0.2;
      const lng = 77.5 + Math.random() * 0.2;

      const complaint = await prisma.complaint.create({
        data: {
          complaintId: `JL-2026-${String(i).padStart(6, '0')}`,
          citizenId: citizens[i % citizens.length].id,
          officerId: status !== 'SUBMITTED' && status !== 'UNDER_REVIEW' ? officer.id : null,
          leakType,
          leakCategory: CATEGORIES[i % CATEGORIES.length],
          severity,
          priority,
          description: `${leakType} issue reported in ${area}. Requires immediate attention.`,
          latitude: lat,
          longitude: lng,
          address: `${i * 11}, Main Road, ${area}`,
          area,
          city: 'Bangalore',
          pincode: `56000${i % 9}`,
          status,
          isEmergency: severity === 'Critical' && i % 3 === 0,
          estimatedWaterLoss: priority === 'CRITICAL' ? 18000 : priority === 'HIGH' ? 9000 : 3000,
        },
      });

      await prisma.statusHistory.create({ data: { complaintId: complaint.id, status: 'SUBMITTED', notes: 'Complaint submitted by citizen' } });
      if (status !== 'SUBMITTED') {
        await prisma.statusHistory.create({ data: { complaintId: complaint.id, status, notes: 'Status updated by system' } });
      }

      if (status === 'RESOLVED') {
        await prisma.feedback.create({
          data: { complaintId: complaint.id, rating: 4, isRepaired: true, isSatisfactory: true, comments: 'Good work by the team!' },
        });
      }
    }
    console.log('✅ 30 Complaints seeded');
  } else {
    console.log(`⏭️  Skipped complaints (${existingCount} already exist)`);
  }

  // Notifications for citizen
  await prisma.notification.create({
    data: { userId: citizen.id, title: 'Report Submitted', message: 'Your complaint JL-2026-000001 has been submitted.', isRead: false },
  });
  await prisma.notification.create({
    data: { userId: citizen.id, title: 'Officer Assigned', message: 'Officer Raj Kumar has been assigned to JL-2026-000001.', isRead: false },
  });

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@example.com / password123');
  console.log('  Officer: officer@example.com / password123');
  console.log('  Citizen: citizen@example.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
