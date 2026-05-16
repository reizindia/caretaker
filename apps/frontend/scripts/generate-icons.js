/**
 * PWA Icon Generator
 *
 * Generates PNG icons for the PWA manifest.
 * Run: node scripts/generate-icons.js
 *
 * Requires: npm install canvas (or sharp)
 * Alternatively, use an online tool like https://maskable.app or https://realfavicongenerator.net
 * and place the generated icons in public/icons/
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal 1x1 pixel transparent PNG as placeholder
// Replace these with actual icons before production deployment
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const sizes = [192, 512];

sizes.forEach((size) => {
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, PLACEHOLDER_PNG);
    console.log(`Created placeholder: icon-${size}x${size}.png`);
    console.log(`⚠️  Replace with actual ${size}x${size} PNG icon before production!`);
  } else {
    console.log(`Skipped (already exists): icon-${size}x${size}.png`);
  }
});

console.log('\nIcon generation complete.');
console.log('Icon directory:', iconsDir);
console.log('\nTo create proper icons:');
console.log('1. Use https://maskable.app/editor to create a maskable icon');
console.log('2. Or use https://realfavicongenerator.net for a full icon set');
console.log('3. Place the generated files in public/icons/');
