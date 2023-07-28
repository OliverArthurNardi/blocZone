import type { Subscription, TargetKeys } from '../../types'

/**
 * Create subscription manager with the given active effect.
 *
 * @template S - The type of the state.
 *
 * @returns The created subscription manager.
 */
export default function SubscribeManager<S extends object>() {
  /** @type {WeakMap<object, Subscription<S>>} Mapping of object keys to listener functions */
  const _subscriberCallbacks = new WeakMap<S, Subscription<S>>()
  /** @type {Set<object>} Set of objects that are subscribed to this Bloc */
  const _listenerKeys = new Set<S>()
  /** @type {WeakMap<object, Set<keyof S>>} Mapping of object keys to the properties they are subscribed to */
  const _dependencies = new WeakMap<S, Set<TargetKeys<S>>>()

  let activeEffect: Subscription<S> | null = null

  const handleSubscriptionExceptions = (target: S) => {
    if (typeof target !== 'object' || target === null) {
      throw new Error(
        `Cannot subscribe to a non-object value. Received value of type ${typeof target}`
      )
    }

    if (_dependencies.has(target)) {
      console.warn(`Object is already subscribed. ${JSON.stringify(target)}`)
    }
  }

  const effect = (eff: () => void) => {
    activeEffect = eff
    eff()
    activeEffect = null
  }

  const subscribe = (target: S, key: TargetKeys<S>, callback: Subscription<S>) => {
    handleSubscriptionExceptions(target)

    if (!_dependencies.has(target)) {
      _dependencies.set(target, new Set())
    }

    _dependencies.get(target)!.add(key)
    _subscriberCallbacks.set(target, callback)
    _listenerKeys.add(target)
  }

  const unsubscribe = (target: S, key: TargetKeys<S>) => {
    if (typeof target !== 'object' || target === null || !_subscriberCallbacks.has(target)) {
      throw new Error(`Cannot unsubscribe. Invalid target received of type ${typeof target}`)
    }

    const dependencies = _dependencies.get(target)!
    dependencies.delete(key)

    if (dependencies.size === 0) {
      _dependencies.delete(target)
      _subscriberCallbacks.delete(target)
      _listenerKeys.delete(target)
    }
  }

  const trackListeners = (target: S, key: TargetKeys<S>) => {
    if (activeEffect) {
      let deps = _dependencies.get(target)
      if (!deps) {
        _dependencies.set(target, (deps = new Set()))
      }
      deps.add(key)
    }
  }

  const notifyListeners = (target: S, key: TargetKeys<S>) => {
    _listenerKeys.forEach((obj) => {
      if (!_subscriberCallbacks.has(obj)) {
        return
      }

      const deps = _dependencies.get(obj)
      if (!deps || !deps.has(key)) {
        return
      }

      const listener = _subscriberCallbacks.get(obj)
      if (!listener) {
        return
      }

      try {
        effect(() => listener(target))
      } catch (error) {
        console.error('Error in listener callback:', error)
      }
    })
  }

  return {
    subscribe,
    unsubscribe,
    trackListeners,
    notifyListeners
  }
}
