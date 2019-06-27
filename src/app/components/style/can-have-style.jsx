
const ELEMENT_BLOCK_LEVEL = ['container', 'section', 'row', 'container']
const ELEMENT_TEXT = ['title', 'heading', 'text']

const PROPERTY_TEXT = ['textAlign']
const PROPERTY_TEXT_CONTENT = ['textContent']
const PROPERTY_COLOR = ['color']

const PROPS = {
  row: ['wrap'],
  column: ['width', 'xsWidth'],
  img: ['src']
}

const getCanHave = (elementName, property) => {
  if (ELEMENT_BLOCK_LEVEL.includes(elementName)) {
    return ![PROPERTY_COLOR, PROPERTY_TEXT_CONTENT].flat().includes(property)
  } else if (ELEMENT_TEXT.includes(elementName)) {
    return [
      PROPERTY_COLOR,
      PROPERTY_TEXT,
      PROPERTY_TEXT_CONTENT
    ].flat().includes(property)
  }
}

const getCanHaveProp = (elementName, property) => {
  return PROPS[elementName] && PROPS[elementName].includes(property)
}
const CanHaveStyle = ({ elementName, property, children }) => {
  const canHave = getCanHave(elementName, property)
  return canHave ? children : null
}

export const CanHaveProp = ({ elementName, property, children }) => {
  const canHave = getCanHaveProp(elementName, property)
  return canHave ? children : null
}

export default CanHaveStyle
