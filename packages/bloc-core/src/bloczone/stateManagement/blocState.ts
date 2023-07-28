import { SubscribeManager } from '../subscription'

/**
 * Create a bloc state with the given initial state.
 *
 * @template S - The type of the state.
 *
 * @param initialState - The initial state of the bloc.
 *
 * @returns The created bloc state.
 *
 */
export default function createBlocState<S extends object>(initialState: S) {
  // Initial validation to ensure initialState is an object
  if (typeof initialState !== 'object' || initialState === null) {
    throw new Error(`initialState must be an object, got ${typeof initialState}`)
  }

  const manager = SubscribeManager()

  const state = new Proxy(initialState, {
    // Track listeners when a property is accessed
    get: (target, key: string) => {
      const value = Reflect.get(target, key)
      manager.trackListeners(target, key)
      return value
    },
    // Update property and notify listeners when a property is set
    set: (target, key: string, value) => {
      const oldValue = Reflect.get(target, key)
      Reflect.set(target, key, value)
      if (oldValue !== value) {
        manager.notifyListeners(target, key)
      }
      return true
    }
  })

  const setState = (action: string, key: keyof S, value: unknown) => {
    console.info(`[BlocState] Action: ${action}, Key: ${String(key)}, Value: ${value}`)

    // Ensure key exists in initialState
    if (!Reflect.has(initialState, key)) {
      throw new Error(`Key "${String(key)}" does not exist in initialState`)
    }

    Reflect.set(state, key, value)
    manager.notifyListeners(state, key)
  }

  const getState = (): S => state

  return {
    state,
    setState,
    getState
  } as const
}
