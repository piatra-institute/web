#!/usr/bin/env node

/**
 * Generates custom Open Graph images for site surfaces that carry lots of
 * per-item detail (playgrounds, policies, ...).
 *
 * Usage:
 *   node scripts/generate-og-images.js              # All sources, missing only
 *   node scripts/generate-og-images.js --force      # All sources, regenerate all
 *   node scripts/generate-og-images.js --dry-run    # Preview only
 *   node scripts/generate-og-images.js --source=policies
 *   node scripts/generate-og-images.js --source=playgrounds
 *
 * Add a new source by extending the SOURCES registry below.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const SOURCE_ARG = (process.argv.find(a => a.startsWith('--source=')) || '').replace('--source=', '');

const ASSETS_DIR = path.join(__dirname, '../assets');
const PUBLIC_DIR = path.join(__dirname, '../public');
const APP_DIR = path.join(__dirname, '../app');

const SOURCES = {
    playgrounds: {
        dataPath: path.join(APP_DIR, 'playgrounds/data.ts'),
        outputDir: path.join(PUBLIC_DIR, 'assets-playgrounds/og'),
        parser: parsePlaygroundData,
        getSlug: (item) => item.link.replace('/playgrounds/', ''),
        getTitle: (item) => item.name,
        getDescription: (item) => item.description,
        // Uses the pre-designed playground template with left-side artwork.
        layout: 'right-offset',
        template: path.join(ASSETS_DIR, 'og-playgrounds.png'),
    },
    policies: {
        dataPath: path.join(APP_DIR, 'policies/data.ts'),
        outputDir: path.join(PUBLIC_DIR, 'assets-policies/og'),
        parser: parsePolicyData,
        getSlug: (item) => item.path,
        getTitle: (item) => item.title || item.name,
        getDescription: (item) => item.description,
        // Full-frame centered layout on a programmatically generated black
        // background; no template file required, preserving the policies
        // surface's distinct visual identity from playgrounds.
        layout: 'centered',
        template: null,
    },
};

const FONT_REGULAR = path.join(ASSETS_DIR, 'fonts/LibreBaskerville-Regular.ttf');
const FONT_BOLD = path.join(ASSETS_DIR, 'fonts/LibreBaskerville-Bold.ttf');

async function main() {
    if (!fs.existsSync(FONT_REGULAR) || !fs.existsSync(FONT_BOLD)) {
        console.error('Libre Baskerville fonts not found in assets/fonts/');
        process.exit(1);
    }
    const fontRegularB64 = fs.readFileSync(FONT_REGULAR).toString('base64');
    const fontBoldB64 = fs.readFileSync(FONT_BOLD).toString('base64');

    if (DRY_RUN) console.log('DRY RUN MODE - No files will be created\n');
    else if (FORCE) console.log('FORCE MODE - All images will be regenerated\n');
    else console.log('WRITE MODE - Only missing images will be created\n');

    const sourcesToRun = SOURCE_ARG
        ? (SOURCES[SOURCE_ARG] ? [SOURCE_ARG] : [])
        : Object.keys(SOURCES);

    if (SOURCE_ARG && sourcesToRun.length === 0) {
        console.error(`Unknown source: ${SOURCE_ARG}. Available: ${Object.keys(SOURCES).join(', ')}`);
        process.exit(1);
    }

    const totals = { generated: 0, skipped: 0, errors: 0 };

    for (const sourceName of sourcesToRun) {
        console.log(`\n=== Source: ${sourceName} ===`);
        const source = SOURCES[sourceName];

        if (!DRY_RUN && !fs.existsSync(source.outputDir)) {
            fs.mkdirSync(source.outputDir, { recursive: true });
            console.log(`Created output directory: ${source.outputDir}`);
        }

        const content = fs.readFileSync(source.dataPath, 'utf8');
        const items = source.parser(content);
        console.log(`Found ${items.length} items\n`);

        for (const item of items) {
            const slug = source.getSlug(item);
            const title = source.getTitle(item);
            const description = source.getDescription(item);
            const outputPath = path.join(source.outputDir, `${slug}.png`);
            const exists = fs.existsSync(outputPath);

            if (DRY_RUN) {
                if (exists && !FORCE) {
                    console.log(`SKIP (exists): ${slug}.png`);
                    totals.skipped++;
                } else {
                    console.log(`WOULD CREATE: ${slug}.png`);
                    console.log(`  Title: "${title}"`);
                    console.log(`  Description: "${description.slice(0, 80)}${description.length > 80 ? '...' : ''}"`);
                    totals.generated++;
                }
                continue;
            }

            if (exists && !FORCE) {
                console.log(`SKIP (exists): ${slug}.png`);
                totals.skipped++;
                continue;
            }

            try {
                await renderOg({
                    source,
                    slug,
                    title,
                    description,
                    outputPath,
                    fontRegularB64,
                    fontBoldB64,
                });
                console.log(`CREATED: ${slug}.png`);
                totals.generated++;
            } catch (err) {
                console.error(`ERROR: ${slug}.png - ${err.message}`);
                totals.errors++;
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    if (DRY_RUN) {
        console.log(`Summary (DRY RUN):\n  Would generate: ${totals.generated} images`);
    } else {
        console.log(`Summary:\n  Generated: ${totals.generated}\n  Skipped: ${totals.skipped}\n  Errors: ${totals.errors}`);
    }
}

const CANVAS = { width: 1200, height: 630 };

async function renderOg({ source, title, description, outputPath, fontRegularB64, fontBoldB64 }) {
    let width, height;
    let base;

    if (source.template) {
        const meta = await sharp(source.template).metadata();
        width = meta.width;
        height = meta.height;
        base = sharp(source.template);
    } else {
        width = CANVAS.width;
        height = CANVAS.height;
        base = sharp({
            create: {
                width,
                height,
                channels: 3,
                background: { r: 0, g: 0, b: 0 },
            },
        });
    }

    const svg = buildSvg({
        source,
        width,
        height,
        title,
        description,
        fontRegularB64,
        fontBoldB64,
    });

    await base
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toFile(outputPath);
}

function buildSvg({ source, width, height, title, description, fontRegularB64, fontBoldB64 }) {
    const layout = source.layout === 'centered'
        ? {
            textAreaStartX: 80,
            textAreaEndX: width - 80,
            titleStartY: 220,
            titleFontSize: 50,
            titleLineHeight: 60,
            descFontSize: 26,
            descLineHeight: 34,
            gap: 32,
            titleColor: '#f8fee9',
            descColor: '#a1a1aa',
            brandText: 'piatra.institute · policies',
            brandColor: '#5a5a5a',
            brandFontSize: 18,
        }
        : {
            textAreaStartX: 530,
            textAreaEndX: 1130,
            titleStartY: 200,
            titleFontSize: 36,
            titleLineHeight: 44,
            descFontSize: 22,
            descLineHeight: 28,
            gap: 24,
            titleColor: '#f8fee9',
            descColor: '#a1a1aa',
            brandText: null,
            brandColor: null,
            brandFontSize: null,
        };

    const centerX = (layout.textAreaStartX + layout.textAreaEndX) / 2;
    const maxTextWidth = layout.textAreaEndX - layout.textAreaStartX;

    const titleLines = wrapText(title.toUpperCase(), maxTextWidth, layout.titleFontSize, true);
    const descLines = wrapText(description, maxTextWidth, layout.descFontSize, false);

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'Libre Baskerville';
        font-weight: 400;
        src: url(data:font/truetype;base64,${fontRegularB64}) format('truetype');
      }
      @font-face {
        font-family: 'Libre Baskerville';
        font-weight: 700;
        src: url(data:font/truetype;base64,${fontBoldB64}) format('truetype');
      }
    </style>
  </defs>`;

    let currentY = layout.titleStartY;
    for (const line of titleLines) {
        svg += `
  <text x="${centerX}" y="${currentY}" text-anchor="middle" font-family="'Libre Baskerville', serif" font-size="${layout.titleFontSize}" font-weight="700" fill="${layout.titleColor}">${escapeXml(line)}</text>`;
        currentY += layout.titleLineHeight;
    }

    currentY += layout.gap - layout.titleLineHeight + layout.descLineHeight;
    for (const line of descLines) {
        svg += `
  <text x="${centerX}" y="${currentY}" text-anchor="middle" font-family="'Libre Baskerville', serif" font-size="${layout.descFontSize}" font-weight="400" fill="${layout.descColor}">${escapeXml(line)}</text>`;
        currentY += layout.descLineHeight;
    }

    if (layout.brandText) {
        svg += `
  <text x="${centerX}" y="${height - 60}" text-anchor="middle" font-family="'Libre Baskerville', serif" font-size="${layout.brandFontSize}" font-weight="400" fill="${layout.brandColor}">${escapeXml(layout.brandText)}</text>`;
    }

    svg += '\n</svg>';
    return svg;
}

function parsePlaygroundData(content) {
    const playgrounds = [];
    const regex = /{\s*name:\s*['"]([^'"]*)['"]\s*,\s*link:\s*['"]([^'"]+)['"]\s*,\s*description:\s*'((?:[^'\\]|\\.)*)'/gs;
    let m;
    while ((m = regex.exec(content)) !== null) {
        playgrounds.push({
            name: m[1].replace(/\\'/g, "'"),
            link: m[2],
            description: m[3].replace(/\\'/g, "'"),
        });
    }
    const altRegex = /{\s*name:\s*['"]([^'"]*)['"]\s*,\s*link:\s*['"]([^'"]+)['"]\s*,\s*description:\s*"((?:[^"\\]|\\.)*)"/gs;
    while ((m = altRegex.exec(content)) !== null) {
        const existing = playgrounds.find(p => p.link === m[2]);
        if (!existing) {
            playgrounds.push({
                name: m[1].replace(/\\"/g, '"'),
                link: m[2],
                description: m[3].replace(/\\"/g, '"'),
            });
        }
    }
    return playgrounds;
}

function parsePolicyData(content) {
    const policies = [];
    const pathRegex = /\{\s*path:\s*'([^']+)'/g;
    const starts = [];
    let m;
    while ((m = pathRegex.exec(content)) !== null) {
        starts.push({ index: m.index, path: m[1] });
    }
    for (let i = 0; i < starts.length; i++) {
        const s = starts[i];
        const endIdx = i + 1 < starts.length ? starts[i + 1].index : content.length;
        const body = content.substring(s.index, endIdx);
        const titleMatch = body.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
        const nameMatch = body.match(/name:\s*'((?:[^'\\]|\\.)*)'/);
        const descMatch = body.match(/description:\s*'((?:[^'\\]|\\.)*)'/);
        policies.push({
            path: s.path,
            title: titleMatch ? titleMatch[1].replace(/\\'/g, "'") : undefined,
            name: nameMatch ? nameMatch[1].replace(/\\'/g, "'") : s.path,
            description: descMatch ? descMatch[1].replace(/\\'/g, "'") : '',
        });
    }
    return policies;
}

function wrapText(text, maxWidth, fontSize, isUppercase = false) {
    const avgCharWidth = isUppercase ? fontSize * 0.62 : fontSize * 0.45;
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const w of words) {
        const t = current ? `${current} ${w}` : w;
        if (t.length > maxChars && current) {
            lines.push(current);
            current = w;
        } else {
            current = t;
        }
    }
    if (current) lines.push(current);
    return lines;
}

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
