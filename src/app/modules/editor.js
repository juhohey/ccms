import { assoc, assocPath, path } from 'ramda'

const SET_FOCUS = 'SET_FOCUS'

export const editorSetFocus = (path) => ({ type: SET_FOCUS, path })
const initialState = {
  focusedElementPath: []
}
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_FOCUS:
      return { ...state, focusedElementPath: action.path }
    default:
      return state
  }
}
