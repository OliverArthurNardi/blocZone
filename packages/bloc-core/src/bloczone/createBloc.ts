import { createBlocZone } from './BlocZone'
import type { BlocZone, BlocId } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blocRegistry: Map<BlocId, WeakRef<BlocZone<any>>> = new Map()

/**
 * Finalization registry to clean up blocs when they are no longer referenced.
 * This is necessary because blocs are not garbage collected by default, and
 * FinalizationRegistry can provide a way to request a cleanup when a bloc is
 * no longer referenced. This will allow to do garbage collection on blocs.
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
export function createBloc<S extends object>(blocId: BlocId, initialState: S): BlocZone<S> {
  let blocRef = blocRegistry.get(blocId)
	// return the weak reference if it exists and is not garbage collected
  let bloc = blocRef ? blocRef.deref() : undefined

  if (!bloc) {
    bloc = createBlocZone<S>(initialState)
		// Create a weak reference to the bloc to avoid preventing it from being garbage collected.
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
export function getBloc<S extends object>(blocId: BlocId): BlocZone<S> | undefined {
  const blocRef = blocRegistry.get(blocId)
  return blocRef ? blocRef.deref() as BlocZone<S> : undefined
}
