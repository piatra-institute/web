import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';


export interface ResearchStep {
    id: string;
    label: string;
    description: string;
}

export const RESEARCH_STEPS: ResearchStep[] = [
    {
        id: 'historical-context',
        label: 'Historical context & intellectual lineage',
        description: 'Trace the origins and development of the core concepts',
    },
    {
        id: 'scientific-accuracy',
        label: 'Scientific accuracy & empirical evidence',
        description: 'Evaluate the model\'s claims against published evidence',
    },
    {
        id: 'related-concepts',
        label: 'Related concepts & cross-disciplinary connections',
        description: 'Identify connections to adjacent fields and frameworks',
    },
    {
        id: 'pedagogical-framing',
        label: 'Pedagogical framing & learning design',
        description: 'Assess how well the playground teaches the concepts',
    },
    {
        id: 'assumption-validation',
        label: 'Assumption validation & sensitivity',
        description: 'Scrutinize each explicit assumption and its confidence level',
    },
    {
        id: 'synthesis',
        label: 'Synthesis & suggested improvements',
        description: 'Produce a research companion document and improvement suggestions',
    },
];


function buildPreamble(ctx: PlaygroundSourceContext, focus: string): string {
    const focusSection = focus.trim()
        ? `\n**Research Focus**: Pay special attention to the following angle: ${focus.trim()}\n`
        : '';

    let preamble = `You are a research assistant for an interactive scientific playground at piatra.institute.

Below is the complete source code and metadata for the "${ctx.title}" playground. Your task is to conduct deep research on the specific question below and produce a well-sourced, academically rigorous response.
${focusSection}
## Playground Metadata
- Title: ${ctx.title}
- Description: ${ctx.description}
- Topics: ${ctx.topics.join(', ')}
- Operations: ${ctx.operations.join(', ')}
`;

    if (ctx.logicSource) {
        preamble += `
## Source Code: Logic (${ctx.name}/logic/index.ts)
\`\`\`ts
${ctx.logicSource}
\`\`\`
`;
    }

    if (ctx.assumptionsSource) {
        preamble += `
## Source Code: Assumptions (${ctx.name}/assumptions.ts)
\`\`\`ts
${ctx.assumptionsSource}
\`\`\`
`;
    }

    if (ctx.calibrationSource) {
        preamble += `
## Source Code: Calibration (${ctx.name}/calibration.ts)
\`\`\`ts
${ctx.calibrationSource}
\`\`\`
`;
    }

    if (ctx.versionsSource) {
        preamble += `
## Source Code: Versions (${ctx.name}/versions.ts)
\`\`\`ts
${ctx.versionsSource}
\`\`\`
`;
    }

    if (ctx.playgroundSource) {
        preamble += `
## Source Code: Main Component (${ctx.name}/playground.tsx)
\`\`\`tsx
${ctx.playgroundSource}
\`\`\`
`;
    }

    return preamble;
}


const STEP_QUESTIONS: Record<string, string> = {
    'historical-context': `## Research Question

Trace the historical development and intellectual lineage of the core concepts in this playground. Specifically:

1. Who are the key researchers and what are the foundational papers?
2. How did the central ideas evolve over time?
3. What were the intellectual precursors and what sparked the original insights?
4. Are there competing historical narratives about how these ideas developed?
5. What institutional and disciplinary contexts shaped the work?

Produce your findings as markdown with ## section headers. Include specific citations with links where available. Write for an educated general audience (undergraduate+ level). Aim for 800-1500 words.`,

    'scientific-accuracy': `## Research Question

Evaluate the scientific accuracy and empirical grounding of the model implemented in this playground. Specifically:

1. Which claims in the model are well-supported by published experimental or observational evidence?
2. Which claims are theoretical extrapolations, and how far do they extend beyond current evidence?
3. What are the key experiments or datasets that could confirm or refute the model's predictions?
4. Are there known results that contradict or complicate the model's assumptions?
5. How do the parameter ranges and default values compare to measured quantities in the literature?

Look at the assumptions.ts file carefully — each assumption has a confidence level (established, contested, speculative) and a falsifiability criterion. Assess whether these confidence assignments are fair.

Produce your findings as markdown with ## section headers. Include specific citations with links where available. Aim for 800-1500 words.`,

    'related-concepts': `## Research Question

Identify connections between this playground's concepts and ideas from adjacent fields. Specifically:

1. What frameworks from other disciplines address similar phenomena through different lenses?
2. Are there mathematical or structural analogies that connect this model to models in other fields?
3. What recent publications (last 3-5 years) have drawn similar cross-disciplinary connections?
4. Are there practical applications or technologies that rely on the same underlying principles?
5. What would a researcher from each of the playground's listed topics find most interesting or surprising about the model?

Produce your findings as markdown with ## section headers. Include specific citations with links where available. Aim for 800-1500 words.`,

    'pedagogical-framing': `## Research Question

Assess how effectively this playground teaches its core concepts and suggest improvements. Specifically:

1. What are the key "aha moments" the playground is designed to produce? Does the UI support them?
2. What prerequisite knowledge does a user need, and is that made clear?
3. Are there common misconceptions about this topic that the playground could address more explicitly?
4. How does the outro text contextualize the model? Is the distinction between established and speculative claims clear enough?
5. What alternative visualizations or interaction patterns could deepen understanding?
6. Are there classic textbook treatments or accessible reviews that could be linked?

Produce your findings as markdown with ## section headers. Aim for 600-1000 words.`,

    'assumption-validation': `## Research Question

Scrutinize the explicit assumptions listed in assumptions.ts and the calibration cases in calibration.ts. For each assumption:

1. Is the confidence level (established / contested / speculative) accurately assigned based on current literature?
2. Is the falsifiability criterion well-formulated — is it actually testable with current or near-future methods?
3. Are there assumptions that are missing from the list but implicitly embedded in the logic?
4. For the calibration cases: are the "expected" values reasonable? Do the cited sources support them?
5. What would change in the model's behavior if each speculative assumption were removed?

Produce your findings as markdown. Use a subsection (###) for each assumption ID. Include specific citations. Aim for 800-1500 words.`,

    'synthesis': `## Research Question

Based on your analysis of the playground's source code, assumptions, and calibration, produce two outputs:

### Part A: Research Companion Document

Write a comprehensive research companion (2000-4000 words) in markdown that:
- Opens with an overview connecting to the playground's topic
- Covers historical context and intellectual lineage
- Presents the science with academic depth and accessible language
- Includes empirical evidence and experimental results
- Discusses cross-disciplinary connections
- Honestly addresses what the playground simplifies and why
- Lists specific things to try in the playground and what they teach
- Concludes with 5-10 annotated further reading references
- Uses markdown with ## and ### headers
- Includes inline citations as markdown links

### Part B: Suggested Improvements

List 10-20 specific, actionable improvements organized by category:

**Parameter corrections**: default values or ranges that should change, with citations

**Missing features**: parameters, visualizations, or interactions that would improve the model

**Conceptual corrections**: where the model departs from current consensus

**Interesting additions**: extensions that would make the playground more complete

Each suggestion should include a confidence level (high / medium / speculative) and cite relevant literature.`,
};


export function buildPrompt(step: ResearchStep, ctx: PlaygroundSourceContext, focus: string): string {
    const preamble = buildPreamble(ctx, focus);
    const question = STEP_QUESTIONS[step.id] ?? '';
    return `${preamble}\n---\n\n${question}`;
}
