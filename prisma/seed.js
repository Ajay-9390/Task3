"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Prisma database seeding for GHMC Governance Portal...');
    // 1. Seed Zones
    const zonesData = [
        { id: 'zone-khairatabad', code: 'KHAIRATABAD', name: 'Khairatabad Zone', district: 'Hyderabad Central', status: 'ACTIVE' },
        { id: 'zone-secunderabad', code: 'SECUNDERABAD', name: 'Secunderabad Zone', district: 'Hyderabad North', status: 'ACTIVE' },
        { id: 'zone-serilingampally', code: 'SERILINGAMPALLY', name: 'Serilingampally Zone', district: 'Hyderabad West', status: 'ACTIVE' },
        { id: 'zone-charminar', code: 'CHARMINAR', name: 'Charminar Zone', district: 'Hyderabad South', status: 'ACTIVE' }
    ];
    for (const z of zonesData) {
        await prisma.zone.upsert({
            where: { code: z.code },
            update: z,
            create: z
        });
    }
    console.log('✅ Zones seeded');
    // Password hash for 'ghmc123'
    const hashedPassword = await bcryptjs_1.default.hash('ghmc123', 10);
    // 2. Seed Users
    const usersData = [
        { id: 'user-comm-1', email: 'commissioner@ghmc.gov.in', password: hashedPassword, fullName: 'Shri V. Lokesh Kumar (IAS)', phone: '+91-9876543210', role: 'ROLE_MUNICIPAL_COMMISSIONER', zoneId: 'zone-khairatabad', assignedWard: null },
        { id: 'user-zonal-1', email: 'zonal.khairatabad@ghmc.gov.in', password: hashedPassword, fullName: 'Rajesh Sharma (Zonal Comm.)', phone: '+91-9876543211', role: 'ROLE_ZONAL_COMMISSIONER', zoneId: 'zone-khairatabad', assignedWard: null },
        { id: 'user-inspector-91', email: 'inspector.ward91@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Ramesh (Ward 91)', phone: '+91-9876543291', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-khairatabad', assignedWard: 'Ward 91' },
        { id: 'user-inspector-92', email: 'inspector.ward92@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Priya (Ward 92)', phone: '+91-9876543292', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-khairatabad', assignedWard: 'Ward 92' },
        { id: 'user-inspector-93', email: 'inspector.ward93@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Srinivas (Ward 93)', phone: '+91-9876543293', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-khairatabad', assignedWard: 'Ward 93' },
        { id: 'user-inspector-94', email: 'inspector.ward94@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Suresh Kumar (Ward 94)', phone: '+91-9876543294', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-khairatabad', assignedWard: 'Ward 94' },
        { id: 'user-inspector-1', email: 'inspector.khairatabad@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Suresh Kumar (Ward 94)', phone: '+91-9876543212', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-khairatabad', assignedWard: 'Ward 94' },
        { id: 'user-inspector-95', email: 'inspector.ward95@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Anitha (Ward 95)', phone: '+91-9876543295', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-khairatabad', assignedWard: 'Ward 95' },
        { id: 'user-zonal-2', email: 'zonal.secunderabad@ghmc.gov.in', password: hashedPassword, fullName: 'Anitha Reddy (Zonal Comm.)', phone: '+91-9876543213', role: 'ROLE_ZONAL_COMMISSIONER', zoneId: 'zone-secunderabad', assignedWard: null },
        { id: 'user-inspector-2', email: 'inspector.secunderabad@ghmc.gov.in', password: hashedPassword, fullName: 'Inspector Ramesh Rao', phone: '+91-9876543214', role: 'ROLE_WARD_INSPECTOR', zoneId: 'zone-secunderabad', assignedWard: null },
        { id: 'user-citizen-1', email: 'citizen.ravi@gmail.com', password: hashedPassword, fullName: 'Ravi Teja', phone: '+91-9988776655', role: 'ROLE_CITIZEN', zoneId: 'zone-khairatabad', assignedWard: null }
    ];
    for (const u of usersData) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: u,
            create: u
        });
    }
    console.log('✅ Users seeded');
    // 3. Seed Grievances
    const now = new Date();
    const grievancesData = [
        { id: 'grv-201', title: 'Pothole Repair Needed on Main Road', category: 'ROADS', description: 'Large pothole near Khairatabad Circle causing traffic slowdowns and hazard.', status: 'SUBMITTED', location: 'Khairatabad Main Circle', wardNo: 'Ward 91', beforePhotoUrl: '/uploads/pothole_before.jpg', afterPhotoUrl: null, citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 4 * 3600000) },
        { id: 'grv-202', title: 'Streetlight Darkness on Road 45', category: 'ELECTRICAL', description: 'Streetlights completely dark from Jubilee Hills Checkpost to Road 45.', status: 'IN_PROGRESS', location: 'Road 45, Jubilee Hills', wardNo: 'Ward 92', beforePhotoUrl: '/uploads/streetlight_dark_before.jpg', afterPhotoUrl: null, citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 3 * 3600000) },
        { id: 'grv-203', title: 'Garbage Bin Overflowing at Colony Park', category: 'SANITATION', description: 'Garbage bin overflowing near Colony Park causing foul odor.', status: 'SUBMITTED', location: 'Banjara Hills East Park', wardNo: 'Ward 93', beforePhotoUrl: '/uploads/garbage_overflow_before.jpg', afterPhotoUrl: null, citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 2 * 3600000) },
        { id: 'grv-204', title: 'Drainage Water Overflow near Metro Station', category: 'DRAINAGE', description: 'Drainage leakage creating stagnant water pool near Metro Entrance.', status: 'RESOLVED', location: 'Banjara Hills Road 12 Metro', wardNo: 'Ward 94', beforePhotoUrl: '/uploads/drainage_overflow_before.jpg', afterPhotoUrl: '/uploads/drainage_clean_after.jpg', citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 1 * 3600000) },
        { id: 'grv-205', title: 'Drinking Water Pipeline Leakage', category: 'DRAINAGE', description: 'Fresh water leaking from main distribution pipe near Somajiguda Circle.', status: 'SUBMITTED', location: 'Somajiguda Circle', wardNo: 'Ward 95', beforePhotoUrl: '/uploads/water_leak_before.jpg', afterPhotoUrl: null, citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 30 * 60000) },
        { id: 'grv-206', title: 'Broken Divider on Banjara Hills Road 12', category: 'ROADS', description: 'Concrete divider broken due to vehicle impact, requiring immediate repair.', status: 'IN_PROGRESS', location: 'Road 12, Banjara Hills', wardNo: 'Ward 94', beforePhotoUrl: '/uploads/broken_divider_before.jpg', afterPhotoUrl: null, citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 20 * 60000) },
        { id: 'grv-207', title: 'Streetlight Pole Damaged in Ward 91', category: 'ELECTRICAL', description: 'Damaged electric pole wire exposed near Khairatabad School.', status: 'RESOLVED', location: 'Near Government School', wardNo: 'Ward 91', beforePhotoUrl: '/uploads/damaged_pole_before.jpg', afterPhotoUrl: '/uploads/repaired_pole_after.jpg', citizenId: 'user-citizen-1', zoneId: 'zone-khairatabad', createdAt: new Date(now.getTime() - 10 * 60000) }
    ];
    for (const g of grievancesData) {
        await prisma.grievance.upsert({
            where: { id: g.id },
            update: g,
            create: g
        });
    }
    console.log('✅ Grievances seeded');
    // 4. Seed Notifications
    const notificationsData = [
        { id: 'ntf-c1', recipientRole: 'ROLE_CITIZEN', recipientEmail: 'citizen.ravi@gmail.com', zoneCode: 'KHAIRATABAD', title: '✅ Grievance Resolved', message: "Your complaint 'Drainage Water Overflow near Metro Station' (ID: grv-204) has been resolved by Inspector Suresh Kumar (Ward 94).", type: 'RESOLVED', grievanceId: 'grv-204', readStatus: false },
        { id: 'ntf-c2', recipientRole: 'ROLE_CITIZEN', recipientEmail: 'citizen.ravi@gmail.com', zoneCode: 'KHAIRATABAD', title: 'ℹ️ Complaint Status Updated', message: "Your complaint 'Streetlight Darkness on Road 45' (ID: grv-202) is now IN_PROGRESS.", type: 'STATUS_UPDATED', grievanceId: 'grv-202', readStatus: false },
        { id: 'ntf-c3', recipientRole: 'ROLE_CITIZEN', recipientEmail: 'citizen.ravi@gmail.com', zoneCode: 'KHAIRATABAD', title: '✅ Grievance Resolved', message: "Your complaint 'Streetlight Pole Damaged in Ward 91' (ID: grv-207) has been successfully resolved.", type: 'RESOLVED', grievanceId: 'grv-207', readStatus: false },
        { id: 'ntf-c4', recipientRole: 'ROLE_CITIZEN', recipientEmail: 'citizen.ravi@gmail.com', zoneCode: 'KHAIRATABAD', title: '🚨 Grievance Acknowledged', message: "Your civic complaint 'Pothole Repair Needed on Main Road' (ID: grv-201) has been assigned to Inspector Ramesh (Ward 91).", type: 'NEW_GRIEVANCE', grievanceId: 'grv-201', readStatus: false },
        { id: 'ntf-c5', recipientRole: 'ROLE_CITIZEN', recipientEmail: 'citizen.ravi@gmail.com', zoneCode: 'KHAIRATABAD', title: 'ℹ️ Field Inspection Scheduled', message: "Field inspection team dispatched for 'Garbage Bin Overflowing at Colony Park' (ID: grv-203).", type: 'STATUS_UPDATED', grievanceId: 'grv-203', readStatus: false },
        { id: 'ntf-w91-1', recipientRole: null, recipientEmail: 'inspector.ward91@ghmc.gov.in', zoneCode: 'KHAIRATABAD', title: '🚨 New Civic Grievance Reported', message: "New complaint 'Pothole Repair Needed on Main Road' (ID: grv-201) filed in KHAIRATABAD Zone (Ward 91).", type: 'NEW_GRIEVANCE', grievanceId: 'grv-201', readStatus: false },
        { id: 'ntf-w91-2', recipientRole: null, recipientEmail: 'inspector.ward91@ghmc.gov.in', zoneCode: 'KHAIRATABAD', title: 'ℹ️ High Priority Alert', message: 'Road patch work inspection scheduled for Ward 91 (Khairatabad Central).', type: 'STATUS_UPDATED', grievanceId: 'grv-201', readStatus: false },
        { id: 'ntf-w91-3', recipientRole: null, recipientEmail: 'inspector.ward91@ghmc.gov.in', zoneCode: 'KHAIRATABAD', title: '✅ Grievance Resolved', message: "Complaint 'Streetlight Pole Damaged in Ward 91' (ID: grv-207) marked as RESOLVED.", type: 'RESOLVED', grievanceId: 'grv-207', readStatus: false },
        { id: 'ntf-zc-1', recipientRole: 'ROLE_ZONAL_COMMISSIONER', recipientEmail: null, zoneCode: 'KHAIRATABAD', title: '🚨 Zone Civic Alert', message: "New complaint 'Pothole Repair Needed on Main Road' (ID: grv-201) filed in Khairatabad Zone.", type: 'NEW_GRIEVANCE', grievanceId: 'grv-201', readStatus: false },
        { id: 'ntf-ma-1', recipientRole: 'ROLE_MUNICIPAL_COMMISSIONER', recipientEmail: null, zoneCode: 'KHAIRATABAD', title: '👑 Executive Oversight', message: "New complaint 'Pothole Repair Needed on Main Road' filed in Khairatabad Zone.", type: 'NEW_GRIEVANCE', grievanceId: 'grv-201', readStatus: false }
    ];
    for (const n of notificationsData) {
        await prisma.notification.upsert({
            where: { id: n.id },
            update: n,
            create: n
        });
    }
    console.log('✅ Notifications seeded');
    console.log('🎉 Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
