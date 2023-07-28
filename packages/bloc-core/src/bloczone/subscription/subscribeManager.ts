import type { Subscription, TargetKeys } from '../../types'

/**
 * Create subscription manager with the given active effect.
 *
 * @template S - The type of the state.
 *
 * @param getActiveEffect - A function that returns the current active effect.
 *
 * @returns The created subscription manager.
 */
export default function SubscribeManager<S extends object>(getActiveEffect: () => Subscription<S> | null) {
  const _subscriberCallbacks = new WeakMap<object, Subscription<S>>()
  const _listenerKeys = new Set<object>()
  const _dependencies = new WeakMap<object, Set<keyof S>>()

  /**
   * Checks if target is a valid object and is already subscribed, throws an error if not.
   *
   * @param target - The target object.
   */
  const handleSubscriptionExceptions = (target: object) => {
    if (typeof target !== 'object' || target === null) {
      throw new Error(`Cannot subscribe to a non-object value. Received value of type ${typeof target}`)
    }

    if (_dependencies.has(target)) {
      console.warn(`Object ${target} is already subscribed. Skipping subscription.`)
    }
  }

  /**
   * Subscribes a listener to changes in a key of the target object.
   *
   * @param target - The target object.
   * @param key - The key in the target object.
   * @param callback - The callback function.
   */
  const subscribe = (target: object, key: TargetKeys<S>, callback: Subscription<S>) => {
    handleSubscriptionExceptions(target)

    if (!_dependencies.has(target)) {
      _dependencies.set(target, new Set())
    }

    _dependencies.get(target)!.add(key as keyof S)
    _subscriberCallbacks.set(target, callback)
    _listenerKeys.add(target)
  }

  /**
   * Unsubscribes a listener from changes in a key of the target object.
   *
   * @param target - The target object.
   * @param key - The key in the target object.
   */
  const unsubscribe = (target: object, key: TargetKeys<S>) => {
    if (typeof target !== 'object' || target === null || !_subscriberCallbacks.has(target)) {
      throw new Error(`Cannot unsubscribe from a non-subscribed object. Received value of type ${typeof target}`)
    }

    const dependencies = _dependencies.get(target)!
    dependencies.delete(key as keyof S)

    if (dependencies.size === 0) {
      _dependencies.delete(target)
      _subscriberCallbacks.delete(target)
      _listenerKeys.delete(target)
    }
  }

  /**
   * Tracks the dependencies of the active effect on the keys of the target object.
   *
   * @param target - The target object.
   * @param key - The key in the target object.
   */
  const trackListeners = (target: object, key: TargetKeys<S>) => {
    if (!target || typeof target !== 'object') {
      console.error(`Track listeners called with invalid target: ${target}, target must be an object`)
    }

    const activeEffect = getActiveEffect()
    if (activeEffect) {
      let deps = _dependencies.get(target)
      if (!deps) {
        _dependencies.set(target, (deps = new Set()))
      }
      deps.add(key as keyof S)
    }
  }

  /**
   * Notifies all listeners that are subscribed to changes in a key of the target object.
   *
   * @param target - The target object.
   * @param key - The key in the target object.
   */
  const notifyListeners = (target: object, key: TargetKeys<S>) => {
    _listenerKeys.forEach((obj) => {
      const deps = _dependencies.get(obj)
      if (deps && deps.has(key as keyof S)) {
        const listener = _subscriberCallbacks.get(obj)
        if (listener) {
          listener(target as S)
        }
      }
    })
  }

  return {
    subscribe,
    unsubscribe,
    trackListeners,
    notifyListeners,
  }
}
