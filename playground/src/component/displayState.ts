import { useBloc } from '@bloczone/core/src/bloczone'

const blocCounter = useBloc<{ count: number }>('COUNTER')

let state: HTMLElement

export default class StateDisplayedElement extends HTMLElement {
	constructor() {
		super()

		const shadow = this.attachShadow({ mode: 'open' })

		const style = document.createElement('style')
		style.textContent = `
      .state {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background-color: #eee;
      }
    `

		state = document.createElement('div')
		state.className = 'state'

		shadow.appendChild(style)
		shadow.appendChild(state)
	}

	connectedCallback() {
		if (blocCounter) {
			blocCounter.subscribe(this, (nextState) => {
				state.textContent = `${nextState.count}`
			}, ['count'])
		}
	}

	disconnectedCallback() {
		if (blocCounter) {
			blocCounter.unsubscribe(this)
		}
	}
}

customElements.define('state-displayed', StateDisplayedElement)
