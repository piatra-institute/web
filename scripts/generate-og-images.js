#!/usr/bin/env node

/**
 * Script to generate custom Open Graph images for each playground
 * Uses Libre Baskerville font to match the site's typography
 *
 * Usage:
 *   node scripts/generate-og-images.js --dry-run    # Preview what would be generated
 *   node scripts/generate-og-images.js              # Generate images
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    if (DRY_RUN) {
        console.log('DRY RUN MODE - No files will be created\n');
    } else {
        console.log('WRITE MODE - Files will be created\n');
    }

    // Paths
    const templatePath = path.join(__dirname, '../assets/og-playgrounds.png');
    const outputDir = path.join(__dirname, '../public/assets-playgrounds/og');
    const fontRegularPath = path.join(__dirname, '../assets/fonts/LibreBaskerville-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../assets/fonts/LibreBaskerville-Bold.ttf');

    // Check template exists
    if (!fs.existsSync(templatePath)) {
        console.error(`Template not found: ${templatePath}`);
        process.exit(1);
    }

    // Check fonts exist
    if (!fs.existsSync(fontRegularPath) || !fs.existsSync(fontBoldPath)) {
        console.error('Libre Baskerville fonts not found in assets/fonts/');
        console.error('Download them from: https://fonts.google.com/specimen/Libre+Baskerville');
        process.exit(1);
    }

    // Load fonts as base64 for SVG embedding
    const fontRegularBase64 = fs.readFileSync(fontRegularPath).toString('base64');
    const fontBoldBase64 = fs.readFileSync(fontBoldPath).toString('base64');

    // Create output directory if needed
    if (!DRY_RUN && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}\n`);
    }

    // Import playground data
    const dataPath = path.join(__dirname, '../app/playgrounds/data.ts');
    const dataContent = fs.readFileSync(dataPath, 'utf8');

    // Parse the TypeScript file to extract playground data
    const playgrounds = parsePlaygroundData(dataContent);
    console.log(`Found ${playgrounds.length} playgrounds\n`);

    // Get template dimensions
    const templateMeta = await sharp(templatePath).metadata();
    const WIDTH = templateMeta.width;
    const HEIGHT = templateMeta.height;

    console.log(`Template size: ${WIDTH}x${HEIGHT}`);
    console.log(`Using Libre Baskerville font\n`);

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const playground of playgrounds) {
        const slug = playground.link.replace('/playgrounds/', '');
        const outputPath = path.join(outputDir, `${slug}.png`);

        if (DRY_RUN) {
            console.log(`WOULD CREATE: ${slug}.png`);
            console.log(`  Name: "${playground.name}"`);
            console.log(`  Description: "${playground.description}"`);
            console.log('');
            generated++;
            continue;
        }

        try {
            // Create SVG text overlay with embedded fonts
            // Text area: from x=530 to x=1130 (shifted left)
            const textAreaStartX = 530;
            const textAreaEndX = 1130;
            const textCenterX = (textAreaStartX + textAreaEndX) / 2; // 830
            const maxTextWidth = textAreaEndX - textAreaStartX; // 600

            // Fixed Y position for title (not centered based on content)
            const titleStartY = 200;

            // Word wrap the text (title in uppercase)
            const titleLines = wrapText(playground.name.toUpperCase(), maxTextWidth, 36, true);
            const descLines = wrapText(playground.description, maxTextWidth, 22, false);

            // Calculate positioning
            const titleLineHeight = 44;
            const descLineHeight = 28;
            const gap = 24;

            // Use fixed starting Y position
            const startY = titleStartY;

            // Build SVG with embedded fonts
            let svgContent = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'Libre Baskerville';
        font-weight: 400;
        src: url(data:font/truetype;base64,${fontRegularBase64}) format('truetype');
      }
      @font-face {
        font-family: 'Libre Baskerville';
        font-weight: 700;
        src: url(data:font/truetype;base64,${fontBoldBase64}) format('truetype');
      }
    </style>
  </defs>`;

            // Title lines (cream color, bold, centered)
            let currentY = startY;
            for (const line of titleLines) {
                svgContent += `
  <text x="${textCenterX}" y="${currentY}" text-anchor="middle" font-family="'Libre Baskerville', serif" font-size="36" font-weight="700" fill="#f8fee9">${escapeXml(line)}</text>`;
                currentY += titleLineHeight;
            }

            // Description lines (gray color, regular, centered)
            currentY += gap - titleLineHeight + descLineHeight;
            for (const line of descLines) {
                svgContent += `
  <text x="${textCenterX}" y="${currentY}" text-anchor="middle" font-family="'Libre Baskerville', serif" font-size="22" font-weight="400" fill="#a1a1aa">${escapeXml(line)}</text>`;
                currentY += descLineHeight;
            }

            svgContent += '\n</svg>';

            // Composite text overlay onto template
            await sharp(templatePath)
                .composite([{
                    input: Buffer.from(svgContent),
                    top: 0,
                    left: 0,
                }])
                .png()
                .toFile(outputPath);

            console.log(`CREATED: ${slug}.png`);
            generated++;
        } catch (err) {
            console.error(`ERROR: ${slug}.png - ${err.message}`);
            errors++;
        }
    }

    console.log('\n' + '='.repeat(50));
    if (DRY_RUN) {
        console.log(`Summary (DRY RUN):`);
        console.log(`  Would generate: ${generated} images`);
    } else {
        console.log(`Summary:`);
        console.log(`  Generated: ${generated} images`);
        console.log(`  Skipped: ${skipped} images`);
        console.log(`  Errors: ${errors} images`);
    }
}

/**
 * Parse playground data from TypeScript file
 */
function parsePlaygroundData(content) {
    const playgrounds = [];

    // Match each playground object
    const objectRegex = /{\s*name:\s*['"]([^'"]*)['"]\s*,\s*link:\s*['"]([^'"]+)['"]\s*,\s*description:\s*'((?:[^'\\]|\\.)*)'/gs;

    let match;
    while ((match = objectRegex.exec(content)) !== null) {
        playgrounds.push({
            name: match[1].replace(/\\'/g, "'"),
            link: match[2],
            description: match[3].replace(/\\'/g, "'"),
        });
    }

    // Also try double-quoted descriptions
    const altRegex = /{\s*name:\s*['"]([^'"]*)['"]\s*,\s*link:\s*['"]([^'"]+)['"]\s*,\s*description:\s*"((?:[^"\\]|\\.)*)"/gs;
    while ((match = altRegex.exec(content)) !== null) {
        const existing = playgrounds.find(p => p.link === match[2]);
        if (!existing) {
            playgrounds.push({
                name: match[1].replace(/\\"/g, '"'),
                link: match[2],
                description: match[3].replace(/\\"/g, '"'),
            });
        }
    }

    return playgrounds;
}

/**
 * Simple word wrap based on character count estimation
 * Libre Baskerville is a serif font with slightly wider characters
 */
function wrapText(text, maxWidth, fontSize, isUppercase = false) {
    // Uppercase letters are wider - use different multiplier
    const avgCharWidth = isUppercase ? fontSize * 0.62 : fontSize * 0.45;
    const maxChars = Math.floor(maxWidth / avgCharWidth);

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length > maxChars && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Escape special XML characters
 */
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
