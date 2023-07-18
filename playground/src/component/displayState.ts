import createBlocZone from '@bloczone/core/src/BlocZone'

const bloc = createBlocZone({ count: 0 })

export default class StateDisplayerElement extends HTMLElement {
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

		const state = document.createElement('div')
		state.className = 'state'
		state.textContent = `${bloc.getState().count}`

		bloc.subscribe(this, (nextState) => {
			state.textContent = `${nextState.count}`
		})

		shadow.appendChild(style)
		shadow.appendChild(state)
	}

	disconnectedCallback() {
		bloc.unsubscribe(this)
	}
}

customElements.define('state-displayer', StateDisplayerElement)
