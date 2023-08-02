import { blocCounter } from '../store/blocCounter'

let counter: HTMLElement

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

		counter = document.createElement('div')
		counter.className = 'counter'
		counter.textContent = 'increment me'

		counter.addEventListener('click', () => {
      blocCounter.state.setState('increment', 'count', blocCounter.state.value.count +1)
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
		blocCounter.unsubscribe(this)
	}
}

customElements.define('counter-element', CounterElement)
