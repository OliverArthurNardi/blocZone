import type { EventReceiver, EventEmitterProps } from '../types'

/**
 * Creates an event emitter that allows for subscribing to, unsubscribing from, and emitting events.
 * 
 * @returns {EventEmitterProps} The event emitter with `on`, `off`, and `emit` methods.
 */
export function createEventEmitter(): EventEmitterProps {
	const handlers: Map<string, EventReceiver[]> = new Map()

	const on = (event: string, handler: EventReceiver) => {
		const currentHandlers = handlers.get(event) || []
		handlers.set(event, [...currentHandlers, handler])
	}
	
	const off = (event: string, handler: EventReceiver) => {
		const currentHandlers = handlers.get(event) || []
		if (!currentHandlers) {
			console.warn(`Event: ${event} not found`)
			return
		}
		handlers.set(
			event,
			currentHandlers.filter((h) => h !== handler)
		)
	}
	
	const emit = (event: string, payload: unknown) => {
		const currentHandlers = handlers.get(event) || []
		if (!currentHandlers) {
			console.warn(`Event: ${event} not found`)
			return
		}
		currentHandlers.forEach((handler) => {
			try {
				handler(event, payload)
			} catch (error) {
				console.error(`Error executing handler for event '${event}':`, error)
			}
		})
	}

	return {
		on,
		off,
		emit
	}
}
