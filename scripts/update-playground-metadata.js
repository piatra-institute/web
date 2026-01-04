#!/usr/bin/env node

/**
 * Script to update playground page.tsx files to use defaultOpenGraph format
 *
 * Usage:
 *   node scripts/update-playground-metadata.js --dry-run    # Preview changes
 *   node scripts/update-playground-metadata.js              # Apply changes
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
} else {
    console.log('✏️  WRITE MODE - Files will be modified\n');
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

    // Skip if already has defaultOpenGraph
    if (content.includes('defaultOpenGraph')) {
        console.log(`⏭️  SKIP (already updated): ${relativePath}`);
        skipped++;
        return;
    }

    // Extract title and description from old format
    // Handle escaped quotes in strings (e.g., Judea Pearl\'s)
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"],?/);
    // Match description more carefully - find the description line and extract content
    const descLineMatch = content.match(/description:\s*'((?:[^'\\]|\\.)*)'/s) ||
                          content.match(/description:\s*"((?:[^"\\]|\\.)*)"/s);
    const descMatch = descLineMatch ? [null, descLineMatch[1].replace(/\\'/g, "'")] : null;

    let playgroundName, description;

    if (!titleMatch) {
        // No metadata - derive name from folder path
        const folderName = path.basename(path.dirname(file));
        playgroundName = folderName.replace(/-/g, ' ');
        description = '';
        console.log(`📝 NOTE: No metadata found, using folder name: "${playgroundName}"`);
    } else {
        // Extract playground name from old title (remove ' | Piatra Institute' suffix)
        playgroundName = titleMatch[1]
            .replace(/\s*\|\s*Piatra Institute/i, '')
            .replace(/\s*-\s*Piatra Institute/i, '')
            .replace(/\s*·\s*playgrounds/i, '')
            .trim();
        description = descMatch ? descMatch[1] : '';
    }

    // Clean up any remaining escape sequences
    description = description.replace(/\\'/g, "'").replace(/\\"/g, '"');

    // Escape single quotes in strings
    const escapedName = playgroundName.replace(/'/g, "\\'");
    const escapedDesc = description.replace(/'/g, "\\'");

    // Determine the import and component usage
    const hasClientPlayground = content.includes('ClientPlayground');
    const playgroundImportMatch = content.match(/import\s+(\w+)\s+from\s+['"]\.\/playground['"]/);

    let importLine, componentName;
    if (hasClientPlayground) {
        importLine = "import ClientPlayground from './ClientPlayground';";
        componentName = 'ClientPlayground';
    } else if (playgroundImportMatch) {
        importLine = `import ${playgroundImportMatch[1]} from './playground';`;
        componentName = playgroundImportMatch[1];
    } else {
        importLine = "import Playground from './playground';";
        componentName = 'Playground';
    }

    const newContent = `import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

${importLine}

export const metadata: Metadata = {
    title: '${escapedName} · playgrounds',
    description: '${escapedDesc}',

    openGraph: {
        ...defaultOpenGraph,
        title: '${escapedName} · playgrounds · piatra.institute',
        description: '${escapedDesc}',
    },
};

export default function Page() {
    return <${componentName} />;
}
`;

    if (DRY_RUN) {
        console.log(`\n📄 WOULD UPDATE: ${relativePath}`);
        console.log(`   Title: "${playgroundName}"`);
        console.log(`   Description: "${description.substring(0, 60)}${description.length > 60 ? '...' : ''}"`);
    } else {
        try {
            fs.writeFileSync(file, newContent);
            console.log(`✅ UPDATED: ${relativePath}`);
            updated++;
        } catch (err) {
            console.log(`❌ ERROR: ${relativePath} - ${err.message}`);
            errors++;
        }
    }
});

console.log('\n' + '='.repeat(50));
if (DRY_RUN) {
    console.log(`Summary (DRY RUN):`);
    console.log(`  Would update: ${files.length - skipped} files`);
    console.log(`  Already done: ${skipped} files`);
} else {
    console.log(`Summary:`);
    console.log(`  Updated: ${updated} files`);
    console.log(`  Skipped: ${skipped} files`);
    console.log(`  Errors: ${errors} files`);
}
