#!/usr/bin/env node

/**
 * Script to update PLAYGROUND.md files with complete source code for each playground
 *
 * Handles the year-based route group structure:
 * app/playgrounds/(2024)/(02)/playground-name/
 * app/playgrounds/(2025)/(07)/playground-name/
 * etc.
 *
 * Usage:
 *   node scripts/update-playgrounds-notes.js
 */

const fs = require('fs');
const path = require('path');

const PLAYGROUNDS_DIR = path.join(__dirname, '..', 'app', 'playgrounds');
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.wgsl'];
const EXCLUDE_DIRS = ['node_modules', '.next', '__tests__', 'ideation'];
const EXCLUDE_FILES = ['page.tsx']; // Exclude page.tsx as it's mostly boilerplate

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
            }
        } else {
            const ext = path.extname(file);
            if (SOURCE_EXTENSIONS.includes(ext) && !EXCLUDE_FILES.includes(file)) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

function getRelativePath(fullPath, basePath) {
    return path.relative(basePath, fullPath);
}

function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Find all playground directories, handling the year-based route group structure
 */
function findPlaygroundDirs(baseDir) {
    const playgrounds = [];

    function scanDir(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            if (!item.isDirectory()) continue;

            const fullPath = path.join(dir, item.name);

            // Skip excluded directories
            if (EXCLUDE_DIRS.includes(item.name)) continue;

            // Check if this is a route group (starts with parentheses)
            if (item.name.startsWith('(') && item.name.endsWith(')')) {
                // Recurse into route groups
                scanDir(fullPath);
            } else {
                // Check if this is a playground (has page.tsx or playground.tsx)
                const hasPageFile = fs.existsSync(path.join(fullPath, 'page.tsx'));
                const hasPlaygroundFile = fs.existsSync(path.join(fullPath, 'playground.tsx')) ||
                                          fs.existsSync(path.join(fullPath, 'Playground.tsx'));

                if (hasPageFile || hasPlaygroundFile) {
                    playgrounds.push(fullPath);
                }
            }
        }
    }

    scanDir(baseDir);
    return playgrounds;
}

function updateReadme(playgroundPath) {
    const readmePath = path.join(playgroundPath, 'PLAYGROUND.md');
    const playgroundName = path.basename(playgroundPath);

    // Get all source files
    const sourceFiles = getAllFiles(playgroundPath)
        .filter(file => !file.includes('PLAYGROUND.md') && !file.includes('README.md'))
        .sort((a, b) => {
            // Sort by type: tsx files first, then ts, then others
            const aExt = path.extname(a);
            const bExt = path.extname(b);
            if (aExt !== bExt) {
                if (aExt === '.tsx') return -1;
                if (bExt === '.tsx') return 1;
                if (aExt === '.ts') return -1;
                if (bExt === '.ts') return 1;
            }
            // Then sort by depth (fewer directories first)
            const aDepth = a.split(path.sep).length;
            const bDepth = b.split(path.sep).length;
            if (aDepth !== bDepth) return aDepth - bDepth;
            // Finally alphabetically
            return a.localeCompare(b);
        });

    if (sourceFiles.length === 0) {
        console.log(`No source files found in ${playgroundName}`);
        return;
    }

    // Read existing README content
    let readmeContent = '';
    let existingContent = '';
    if (fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, 'utf8');
        // Find the source section and keep everything before it
        const sourceIndex = readmeContent.search(/^#{2,3}\s+[Ss]ource/m);
        if (sourceIndex !== -1) {
            existingContent = readmeContent.substring(0, sourceIndex).trim();
        } else {
            existingContent = readmeContent.trim();
        }
    } else {
        // Create a basic README structure if it doesn't exist
        existingContent = `# ${playgroundName.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}

## Overview

*This playground is under development.*

## Key Concepts

*Documentation coming soon.*`;
    }

    // Build the source section
    let sourceSection = '\n\n## Source\n';

    sourceFiles.forEach(filePath => {
        const relativePath = getRelativePath(filePath, playgroundPath);
        const content = readFileContent(filePath);

        if (content !== null) {
            const language = path.extname(filePath).slice(1) || 'text';
            sourceSection += `\n### ${relativePath}\n\n\`\`\`${language}\n${content}\`\`\`\n`;
        }
    });

    // Combine everything
    const newReadmeContent = existingContent + sourceSection;

    // Write the updated PLAYGROUND.md
    fs.writeFileSync(readmePath, newReadmeContent);
    console.log(`Updated PLAYGROUND.md for ${playgroundName} (${sourceFiles.length} files)`);
}

function main() {
    console.log('Updating playground PLAYGROUND.md files with complete source code...\n');

    // Get all playground directories using the new structure
    const playgrounds = findPlaygroundDirs(PLAYGROUNDS_DIR);

    console.log(`Found ${playgrounds.length} playgrounds\n`);

    // Update each playground
    let updated = 0;
    let errors = 0;

    playgrounds.forEach(playgroundPath => {
        try {
            updateReadme(playgroundPath);
            updated++;
        } catch (error) {
            console.error(`Error updating ${path.basename(playgroundPath)}:`, error.message);
            errors++;
        }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Summary:`);
    console.log(`  Updated: ${updated} playgrounds`);
    console.log(`  Errors: ${errors} playgrounds`);
}

// Run the script
main();
