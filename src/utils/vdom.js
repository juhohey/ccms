
import { isString } from './string'
import htmlToJSX from './html-to-jsx'
import { addDataPathToProps } from './dom'
import { getId } from './id'

const { createElement } = require('react')
const { assoc, mergeDeepLeft, merge } = require('ramda')

export const incrementChildPath = (path, childIndex) => path.concat(['children', childIndex])

export const createElementNested = (shouldRequire = false, injectProps) => (component) => {
  // Case: string content child
  const isTextElement = typeof component === 'string'
  if (isTextElement) return htmlToJSX(component)

  const tag = component.element.custom
    ? shouldRequire
      ? require(`../../cms/components/${component.element.custom.path}`).default
      : component.component
    : component.element.tag

  const componentChildren = (component.children || [])
  const isChildEditorContent = componentChildren.length && typeof componentChildren[0] === 'string'
  const children = componentChildren.length && !isChildEditorContent
    ? component.children.map(createElementNested(shouldRequire, injectProps))
    : null
  const propsWithChildren = isChildEditorContent
    ? mergeDeepLeft({ dangerouslySetInnerHTML: { __html: component.children[0] } }, component.props)
    : component.props

  // Note: text component will not be rendered
  if (component.element.name === 'text') {
    return component.children.map(createElementNested(shouldRequire, injectProps))
  }
  const propsWithInjected = injectProps ? injectProps(component.element, propsWithChildren) : propsWithChildren
  const props = assoc('key', component.id || Math.random(), propsWithInjected)
  return createElement(tag, props, children)
}

const addPathToElement = (path, component, i) => {
  if (isString(component)) return component
  const nextPath = path.concat(i)
  component.element.path = nextPath
  if (component.children) {
    component.children = component.children.map((child, j) => addPathToElement(nextPath.concat('children'), child, j))
  }
  return component
}

export const renderWithPaths = content => {
  return content
    .map((section, i) => addPathToElement([], section, i))
    .map(createElementNested(false, addDataPathToProps))
}

export const getNode = (element, props = {}, component) => ({
  element,
  props: merge({ style: {}, className: element.name }, props),
  children: [],
  id: Math.random().toString(),
  component
})

export const getNodeByType = (element, props, customComponent) => {
  switch (element.type) {
    case 'block':
      return { element, id: getId() }
    case 'custom':
    default:
      return getNode(element, props, customComponent)
  }
}
