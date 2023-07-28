import type { Subscription } from '../../types'
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
  if (typeof initialState !== 'object' || initialState === null) {
    throw new Error(`Bloc state must be an object, got ${typeof initialState}`)
  }

  const activeEffect: Subscription<S> | null = null

  const manager = SubscribeManager(() => activeEffect)

  return new Proxy(initialState, {
    get: (target, key: string) => {
      const value = Reflect.get(target, key)
      manager.trackListeners(target, key)
      return value
    },
    set: (target, key: string, value) => {
      const oldValue = Reflect.get(target, key)
      Reflect.set(target, key, value)
      if (oldValue !== value) {
        manager.notifyListeners(target, key)
      }
      return true
    }
  })
}
