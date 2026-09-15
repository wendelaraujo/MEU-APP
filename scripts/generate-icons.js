import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const iconSvg = fs.readFileSync(path.resolve('public/icon.svg'));
  const maskableSvg = fs.readFileSync(path.resolve('public/icon-maskable.svg'));

  await sharp(iconSvg).resize(192, 192).png().toFile('public/pwa-192x192.png');
  console.log('Created public/pwa-192x192.png');

  await sharp(iconSvg).resize(512, 512).png().toFile('public/pwa-512x512.png');
  console.log('Created public/pwa-512x512.png');

  await sharp(maskableSvg).resize(512, 512).png().toFile('public/pwa-maskable-512x512.png');
  console.log('Created public/pwa-maskable-512x512.png');

  await sharp(iconSvg).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('Created public/apple-touch-icon.png');

  await sharp(iconSvg).resize(64, 64).png().toFile('public/favicon.png');
  console.log('Created public/favicon.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
