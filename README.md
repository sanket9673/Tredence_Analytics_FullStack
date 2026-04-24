# HR Workflow Designer
> A production-quality visual workflow editor for HR automation, built with React Flow, TypeScript, and Zustand.
> Built as a case study submission for Tredence Studio AI Agents Engineering Team.

## Quick Start
```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Running Tests
```bash
npm run test
```

## Features
- Drag-and-drop workflow canvas (React Flow)
- 5 node types: Start, Task, Approval, Automated, End
- Dynamic node configuration forms (React Hook Form + Zod)
- Mock API (MSW v2): GET /automations, POST /simulate
- Real-time workflow validation with visual error indicators on nodes
- Step-by-step animated simulation with canvas highlighting
- Export/Import workflow as JSON
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)
- Auto-layout with dagre
- 3 pre-built templates
- Node version history (last 5 edits, restore)
- LocalStorage auto-save

## Architecture

### State Management — Zustand over Redux
Zustand was chosen for its minimal API surface and native compatibility with React Flow's controlled mode. The store is split by concern: `workflowStore` for graph state, `uiStore` for layout/dark mode. Undo/redo is implemented via `zundo` temporal middleware — this avoids the boilerplate of manual action recording and gives a clean 50-state history stack.

### Form Architecture — React Hook Form + Zod
Forms use uncontrolled inputs (fast, no re-render per keystroke) with schema-driven validation via Zod. Zod schemas in `types/schemas.ts` are the single source of truth — they generate TypeScript types via `z.infer<>` and are reused in the import validation layer. Auto-save uses `watch()` with a 300ms debounce to sync to Zustand without blocking the user.

### Mock API — MSW v2 over json-server
MSW intercepts real `fetch()` calls at the Service Worker level — no separate server process, no proxy config. The rest of the app imports from `src/api/workflowApi.ts` which has no knowledge of MSW. Swapping to a real backend requires only updating those API functions.

### Graph Algorithms — in dedicated utils/
Cycle detection uses iterative DFS with a recursion stack (O(V+E)). Topological sort uses Kahn's BFS algorithm (O(V+E)). Both live in `src/utils/graphValidation.ts` and have unit test coverage. The simulation engine in `src/mocks/simulationEngine.ts` calls topologicalSort to determine execution order.

### Auto-layout — dagre
dagre performs directed-acyclic graph layout with configurable rank direction, separation, and alignment. React Flow animates the node position transitions automatically via its internal reconciliation.

## Design Decisions

| Decision | Choice | Alternative Considered | Reason |
|---|---|---|---|
| State | Zustand + zundo | Redux Toolkit | Less boilerplate, built-in undo/redo |
| Forms | React Hook Form + Zod | Controlled useState | Performance, type safety, schema reuse |
| Mock API | MSW v2 | json-server | No separate process, real fetch interception |
| Layout | dagre | elkjs | Simpler API, widely used |
| Icons | Lucide React | Heroicons | Tree-shakeable, consistent stroke |
| Build | Vite | CRA | Faster HMR, native ESM |

## Completed vs Would Add

### Completed
- All 5 node types with full config forms
- MSW mock API (4 endpoints)
- Workflow validation (7 rules, visual indicators)
- Animated simulation sandbox with canvas highlighting
- Export/Import JSON, Undo/Redo, dagre auto-layout
- 3 workflow templates, node version history
- LocalStorage persistence, auto-save

### Would Add With More Time
- Backend persistence: FastAPI + PostgreSQL
- Real-time collaboration: WebSocket + Yjs CRDT
- Workflow scheduling: cron-based triggers via node-cron
- Execution analytics: actual pass/fail metrics per workflow
- OAuth2 authentication with JWT
- Storybook: design system documentation for all UI components
- E2E tests: Playwright covering the full simulation flow

---

## Tricky bug note (for submission email)

"One tricky frontend bug I solved during this project:

When implementing the AutomatedNodeForm, I used React Hook Form's useFieldArray for the dynamic action params. But when the user switched from one action (e.g., 'Send Email' with params ['to','subject','body']) to another (e.g., 'Generate Document' with params ['template','recipient']), the field array would retain stale field registrations from the previous action. The form would submit old param keys alongside new ones, sending corrupted data to POST /simulate.

The fix was to stop using useFieldArray for this case entirely. Instead, I switched to a Controller-based approach with a plain Record field (actionParams). When the selected actionId changes, I call setValue('actionParams', emptyParamsForNewAction) to atomically replace the entire params object. This ensures the form state is always in sync with the selected action's param schema, with no stale keys."
