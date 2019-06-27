import { assoc, assocPath, path, propEq } from 'ramda'
import { get, put } from '../../actions/http-action'
import { showSnackError } from '../../../utils/snackbar'

export const HISTORY_EVENT_TYPES = {
  PAGES_CREATE: 'PAGES_CREATE',
  PAGES_DELETE: 'PAGES_DELETE',
  PAGES_EDIT: 'PAGES_EDIT',
  PAGES_PUBLISH: 'PAGES_PUBLISH',
  PAGES_UNPUBLISH: 'PAGES_UNPUBLISH',
  PAGE_EDIT: 'PAGE_EDIT'
}

const HISTORY_ADD = 'HISTORY_ADD'
const HISTORY_SET = 'HISTORY_SET'

export const historySet = (history) => ({ type: HISTORY_SET, history })
export const historyAddEvent = (event) => dispatch => {
  historyPutSideEffect(event, dispatch)
  // API has the truth
}

const initialState = { current: [], next: [] }
export default (state = initialState, action) => {
  switch (action.type) {
    case HISTORY_ADD:
      return { ...state, current: [action.event].concat(state.current) }
    case HISTORY_SET:
      return { current: action.history, next: [] }
    default:
      return state
  }
}

export const historyGetSideEffect = (dispatch) => {
  get({ url: '/history' })
    .then(res => {
      return dispatch(historySet(res))
    })
    .catch(showSnackError('History API error'))
}
export const historyPutSideEffect = (body, dispatch) => {
  put({ url: '/history', body })
    .then(event => {
      dispatch(({ type: HISTORY_ADD, event }))
    })
    .catch(showSnackError('History API error'))
}
