# PRE_RESEARCH

This document governs how Claude operates on this project. Read it fully before doing anything. Do not skim. Do not summarize. Internalize every directive.


## Depth Directives

When this document or the human says any of the following, it means: leave no file unread, no function uninspected, no type unresolved, no edge case unconsidered.

| Directive | What it means |
|---|---|
| "read deeply" | Open every file in the specified scope. Read every line. Understand the control flow, the data flow, the error paths, and the side effects. |
| "study in great detail" | Go beyond reading. Trace how modules connect. Map dependencies. Identify patterns, conventions, and invariants the codebase relies on. |
| "go through everything" | Exhaustive. No skipping. No sampling. Every file, every folder, every config in the specified scope gets examined. |
| "understand the intricacies" | Find the subtle parts: implicit contracts between modules, non-obvious ordering dependencies, edge cases in validation, silent fallbacks, magic values, and undocumented assumptions. |
| "map it out" | Produce a written artifact (markdown) that captures the structure, relationships, and key decisions found during research. This artifact persists and is referenced in later phases. |

If a directive is not explicitly stated but the task is complex, default to the deepest level of reading. When in doubt, read more, not less.


## Pipeline

Every task follows three strict phases. Do not skip phases. Do not blend phases. Do not write code during Phase 1 or Phase 2.

```
Phase 1: RESEARCH  ──>  Phase 2: PLAN  ──>  Phase 3: IMPLEMENT
   (read only)          (write plan only)      (write code)
```

---

### Phase 1: RESEARCH

**Objective:** Understand the existing system before proposing any changes.

**Rules:**
- Read every file in the relevant scope.
- Trace call chains, data flows, and error handling paths.
- Identify existing patterns, naming conventions, and architectural decisions.
- Note what is tested and what is not.
- Produce a markdown research artifact (e.g., `RESEARCH.md`) summarizing findings.

**The research artifact must include:**
- Directory and file structure of the relevant scope.
- Key abstractions and their responsibilities.
- How data enters, transforms, and exits the system.
- Existing patterns that new code must follow.
- Risks, fragile areas, and things that must not break.

**Do not:**
- Propose solutions.
- Write code snippets.
- Make implementation suggestions.

This phase is observation only.

---

### Phase 2: PLAN

**Objective:** Produce a detailed, annotatable implementation plan before any code is written.

**Rules:**
- Write the plan in a dedicated markdown file (e.g., `PLAN.md`).
- The plan must include:
  - The approach and why it was chosen over alternatives.
  - Every file that will be created, modified, or deleted.
  - Code snippets showing the actual intended changes (not pseudocode).
  - Type signatures for new functions, interfaces, or data structures.
  - Migration steps if changing existing interfaces.
  - What will be tested and how.
- The plan is a living document. It will go through multiple annotation cycles.

**Do not:**
- Implement anything.
- Create source files.
- Modify existing code.

The plan is words and snippets in markdown, nothing else.

#### The Annotation Cycle

The human will review the plan and leave annotations. These annotations use a specific format:

```
> [!NOTE]
> <human's annotation here>
```

or inline:

```
<!-- NOTE: <human's annotation here> -->
```

**When you encounter a `NOTE`:**
1. Read it carefully. It is a direct instruction or correction from the human.
2. Address it fully in the next revision of the plan.
3. Do not remove the NOTE. Mark it as addressed:

```
> [!NOTE]
> <human's annotation here>
>
> **ADDRESSED:** <brief description of what was changed in response>
```

**Annotation examples:**

A two-word correction:
```
> [!NOTE]
> Not optional.
```

A scope constraint:
```
> [!NOTE]
> Do not change the public API of this module. Internal refactoring only.
```

A domain-specific requirement:
```
> [!NOTE]
> This field must be encrypted at rest. Use the existing KMS wrapper in `lib/crypto`.
> The key rotation schedule is 90 days. Do not hardcode key IDs.
```

A rejection:
```
> [!NOTE]
> Remove this. We don't need a new abstraction here. Use the existing handler directly.
```

**The cycle repeats until the human says to proceed.** Expect 1-6 rounds. Do not proceed to Phase 3 until explicitly told. The phrase to listen for is: **"implement"** or **"proceed to implementation"** or equivalent.

---

### Phase 3: IMPLEMENT

**Objective:** Execute the approved plan. All of it. Without stopping.

**Rules:**
- Follow the plan exactly as approved.
- When a task in the plan is completed, mark it done in the plan file:
  - `- [x] Completed task`
  - `- [ ] Pending task`
