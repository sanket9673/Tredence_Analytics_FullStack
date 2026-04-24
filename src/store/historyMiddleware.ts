// src/store/historyMiddleware.ts
// The temporal middleware (undo/redo) is provided by the zundo package.
// This file re-exports it as a named reference for architectural clarity.
export { temporal } from 'zundo'
export type { TemporalState } from 'zundo'
