// scripts/generate-icons.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const INPUT_SVG = 'assets/icon.svg';
const OUTPUT_DIR = 'public/icon';
const SIZES = [16, 32, 48, 98, 128];

// --- LOGIC ---
async function generateIcons() {
  // 1. Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Resolve absolute path for clarity
  const fullInputPath = path.resolve(INPUT_SVG);
  
  console.log(`Processing file: ${path.basename(fullInputPath)}`);
  console.log('----------------------------------------');

  // 2. Loop through sizes and convert
  for (const size of SIZES) {
    const fileName = `icon-${size}.png`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    try {
      await sharp(INPUT_SVG)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`[OK] Generated ${size}px: ${fileName}`);
    } catch (err) {
      console.error(`[ERROR] Failed to generate size ${size}:`, err.message);
      
      if (err.message.includes('Input file is missing')) {
        console.error(`> Please check if "${INPUT_SVG}" exists.`);
      }
    }
  }

  console.log('----------------------------------------');
  console.log(`Completed. Output location: ${OUTPUT_DIR}`);
}

generateIcons();