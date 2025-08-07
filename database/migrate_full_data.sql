-- Complete data migration for Disney containers to match current interface

-- Clear existing sample containers first (optional)
-- DELETE FROM containers WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'disney');

-- Insert all Disney containers from current interface
INSERT INTO containers (tenant_id, type, name, count, status, due_date, flagged, department) VALUES 
-- Sailings department
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Magic - Eastern Caribbean', 2500, 'clear', '2025-03-21'::timestamp, 0, 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Wonder - Western Caribbean', 2400, 'clear', '2025-03-29'::timestamp, 0, 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Dream - Bahamas 4-Night', 4000, 'in-progress', '2025-04-08'::timestamp, 0, 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Fantasy - Western Caribbean', 4000, 'attention', '2025-04-25'::timestamp, 5, 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Wish - Bahamas 3-Night', 4000, 'clear', '2025-04-28'::timestamp, 0, 'sailings'),

-- Sailing Staff department
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew', 'Disney Magic - Bridge Officers', 45, 'clear', '2025-03-15'::timestamp, 0, 'sailingstaff'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew', 'Disney Wonder - Food & Beverage', 320, 'attention', '2025-03-15'::timestamp, 8, 'sailingstaff'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew', 'Disney Dream - Entertainment', 180, 'clear', '2025-03-15'::timestamp, 0, 'sailingstaff'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew', 'Disney Fantasy - Guest Services', 250, 'in-progress', '2025-03-15'::timestamp, 0, 'sailingstaff'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew', 'Disney Wish - Youth Activities', 95, 'clear', '2025-03-15'::timestamp, 0, 'sailingstaff'),

-- Vendors department
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendor', 'Disney Magic - Port Services', 85, 'clear', '2025-03-14'::timestamp, 0, 'vendors'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendor', 'Disney Wonder - Excursion Providers', 120, 'attention', '2025-03-22'::timestamp, 3, 'vendors'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendor', 'Disney Dream - Specialty Dining', 45, 'clear', '2025-04-01'::timestamp, 0, 'vendors'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendor', 'Disney Fantasy - Merchandise', 75, 'in-progress', '2025-04-18'::timestamp, 0, 'vendors'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendor', 'Disney Wish - Spa Services', 55, 'clear', '2025-04-25'::timestamp, 0, 'vendors'),

-- Front desk department
((SELECT id FROM tenants WHERE slug = 'disney'), 'guest', 'VIP Guest Arrivals', 47, 'active', '2025-03-10'::timestamp, 0, 'frontdesk'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'guest', 'Concierge Level Guests', 120, 'scheduled', '2025-03-11'::timestamp, 0, 'frontdesk'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'guest', 'Disney Vacation Club Members', 85, 'scheduled', '2025-03-15'::timestamp, 0, 'frontdesk'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'visitor', 'Media & Press', 12, 'active', '2025-03-10'::timestamp, 0, 'frontdesk');