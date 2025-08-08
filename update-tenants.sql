-- Update Disney to have departments but screening disabled  
UPDATE tenants 
SET settings = '{"departments": [], "screening_enabled": false}'
WHERE slug = 'disney';

-- Update Virgin to have departments but screening disabled
UPDATE tenants 
SET settings = '{"departments": [], "screening_enabled": false}' 
WHERE slug = 'virgin';

-- Verify the updates
SELECT name, slug, settings FROM tenants ORDER BY name;