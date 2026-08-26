-- Seed Initial GHMC Zones (Tenants)
INSERT INTO zones (id, code, name, district, status)
VALUES 
    ('zone-khairatabad', 'KHAIRATABAD', 'Khairatabad Zone', 'Hyderabad Central', 'ACTIVE'),
    ('zone-secunderabad', 'SECUNDERABAD', 'Secunderabad Zone', 'Hyderabad North', 'ACTIVE'),
    ('zone-serilingampally', 'SERILINGAMPALLY', 'Serilingampally Zone', 'Hyderabad West', 'ACTIVE'),
    ('zone-charminar', 'CHARMINAR', 'Charminar Zone', 'Hyderabad South', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- Seed Demo Users for all 4 Roles
-- Password for all seed users: "ghmc123"
INSERT INTO users (id, email, password, full_name, phone, role, zone_id, assigned_ward)
VALUES
    ('user-comm-1', 'commissioner@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Shri V. Lokesh Kumar (IAS)', '+91-9876543210', 'ROLE_MUNICIPAL_COMMISSIONER', 'zone-khairatabad', NULL),
    ('user-zonal-1', 'zonal.khairatabad@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Rajesh Sharma (Zonal Comm.)', '+91-9876543211', 'ROLE_ZONAL_COMMISSIONER', 'zone-khairatabad', NULL),
    ('user-inspector-91', 'inspector.ward91@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Ramesh (Ward 91)', '+91-9876543291', 'ROLE_WARD_INSPECTOR', 'zone-khairatabad', 'Ward 91'),
    ('user-inspector-92', 'inspector.ward92@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Priya (Ward 92)', '+91-9876543292', 'ROLE_WARD_INSPECTOR', 'zone-khairatabad', 'Ward 92'),
    ('user-inspector-93', 'inspector.ward93@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Srinivas (Ward 93)', '+91-9876543293', 'ROLE_WARD_INSPECTOR', 'zone-khairatabad', 'Ward 93'),
    ('user-inspector-94', 'inspector.ward94@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Suresh Kumar (Ward 94)', '+91-9876543294', 'ROLE_WARD_INSPECTOR', 'zone-khairatabad', 'Ward 94'),
    ('user-inspector-1', 'inspector.khairatabad@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Suresh Kumar (Ward 94)', '+91-9876543212', 'ROLE_WARD_INSPECTOR', 'zone-khairatabad', 'Ward 94'),
    ('user-inspector-95', 'inspector.ward95@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Anitha (Ward 95)', '+91-9876543295', 'ROLE_WARD_INSPECTOR', 'zone-khairatabad', 'Ward 95'),
    ('user-zonal-2', 'zonal.secunderabad@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Anitha Reddy (Zonal Comm.)', '+91-9876543213', 'ROLE_ZONAL_COMMISSIONER', 'zone-secunderabad', NULL),
    ('user-inspector-2', 'inspector.secunderabad@ghmc.gov.in', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Inspector Ramesh Rao', '+91-9876543214', 'ROLE_WARD_INSPECTOR', 'zone-secunderabad', NULL),
    ('user-citizen-1', 'citizen.ravi@gmail.com', '$2a$10$w8T0iLz6Xy.zT4fA.hRZOe7bJpS8n6cE0G.Pq1f2e3d4c5b6a7b8c', 'Ravi Teja', '+91-9988776655', 'ROLE_CITIZEN', 'zone-khairatabad', NULL)
ON CONFLICT (email) DO NOTHING;

-- Seed Concise, High-Quality Mock Grievances across Wards 91 to 95 for Khairatabad & Other Zones
INSERT INTO grievances (id, title, category, description, status, location, ward_no, citizen_id, zone_id, created_at)
VALUES
    ('grv-201', 'Pothole Repair Needed on Main Road', 'ROADS', 'Large pothole near Khairatabad Circle causing traffic slowdowns and hazard.', 'SUBMITTED', 'Khairatabad Main Circle', 'Ward 91', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '4 HOURS'),
    ('grv-202', 'Streetlight Darkness on Road 45', 'ELECTRICAL', 'Streetlights completely dark from Jubilee Hills Checkpost to Road 45.', 'IN_PROGRESS', 'Road 45, Jubilee Hills', 'Ward 92', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '3 HOURS'),
    ('grv-203', 'Garbage Bin Overflowing at Colony Park', 'SANITATION', 'Garbage bin overflowing near Colony Park causing foul odor.', 'SUBMITTED', 'Banjara Hills East Park', 'Ward 93', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '2 HOURS'),
    ('grv-204', 'Drainage Water Overflow near Metro Station', 'DRAINAGE', 'Drainage leakage creating stagnant water pool near Metro Entrance.', 'RESOLVED', 'Banjara Hills Road 12 Metro', 'Ward 94', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '1 HOUR'),
    ('grv-205', 'Drinking Water Pipeline Leakage', 'DRAINAGE', 'Fresh water leaking from main distribution pipe near Somajiguda Circle.', 'SUBMITTED', 'Somajiguda Circle', 'Ward 95', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '30 MINUTES'),
    ('grv-206', 'Broken Divider on Banjara Hills Road 12', 'ROADS', 'Concrete divider broken due to vehicle impact, requiring immediate repair.', 'IN_PROGRESS', 'Road 12, Banjara Hills', 'Ward 94', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '20 MINUTES'),
    ('grv-207', 'Streetlight Pole Damaged in Ward 91', 'ELECTRICAL', 'Damaged electric pole wire exposed near Khairatabad School.', 'RESOLVED', 'Near Government School', 'Ward 91', 'user-citizen-1', 'zone-khairatabad', NOW() - INTERVAL '10 MINUTES')
ON CONFLICT (id) DO NOTHING;

-- Seed 5 Mock Notifications per User Role and Ward Inspector
INSERT INTO notifications (id, recipient_role, recipient_email, zone_code, title, message, type, grievance_id, created_at, read_status)
VALUES
    -- Citizen Notifications (5 items)
    ('ntf-c1', 'ROLE_CITIZEN', 'citizen.ravi@gmail.com', 'KHAIRATABAD', '✅ Grievance Resolved', 'Your complaint ''Drainage Water Overflow near Metro Station'' (ID: grv-204) has been resolved by Inspector Suresh Kumar (Ward 94).', 'RESOLVED', 'grv-204', NOW() - INTERVAL '50 MINUTES', false),
    ('ntf-c2', 'ROLE_CITIZEN', 'citizen.ravi@gmail.com', 'KHAIRATABAD', 'ℹ️ Complaint Status Updated', 'Your complaint ''Streetlight Darkness on Road 45'' (ID: grv-202) is now IN_PROGRESS.', 'STATUS_UPDATED', 'grv-202', NOW() - INTERVAL '40 MINUTES', false),
    ('ntf-c3', 'ROLE_CITIZEN', 'citizen.ravi@gmail.com', 'KHAIRATABAD', '✅ Grievance Resolved', 'Your complaint ''Streetlight Pole Damaged in Ward 91'' (ID: grv-207) has been successfully resolved.', 'RESOLVED', 'grv-207', NOW() - INTERVAL '30 MINUTES', false),
    ('ntf-c4', 'ROLE_CITIZEN', 'citizen.ravi@gmail.com', 'KHAIRATABAD', '🚨 Grievance Acknowledged', 'Your civic complaint ''Pothole Repair Needed on Main Road'' (ID: grv-201) has been assigned to Inspector Ramesh (Ward 91).', 'NEW_GRIEVANCE', 'grv-201', NOW() - INTERVAL '20 MINUTES', false),
    ('ntf-c5', 'ROLE_CITIZEN', 'citizen.ravi@gmail.com', 'KHAIRATABAD', 'ℹ️ Field Inspection Scheduled', 'Field inspection team dispatched for ''Garbage Bin Overflowing at Colony Park'' (ID: grv-203).', 'STATUS_UPDATED', 'grv-203', NOW() - INTERVAL '10 MINUTES', false),

    -- Inspector Ward 91 Notifications (5 items)
    ('ntf-w91-1', NULL, 'inspector.ward91@ghmc.gov.in', 'KHAIRATABAD', '🚨 New Civic Grievance Reported', 'New complaint ''Pothole Repair Needed on Main Road'' (ID: grv-201) filed in KHAIRATABAD Zone (Ward 91).', 'NEW_GRIEVANCE', 'grv-201', NOW() - INTERVAL '55 MINUTES', false),
    ('ntf-w91-2', NULL, 'inspector.ward91@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ High Priority Alert', 'Road patch work inspection scheduled for Ward 91 (Khairatabad Central).', 'STATUS_UPDATED', 'grv-201', NOW() - INTERVAL '45 MINUTES', false),
    ('ntf-w91-3', NULL, 'inspector.ward91@ghmc.gov.in', 'KHAIRATABAD', '✅ Grievance Resolved', 'Complaint ''Streetlight Pole Damaged in Ward 91'' (ID: grv-207) marked as RESOLVED.', 'RESOLVED', 'grv-207', NOW() - INTERVAL '35 MINUTES', false),
    ('ntf-w91-4', NULL, 'inspector.ward91@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Inspection Task Assigned', 'Daily morning sanitation & pothole audit logged for Ward 91.', 'STATUS_UPDATED', 'grv-201', NOW() - INTERVAL '25 MINUTES', false),
    ('ntf-w91-5', NULL, 'inspector.ward91@ghmc.gov.in', 'KHAIRATABAD', '🚨 Ward Emergency Alert', 'Monsoon drainage channel check requested for Ward 91.', 'NEW_GRIEVANCE', 'grv-201', NOW() - INTERVAL '15 MINUTES', false),

    -- Inspector Ward 92 Notifications (5 items)
    ('ntf-w92-1', NULL, 'inspector.ward92@ghmc.gov.in', 'KHAIRATABAD', '🚨 New Civic Grievance Reported', 'New complaint ''Streetlight Darkness on Road 45'' (ID: grv-202) filed in KHAIRATABAD Zone (Ward 92).', 'NEW_GRIEVANCE', 'grv-202', NOW() - INTERVAL '55 MINUTES', false),
    ('ntf-w92-2', NULL, 'inspector.ward92@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Complaint Status Updated', 'Complaint ''Streetlight Darkness'' status updated to IN_PROGRESS.', 'STATUS_UPDATED', 'grv-202', NOW() - INTERVAL '45 MINUTES', false),
    ('ntf-w92-3', NULL, 'inspector.ward92@ghmc.gov.in', 'KHAIRATABAD', '🚨 Electrical Hazard Alert', 'Transformer check required near Jubilee Hills Road 45.', 'NEW_GRIEVANCE', 'grv-202', NOW() - INTERVAL '35 MINUTES', false),
    ('ntf-w92-4', NULL, 'inspector.ward92@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Citizen Follow-Up', 'Resident requested update on Road 45 streetlight wiring.', 'STATUS_UPDATED', 'grv-202', NOW() - INTERVAL '25 MINUTES', false),
    ('ntf-w92-5', NULL, 'inspector.ward92@ghmc.gov.in', 'KHAIRATABAD', '✅ Field Work Completed', 'Underground electrical cable repairs completed in Ward 92.', 'RESOLVED', 'grv-202', NOW() - INTERVAL '15 MINUTES', false),

    -- Inspector Ward 93 Notifications (5 items)
    ('ntf-w93-1', NULL, 'inspector.ward93@ghmc.gov.in', 'KHAIRATABAD', '🚨 New Civic Grievance Reported', 'New complaint ''Garbage Bin Overflowing at Colony Park'' (ID: grv-203) filed in KHAIRATABAD Zone (Ward 93).', 'NEW_GRIEVANCE', 'grv-203', NOW() - INTERVAL '55 MINUTES', false),
    ('ntf-w93-2', NULL, 'inspector.ward93@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Sanitation Action Required', 'Garbage clearance compaction truck dispatched to Banjara Hills East Park.', 'STATUS_UPDATED', 'grv-203', NOW() - INTERVAL '45 MINUTES', false),
    ('ntf-w93-3', NULL, 'inspector.ward93@ghmc.gov.in', 'KHAIRATABAD', '🚨 High Priority Sanitation', 'Public park cleanliness drive requested for Ward 93.', 'NEW_GRIEVANCE', 'grv-203', NOW() - INTERVAL '35 MINUTES', false),
    ('ntf-w93-4', NULL, 'inspector.ward93@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Weekly Ward Report', 'Weekly sanitation audit report generated for Ward 93.', 'STATUS_UPDATED', 'grv-203', NOW() - INTERVAL '25 MINUTES', false),
    ('ntf-w93-5', NULL, 'inspector.ward93@ghmc.gov.in', 'KHAIRATABAD', '✅ Sanitation Cleared', 'Garbage bin emptied and sanitized near Colony Park.', 'RESOLVED', 'grv-203', NOW() - INTERVAL '15 MINUTES', false),

    -- Inspector Ward 94 Notifications (5 items)
    ('ntf-w94-1', NULL, 'inspector.ward94@ghmc.gov.in', 'KHAIRATABAD', '🚨 New Civic Grievance Reported', 'New complaint ''Drainage Water Overflow near Metro Station'' (ID: grv-204) filed in KHAIRATABAD Zone (Ward 94).', 'NEW_GRIEVANCE', 'grv-204', NOW() - INTERVAL '55 MINUTES', false),
    ('ntf-w94-2', NULL, 'inspector.ward94@ghmc.gov.in', 'KHAIRATABAD', '✅ Grievance Resolved', 'Complaint ''Drainage Water Overflow'' (ID: grv-204) marked as RESOLVED by Inspector Suresh Kumar.', 'RESOLVED', 'grv-204', NOW() - INTERVAL '45 MINUTES', false),
    ('ntf-w94-3', NULL, 'inspector.ward94@ghmc.gov.in', 'KHAIRATABAD', '🚨 New Civic Grievance Reported', 'New complaint ''Broken Divider on Banjara Hills Road 12'' (ID: grv-206) filed in Ward 94.', 'NEW_GRIEVANCE', 'grv-206', NOW() - INTERVAL '35 MINUTES', false),
    ('ntf-w94-4', NULL, 'inspector.ward94@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Status Update', 'Divider repair work status updated to IN_PROGRESS on Road 12.', 'STATUS_UPDATED', 'grv-206', NOW() - INTERVAL '25 MINUTES', false),
    ('ntf-w94-5', NULL, 'inspector.ward94@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Traffic Advisory', 'Road 12 maintenance and drainage clearing completed for Ward 94.', 'STATUS_UPDATED', 'grv-204', NOW() - INTERVAL '15 MINUTES', false),

    -- Inspector Ward 95 Notifications (5 items)
    ('ntf-w95-1', NULL, 'inspector.ward95@ghmc.gov.in', 'KHAIRATABAD', '🚨 New Civic Grievance Reported', 'New complaint ''Drinking Water Pipeline Leakage'' (ID: grv-205) filed in KHAIRATABAD Zone (Ward 95).', 'NEW_GRIEVANCE', 'grv-205', NOW() - INTERVAL '55 MINUTES', false),
    ('ntf-w95-2', NULL, 'inspector.ward95@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Water Works Dispatch', 'HMWSSB pipeline repair engineering crew dispatched for Somajiguda Circle.', 'STATUS_UPDATED', 'grv-205', NOW() - INTERVAL '45 MINUTES', false),
    ('ntf-w95-3', NULL, 'inspector.ward95@ghmc.gov.in', 'KHAIRATABAD', '🚨 Water Stagnation Warning', 'Water accumulation reported near Somajiguda Circle.', 'NEW_GRIEVANCE', 'grv-205', NOW() - INTERVAL '35 MINUTES', false),
    ('ntf-w95-4', NULL, 'inspector.ward95@ghmc.gov.in', 'KHAIRATABAD', 'ℹ️ Ward Audit Log', 'Sanitation and water pipeline inspection logged for Ward 95.', 'STATUS_UPDATED', 'grv-205', NOW() - INTERVAL '25 MINUTES', false),
    ('ntf-w95-5', NULL, 'inspector.ward95@ghmc.gov.in', 'KHAIRATABAD', '✅ Repair Update', 'Water main distribution valve sealed in Ward 95.', 'RESOLVED', 'grv-205', NOW() - INTERVAL '15 MINUTES', false),

    -- Zonal Commissioner Notifications (5 items)
    ('ntf-zc-1', 'ROLE_ZONAL_COMMISSIONER', NULL, 'KHAIRATABAD', '🚨 Zone Civic Alert', 'New complaint ''Pothole Repair Needed on Main Road'' (ID: grv-201) filed in Khairatabad Zone.', 'NEW_GRIEVANCE', 'grv-201', NOW() - INTERVAL '50 MINUTES', false),
    ('ntf-zc-2', 'ROLE_ZONAL_COMMISSIONER', NULL, 'KHAIRATABAD', '🚨 Zone Civic Alert', 'New complaint ''Streetlight Darkness on Road 45'' (ID: grv-202) filed in Khairatabad Zone.', 'NEW_GRIEVANCE', 'grv-202', NOW() - INTERVAL '40 MINUTES', false),
    ('ntf-zc-3', 'ROLE_ZONAL_COMMISSIONER', NULL, 'KHAIRATABAD', '🚨 Zone Civic Alert', 'New complaint ''Garbage Bin Overflowing at Colony Park'' (ID: grv-203) filed in Khairatabad Zone.', 'NEW_GRIEVANCE', 'grv-203', NOW() - INTERVAL '30 MINUTES', false),
    ('ntf-zc-4', 'ROLE_ZONAL_COMMISSIONER', NULL, 'KHAIRATABAD', '✅ Grievance Resolved', 'Complaint ''Drainage Water Overflow near Metro Station'' (ID: grv-204) resolved by Ward 94 Inspector.', 'RESOLVED', 'grv-204', NOW() - INTERVAL '20 MINUTES', false),
    ('ntf-zc-5', 'ROLE_ZONAL_COMMISSIONER', NULL, 'KHAIRATABAD', '📈 Weekly Zone Summary', 'Khairatabad Zone weekly resolution efficiency reached 85%.', 'STATUS_UPDATED', 'grv-201', NOW() - INTERVAL '10 MINUTES', false),

    -- Municipal Commissioner / Super Admin Notifications (5 items)
    ('ntf-ma-1', 'ROLE_MUNICIPAL_COMMISSIONER', NULL, 'KHAIRATABAD', '👑 Executive Oversight', 'New complaint ''Pothole Repair Needed on Main Road'' filed in Khairatabad Zone.', 'NEW_GRIEVANCE', 'grv-201', NOW() - INTERVAL '50 MINUTES', false),
    ('ntf-ma-2', 'ROLE_MUNICIPAL_COMMISSIONER', NULL, 'KHAIRATABAD', '👑 Executive Oversight', 'New complaint ''Drinking Water Pipeline Leakage'' filed in Khairatabad Zone.', 'NEW_GRIEVANCE', 'grv-205', NOW() - INTERVAL '40 MINUTES', false),
    ('ntf-ma-3', 'ROLE_MUNICIPAL_COMMISSIONER', NULL, 'KHAIRATABAD', '✅ Citywide Resolution', 'Drainage complaint resolved in Khairatabad Zone (Ward 94).', 'RESOLVED', 'grv-204', NOW() - INTERVAL '30 MINUTES', false),
    ('ntf-ma-4', 'ROLE_MUNICIPAL_COMMISSIONER', NULL, 'KHAIRATABAD', '📈 All-Zone Report Ready', 'Monthly All-Zones combined civic performance metrics report compiled.', 'STATUS_UPDATED', 'grv-201', NOW() - INTERVAL '20 MINUTES', false),
    ('ntf-ma-5', 'ROLE_MUNICIPAL_COMMISSIONER', NULL, 'KHAIRATABAD', '🚨 High Priority Flag', 'Monsoon emergency preparedness verified across all 6 GHMC Zones.', 'STATUS_UPDATED', 'grv-202', NOW() - INTERVAL '10 MINUTES', false)
ON CONFLICT (id) DO NOTHING;

