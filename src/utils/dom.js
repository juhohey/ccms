import { assoc } from 'ramda'

export const parentUntil = (element, condition) => {
  let parent = element
  while (parent && !condition(parent)) {
    parent = parent.parentElement
  }
  return parent
}

export const onClickPathHandler = callAction => e => {
  const element = e.target.dataset.path
    ? e.target
    : parentUntil(e.target, element => element.dataset.path)

  if (!element || !element.dataset.path) {
    return null
  }
  const elementPath = element.dataset.path.split(',').map(item => {
    const triedParsed = parseInt(item)
    return Number.isNaN(triedParsed) ? item : triedParsed
  })
  callAction(elementPath)
}

export const addDataPathToProps = (element, props) => assoc(
  'data-path',
  element.path.toString(),
  props
)
