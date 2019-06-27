import { useState, useEffect } from 'react'
import { assoc } from 'ramda'

export const getPropertySetter = (setter, setterTarget) => fieldName => e => {
  const value = e.target.checked ? e.target.checked : e.target.value
  setter(assoc(fieldName, value, setterTarget))
}

export const useDidMount = () => {
  const [didMount, setDidMount] = useState(false)
  useEffect(() => setDidMount(true), [])

  return didMount
}
