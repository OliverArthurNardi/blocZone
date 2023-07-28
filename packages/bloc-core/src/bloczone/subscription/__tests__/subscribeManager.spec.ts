import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import SubscribeManager from '../subscribeManager'

describe('SubscribeManager', () => {
  let manager: ReturnType<typeof SubscribeManager>

  beforeEach(() => {
    manager = SubscribeManager()
    jest.spyOn(console, 'warn').mockImplementation(() => {
      /* no-op */
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should subscribe and notify a callback to a target and key', () => {
    const target = { count: 0 }
    const callback = jest.fn()

    manager.subscribe(target, 'count', callback)
    manager.notifyListeners(target, 'count')

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(target)
  })

  test('should unsubscribe a callback from a target and key', () => {
    const target = { count: 0 }
    const callback = jest.fn()

    manager.subscribe(target, 'count', callback)
    manager.unsubscribe(target, 'count')
    manager.notifyListeners(target, 'count')

    expect(callback).not.toHaveBeenCalled()
  })

  test('should warn when trying to subscribe an object already subscribed', () => {
    const target = { count: 0 }
    const callback = jest.fn()

    manager.subscribe(target, 'count', callback)
    manager.subscribe(target, 'count', callback)

    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  test('should throw an error when trying to subscribe to a non-object', () => {
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
})
