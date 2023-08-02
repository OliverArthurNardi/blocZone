import { createBlocState } from "./stateManagement"
import { SubscribeManager } from "./subscription"

import type { BlocId } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blocRegistry = new Map<BlocId, WeakRef<any>>()

/**
 * Finalization registry to clean up blocs when they are no longer referenced.
 */
const finalizationRegistry = new FinalizationRegistry((blocId: BlocId) => {
  blocRegistry.delete(blocId)
})

/**
 * Create a bloc with the given id and initial state.
 *
 * @param blocId - The bloc id to create.
 * @param initialState - The initial state of the bloc.
 * @returns The created bloc.
 */
export function createBloc<S extends object>(blocId: BlocId, initialState: S) {
  let blocRef = blocRegistry.get(blocId)
  let bloc = blocRef ? blocRef.deref() : undefined

  if (!bloc) {
    if (blocRef) {
      // remove the old bloc reference if it is garbage collected
      blocRegistry.delete(blocId)
    }

    const state = createBlocState(initialState)
    const manager = SubscribeManager<S>()

    bloc = { state, manager }
    blocRef = new WeakRef(bloc)
    blocRegistry.set(blocId, blocRef)

    // Register the bloc in the finalization registry to clean it up when it is no longer referenced.
    finalizationRegistry.register(bloc, blocId)
  }

  return bloc
}

/**
 * Get a bloc with the given id.
 *
 * @param blocId - The bloc id to get.
 * @returns The bloc with the given id.
 */
export function useBloc(blocId: BlocId): ReturnType<typeof createBloc> | undefined {
  const blocRef = blocRegistry.get(blocId)
  const bloc = blocRef ? blocRef.deref() : undefined

  if (!bloc) {
    throw new Error(`Bloc with id "${String(blocId)}" does not exist`)
  }

  return bloc
}
