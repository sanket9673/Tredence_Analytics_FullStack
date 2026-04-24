import { StateCreator, StoreMutatorIdentifier } from 'zustand'

export const historyMiddleware = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, [...Mps, ['zustand/history', unknown]], Mcs>
): StateCreator<T, Mps, [['zustand/history', unknown], ...Mcs]> => (set, get, api) => {
  return config(
    (args: any, replace: any) => {
      set(args, replace)
    },
    get,
    api as any
  )
}
