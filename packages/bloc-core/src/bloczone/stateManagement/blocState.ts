import type { Subscription } from '../../types'

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
export function createBlocState<S extends object>(initialState: S) {
  if (typeof initialState !== 'object' || initialState === null) {
    throw new Error(`Bloc state must be an object, got ${typeof initialState}`)
  }

  /** @type {WeakMap<object, Subscription<S>>} Mapping of object keys to listener functions */
  const _subscriberCallbacks = new WeakMap<object, Subscription<S>>()

  /** @type {Set<object>} Set of objects that are subscribed to this Bloc */
  const _listenerKeys = new Set<object>()

  /** @type {WeakMap<object, Set<keyof S>>} Mapping of object keys to the properties they are subscribed to */
  const _dependencies = new WeakMap<object, Set<keyof S>>()

  let activeEffect: Subscription<S> | null = null

  const effect = (eff: () => void) => {
    activeEffect = eff
    eff()
    activeEffect = null
  }

  const trackListeners = (target: object, key: keyof S) => {

    if (!target || typeof target !== 'object') {
      console.error(`Track listeners called with invalid target: ${target}, target must be an object`)
    }

    if (activeEffect) {
      let deps = _dependencies.get(target)
      if (!deps) {
        _dependencies.set(target, (deps = new Set()))
      }
      deps.add(key)
    }
  }

  const notifyListeners = (target: object, key: keyof S) => {
    _listenerKeys.forEach((obj) => {
      const deps = _dependencies.get(obj)
      if (deps && deps.has(key)) {
        const listener = _subscriberCallbacks.get(obj)
        if (listener) {
          effect(() => listener(target as S))
        }
      }
    })
  }

  return new Proxy(initialState, {
    get: (target, key) => {
      const value = Reflect.get(target, key)
      trackListeners(target, key as keyof S)
      return value
    },
    set: (target, key, value) => {
      const oldValue = Reflect.get(target, key)
      Reflect.set(target, key, value)
      if (oldValue !== value) {
        notifyListeners(target, key as keyof S)
      }
      return true
    }
  })
}
