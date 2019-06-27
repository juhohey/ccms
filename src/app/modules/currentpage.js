import { assoc, assocPath, path, propEq } from 'ramda'

const CURRENT_PAGE_SET = 'CURRENT_PAGE_SET'

export const currentPageSet = (id) => ({ type: CURRENT_PAGE_SET, id })

const initialState = {}
export default (state = initialState, action) => {
  switch (action.type) {
    case CURRENT_PAGE_SET:
      return action.id
    default:
      return state
  }
}
