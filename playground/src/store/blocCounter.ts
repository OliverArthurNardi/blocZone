
import { createBloc } from "@bloczone/core/src/bloczone"

const initialState = { count: 0 }
const BLOC_ID = 'COUNTER'
export const blocCounter = createBloc(BLOC_ID, initialState)
