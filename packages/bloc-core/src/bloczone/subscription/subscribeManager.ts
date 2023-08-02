import type { Subscription, TargetKeys } from '../../types'

/**
 * Create subscription manager with the given active effect.
 *
 * @template S - The type of the state.
 *
 * @returns The created subscription manager.
 */
export default function SubscribeManager<S extends object>() {
  const _subscriberCallbacks = new WeakMap<S, Set<Subscription<S>>>()
  const _listenerKeys = new Set<S>()
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

    if (process.env.NODE_ENV === 'development') {
      console.info(`--- ENABLE SUBSCRIPTION DEBUGGING, NOT FOR PRODUCTION ---`)
      console.info(
        `[SubscribeManager] new subscription registered for object: ${JSON.stringify(
          target
        )} and key: ${key}`
      )
    }

    if (!_dependencies.has(target)) {
      _dependencies.set(target, new Set())
    }

    if (!_subscriberCallbacks.has(target)) {
      _subscriberCallbacks.set(target, new Set())
    }

    _dependencies.get(target)!.add(key)
    _subscriberCallbacks.get(target)!.add(callback)
    _listenerKeys.add(target)
  }

  const unsubscribe = (target: S, key: TargetKeys<S>, callback: Subscription<S>) => {
    if (typeof target !== 'object' || target === null || !_subscriberCallbacks.has(target)) {
      throw new Error(`Cannot unsubscribe. Invalid target received of type ${typeof target}`)
    }

    const dependencies = _dependencies.get(target)!
    dependencies.delete(key)

    const callbacks = _subscriberCallbacks.get(target)!
    callbacks.delete(callback)

    if (dependencies.size === 0 && callbacks.size === 0) {
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

      const listeners = _subscriberCallbacks.get(obj)
      if (!listeners) {
        return
      }

      listeners.forEach((listener) => {
        try {
          effect(() => listener(target))
        } catch (error) {
          console.error('Error in listener callback:', error)
        }
      })
    })
  }

  return {
    subscribe,
    unsubscribe,
    trackListeners,
    notifyListeners
  }
}