- Do not stop between tasks. Implement everything in one continuous pass.
- Run type checking continuously. Fix type errors as they appear, not at the end.
- Do not add unnecessary comments to the code. The code should be self-explanatory. If a comment is needed, it should explain *why*, not *what*.
- Do not add features, utilities, or abstractions not in the plan.
- Follow existing codebase patterns exactly (naming, structure, error handling style).

**If something in the plan is ambiguous or seems wrong during implementation:**
- Stop.
- Ask the human. Do not guess.
- Wait for clarification before continuing.

**If implementation reveals the plan is insufficient:**
- Note what's missing.
- Ask the human whether to extend the plan or adapt on the fly.
- Do not silently deviate from the plan.


## Corrections During Implementation

Once implementation is underway, the human may give feedback. It will be terse. Treat every correction as high priority.

| Feedback style | What to do |
|---|---|
| Single sentence fix | Apply it exactly. |
| Screenshot | Identify the visual problem and fix it. |
| "make this look like X" | Find X in the codebase, match it precisely. |
| "revert this" | Undo the change completely, then wait for new direction. |
| "this is wrong" | Stop. Ask what specifically is wrong. Do not guess. |


## Copy-Paste Prompts

Ready-made phrases to drop into the conversation at each stage. Copy the one you need, paste it, done.

### Research Phase

`Read this entire folder deeply. Every file, every function, every type. Understand the intricacies — implicit contracts, ordering dependencies, silent fallbacks, magic values. Write your findings to RESEARCH.md. Do not propose solutions. Observation only.`

`You missed something. Go back and re-read. Trace the full call chain from entry point to exit. Map every side effect. Update RESEARCH.md.`

`Now read the tests. What is tested? What is not? What assumptions do the tests encode? Add a section to RESEARCH.md.`

`Read the config files, the CI pipeline, the build scripts. Understand how this project is built, deployed, and run. Add a section to RESEARCH.md.`

### Planning Phase

`Write the implementation plan to PLAN.md. Include the approach, every file to be changed, actual code snippets (not pseudocode), type signatures, and what will be tested. Do not implement anything.`

`I've added NOTEs to PLAN.md. Read each one carefully and address every single one in the next revision. Do not skip any. Do not implement yet.`

`Are you sure this is correct? Re-read the relevant source files and verify every assumption in the plan against the actual code. Check for things you might have overlooked. Do not implement yet.`

`Think about edge cases. What happens when the input is empty? Null? Malformed? What happens under concurrent access? What happens if the dependency is unavailable? Update the plan.`

`Simplify. This is over-engineered. Remove unnecessary abstractions, extra layers, and anything not strictly required. Update PLAN.md.`

`This plan touches too many files. Reduce the scope. What is the minimal set of changes needed? Update PLAN.md.`

### Transition to Implementation

`The plan is approved. Implement it all. When done with a task, mark it completed in PLAN.md. Do not stop until finished. Do not add unnecessary comments. Continuously run typecheck.`

`Proceed to implementation. Follow the plan exactly. If something is ambiguous, stop and ask. Do not guess.`

### Corrections During Implementation

`Stop. Re-read the plan. You've deviated from what was approved. Revert the last change and follow the plan as written.`

`This is wrong. Stop and explain what you did and why, then wait for my correction.`

`Revert this. Go back to the state before this change. Wait for new direction.`

`This should look exactly like [X]. Find it in the codebase and match it precisely — same structure, same patterns, same style.`

`Are you sure about this? Double check the types, the error paths, and the return values. Run the typecheck and fix anything that breaks.`

### General (Use Anytime)

`Read carefully and think about the intricacies. What are you missing? What implicit assumptions are you making? What could go wrong?`

`Are you sure it's correct? Trace through the logic step by step. Verify against the actual codebase, not your assumptions.`

`You're going too fast. Slow down. Re-read the relevant files and make sure you understand the full picture before continuing.`

`Don't add anything I didn't ask for. No extra helpers, no utility functions, no "while we're at it" improvements. Only what's in the plan.`

`Re-read PRE_RESEARCH.md and PLAN.md. Context may have been lost. Resume from where you left off.`

`Summarize what you've done so far and what remains. Reference the checklist in PLAN.md.`


## Session Conduct

- Operate in a single long session. Do not suggest splitting into multiple conversations.
- The plan file is the source of truth. It survives context compaction.
- If context gets compressed, re-read the plan file before continuing.
- Do not repeat yourself. Do not narrate what you're about to do. Do it.
- Be direct. Be precise. Be thorough.
