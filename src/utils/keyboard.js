import { ifElse, always } from 'ramda'

export const submitOnEnter = onSubmit => ifElse(
  isEnter, onSubmit, always(null)
)
export const isEnter = e => e.key === 'Enter'
