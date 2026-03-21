import fs from 'fs';
import path from 'path';


export interface PlaygroundSourceContext {
    name: string;
    title: string;
    description: string;
    topics: string[];
    operations: string[];
    logicSource: string;
    assumptionsSource: string;
    calibrationSource: string;
    versionsSource: string;
    playgroundSource: string;
}

function readFileOrEmpty(filePath: string): string {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch {
        return '';
    }
}

export function readPlaygroundSource(
    playgroundDir: string,
    meta: {
        name: string;
        title: string;
        description: string;
        topics: string[];
        operations: string[];
    },
): PlaygroundSourceContext {
    const base = path.join(process.cwd(), playgroundDir);

    return {
        ...meta,
        logicSource: readFileOrEmpty(path.join(base, 'logic/index.ts')),
        assumptionsSource: readFileOrEmpty(path.join(base, 'assumptions.ts')),
        calibrationSource: readFileOrEmpty(path.join(base, 'calibration.ts')),
        versionsSource: readFileOrEmpty(path.join(base, 'versions.ts')),
        playgroundSource: readFileOrEmpty(path.join(base, 'playground.tsx')),
    };
}
