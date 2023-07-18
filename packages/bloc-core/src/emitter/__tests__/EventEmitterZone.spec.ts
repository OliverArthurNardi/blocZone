import { describe, test, expect } from '@jest/globals'
import { createEventEmitter } from '../EventEmitterZone'

describe('createEventEmitter', () => {
  const eventEmitter = createEventEmitter()

  test('should call handler when event is emitted', () => {
    const eventName = 'testEvent'
    const payload = 'testPayload'

    let receivedEvent: string | null = null
    let receivedPayload: unknown | null = null

    const handler = (event: string, payload: unknown) => {
      receivedEvent = event
      receivedPayload = payload
    }

    eventEmitter.on(eventName, handler)
    eventEmitter.emit(eventName, payload)

    expect(receivedEvent).toEqual(eventName)
    expect(receivedPayload).toEqual(payload)
  })

  test('should stop calling handler after it has been removed', () => {
    const eventName = 'testEvent'
    const payload = 'testPayload'

    let callCount = 0
    const handler = () => {
      callCount++
    }

    eventEmitter.on(eventName, handler)
    eventEmitter.emit(eventName, payload) // increments callCount
    eventEmitter.off(eventName, handler)
    eventEmitter.emit(eventName, payload) // should not increment callCount

    expect(callCount).toEqual(1)
  })
})
