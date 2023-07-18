import { createEventEmitter } from '@bloczone/core/src/emitter'

import { blocCounter } from '../store/blocCounter'

interface CounterEvents {
	increment: { count: number }
	decrement: { count: number }
}

const emitter = createEventEmitter<CounterEvents>()

export default class CounterElement extends HTMLElement {
	constructor() {
		super()

		const shadow = this.attachShadow({ mode: 'open' })

		const style = document.createElement('style')
		style.textContent = `
      .counter {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        width: fit-content;
        height: 3rem;
        border-radius: 0.5rem;
				padding: 0 1rem;
        background-color: #eee;
        cursor: pointer;
      }
    `

		const counter = document.createElement('div')
		counter.className = 'counter'
		counter.textContent = 'increment me'

		emitter.on('increment', ({ count }) => {
			blocCounter.setState({ count })
		})

		counter.addEventListener('click', () => {
			emitter.emit('increment', { count: blocCounter.getState().count + 1 })
		})

		if (blocCounter) {
			const { count } = blocCounter.getState()
			this.counter = `${count}`
		}

		shadow.appendChild(style)
		shadow.appendChild(counter)
	}

	get counter() {
		return this.getAttribute('counter') || '0'
	}

	set counter(value) {
		this.setAttribute('counter', value)
	}

	disconnectedCallback() {
		blocCounter.unsubscribe(this)
	}
}

customElements.define('counter-element', CounterElement)
