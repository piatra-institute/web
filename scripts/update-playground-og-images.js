#!/usr/bin/env node

/**
 * Script to update playground page.tsx files to include custom OG images
 *
 * Usage:
 *   node scripts/update-playground-og-images.js --dry-run    # Preview changes
 *   node scripts/update-playground-og-images.js              # Apply changes
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) {
    console.log('DRY RUN MODE - No files will be modified\n');
} else {
    console.log('WRITE MODE - Files will be modified\n');
}

// Find all playground page.tsx files
function findPlaygroundPages(dir) {
    const results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results.push(...findPlaygroundPages(fullPath));
        } else if (item.name === 'page.tsx') {
            results.push(fullPath);
        }
    }
    return results;
}

const playgroundsDir = path.join(__dirname, '../app/playgrounds');
const files = findPlaygroundPages(playgroundsDir);

let updated = 0;
let skipped = 0;
let errors = 0;

files.forEach(file => {
    // Skip the main playgrounds index page
    if (file.endsWith('app/playgrounds/page.tsx')) {
        return;
    }

    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);

    // Extract the playground slug from the path
    const pathParts = file.split('/');
    const playgroundIndex = pathParts.indexOf('playgrounds');
    // The slug is the folder name containing page.tsx
    const slug = pathParts[pathParts.length - 2];

    // Check if OG image exists
    const ogImagePath = path.join(__dirname, `../public/assets-playgrounds/og/${slug}.png`);
    if (!fs.existsSync(ogImagePath)) {
        console.log(`SKIP (no OG image): ${relativePath}`);
        skipped++;
        return;
    }

    // Check if already has custom images in openGraph
    if (content.includes('assets-playgrounds/og/')) {
        console.log(`SKIP (already has custom OG): ${relativePath}`);
        skipped++;
        return;
    }

    // Check if has openGraph block
    if (!content.includes('openGraph:')) {
        console.log(`SKIP (no openGraph block): ${relativePath}`);
        skipped++;
        return;
    }

    // Add images to openGraph
    const ogImageUrl = `https://piatra.institute/assets-playgrounds/og/${slug}.png`;

    // Replace pattern: add images array after the description line in openGraph
    // Handle escaped quotes in descriptions
    let newContent = content.replace(
        /(openGraph:\s*\{[^}]*description:\s*'(?:[^'\\]|\\.)*',?)(\s*\},)/s,
        `$1\n        images: [\n            {\n                url: '${ogImageUrl}',\n            },\n        ],$2`
    );

    // Also try with double quotes
    if (newContent === content) {
        newContent = content.replace(
            /(openGraph:\s*\{[^}]*description:\s*"(?:[^"\\]|\\.)*",?)(\s*\},)/s,
            `$1\n        images: [\n            {\n                url: '${ogImageUrl}',\n            },\n        ],$2`
        );
    }

    if (newContent === content) {
        console.log(`SKIP (couldn't match pattern): ${relativePath}`);
        skipped++;
        return;
    }

    if (DRY_RUN) {
        console.log(`WOULD UPDATE: ${relativePath}`);
        console.log(`  OG Image: ${ogImageUrl}`);
    } else {
        try {
            fs.writeFileSync(file, newContent);
            console.log(`UPDATED: ${relativePath}`);
            updated++;
        } catch (err) {
            console.log(`ERROR: ${relativePath} - ${err.message}`);
            errors++;
        }
    }
});

console.log('\n' + '='.repeat(50));
if (DRY_RUN) {
    console.log(`Summary (DRY RUN):`);
    console.log(`  Would update: ${files.length - skipped} files`);
    console.log(`  Skipped: ${skipped} files`);
} else {
    console.log(`Summary:`);
    console.log(`  Updated: ${updated} files`);
    console.log(`  Skipped: ${skipped} files`);
    console.log(`  Errors: ${errors} files`);
}
