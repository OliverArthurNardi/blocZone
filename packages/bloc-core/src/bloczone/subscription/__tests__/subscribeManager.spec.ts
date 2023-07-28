import { describe, test, expect, jest, beforeEach } from '@jest/globals'

import SubscribeManager from '../subscribeManager'
import type { Subscription } from '../../../types'

describe('SubscribeManager', () => {
  let manager: ReturnType<typeof SubscribeManager>
  let getActiveEffect: jest.MockedFunction<() => Subscription<object> | null>

  beforeEach(() => {
    getActiveEffect = jest.fn();
    manager = SubscribeManager(getActiveEffect)
    jest.spyOn(console, 'warn').mockImplementation(() => {
      /* no-op */
    })
  })

  test('should subscribe a callback to a target and key', () => {
    const target = { count: 0 }
    const callback = jest.fn()

    manager.subscribe(target, 'count', callback)

    manager.notifyListeners(target, 'count')

    expect(callback).toHaveBeenCalledWith(target)

  })

  test('should unsubscribe a callback from a target and key', () => {
    const target = { }
    const key = 'value'
    const callback = jest.fn()

    manager.subscribe(target, key, callback)
    manager.unsubscribe(target, key)

    manager.notifyListeners(target, key)

    expect(callback).not.toHaveBeenCalled()

  })

  test('shuld throw an error when trying to subscribe to a non-object', () => {
    const target = 0
    const callback = jest.fn()

    // @ts-expect-error - Testing invalid input
    expect(() => manager.subscribe(target, 'count', callback)).toThrowError()
  })

  test('should throw an error when trying to unsubscribe from a non-object', () => {
    const target = 0
    const key = 'count'

    // @ts-expect-error - Testing invalid input
    expect(() => manager.unsubscribe(target, key)).toThrowError()
  })

  test('should warn when trying to subscribe an object is already subscribed', () => {
    const target = { count: 0 }
    const callback = jest.fn()

    manager.subscribe(target, 'count', callback)
    manager.subscribe(target, 'count', callback)

    expect(console.warn).toHaveBeenCalled()
  })
})
