import type { EventReceiver, EventEmitterProps } from '../types'

/**
 * Creates an event emitter object.
 *
 * @template E - The type of the events object.
 * @returns An event emitter object with `on`, `off`, and `emit` methods.
 */
export function createEventEmitter<E extends object>(): EventEmitterProps<E> {
	const handlers: Record<string, Array<EventReceiver<unknown>>> = {}

	const on: EventEmitterProps<E>['on'] = <K extends keyof E>(
		event: K,
		handler: EventReceiver<E[K]>
	) => {
		const currentHandlers = handlers[event as string] || []
		handlers[event as string] = [...currentHandlers, handler as unknown as EventReceiver<unknown>]
	}

	const off: EventEmitterProps<E>['off'] = <K extends keyof E>(
		event: K,
		handler: EventReceiver<E[K]>
	) => {
		const currentHandlers = handlers[event as string] || []
		handlers[event as string] = currentHandlers.filter(
			(h) => h !== (handler as unknown as EventReceiver<unknown>)
		)
	}

	const emit: EventEmitterProps<E>['emit'] = <K extends keyof E>(event: K, payload: E[K]) => {
		const currentHandlers = handlers[event as string] || []
		currentHandlers.forEach((handler) => (handler as EventReceiver<unknown>)(payload))
	}

	return {
		on,
		off,
		emit
	}
}
