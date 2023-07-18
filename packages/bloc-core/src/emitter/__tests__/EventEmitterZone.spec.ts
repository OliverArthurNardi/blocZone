import { describe, test, expect } from '@jest/globals'
import { createEventEmitter } from '../EventEmitterZone'

describe('createEventEmitter', () => {
	interface TestEvents {
		testEvent: string
	}

	const eventEmitter = createEventEmitter<TestEvents>()

	test('should call handler when event is emitted', () => {
		const eventName: keyof TestEvents = 'testEvent'
		const payload = 'testPayload'

		let receivedPayload: TestEvents[keyof TestEvents] | null = null

		const handler = (payload: TestEvents[keyof TestEvents]) => {
			receivedPayload = payload
		}

		eventEmitter.on(eventName, handler)
		eventEmitter.emit(eventName, payload)

		expect(receivedPayload).toEqual(payload)
	})

	test('should stop calling handler after it has been removed', () => {
		const eventName: keyof TestEvents = 'testEvent'
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
