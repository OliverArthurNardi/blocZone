import createBlocZone from '@bloczone/core/src/BlocZone'
import createEventEmitter from '@bloczone/core/src/EventEmitterZone'

const bloc = createBlocZone({ count: 0 })
const emitter = createEventEmitter()

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

		emitter.on('increment', (_event, payload) => {
			if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
				bloc.setState(payload as { count: number })
			}
		})

		counter.addEventListener('click', () => {
			emitter.emit('increment', { count: bloc.getState().count + 1 })
		})

		bloc.subscribe(this, (nextState) => {
			this.counter = `${nextState.count}`
		})

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
		bloc.unsubscribe(this)
	}
}

customElements.define('counter-element', CounterElement)


