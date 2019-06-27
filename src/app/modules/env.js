import { get } from '../actions/http-action'

const ENV_SET = 'ENV_SET'

export const envSet = (env) => ({ type: ENV_SET, env })

const initialState = {}
export default (state = initialState, action) => {
  switch (action.type) {
    case ENV_SET:
      return action.env
    default:
      return state
  }
}

export const envGetSideEffect = (dispatch) => {
  get({ url: '/env' })
    .then(res => {
      return dispatch(envSet(res))
    })
}
