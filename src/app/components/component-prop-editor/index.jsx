import React, { useState } from 'react'
import styled from 'styled-components'
import { assoc, assocPath } from 'ramda'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import AddElementDialog from '../element/add'
import Button from '../button'
import { Small } from '../elements'
import { backgroundImagefy } from '../../../utils/string'
import renderPadding from './render-padding'
import renderBackground from './render-background'
import renderCommonProps from './render-common-props'
import renderText from './render-text'
import renderProps from './render-props'
import { getNodeByType } from '../../../utils/vdom'

const EditorSection = styled.div`
  margin-bottom: 40px;
`
const EditorElementActions = styled.div`
  button {margin-right: 12px;}
`

const canHaveChildren = elementName => {
  switch (elementName) {
    case 'text':
      return false
    default:
      return true
  }
}

const ComponentPropEditor = ({
  component,
  onRemoveComponent,
  onAddComponent,
  onChangeComponent,
  disabledTypes
}) => {
  if (!component) {
    return null
  }
  const [isAddingElement, setIsAddingElement] = useState(false)
  const { element, props = {}, children } = component
  const { style = {} } = props

  const onUpdateProps = ({ field, value }) => {
    onChangeComponent(assocPath(['props', field], value, component))
  }
  const onNextProps = (nextProps) => onChangeComponent(assoc('props', nextProps, component))
  const onUpdateStyle = ({ field, value }) => onChangeComponent(assocPath(['props', 'style', field], value, component))
  const onUpdateText = text => onChangeComponent(assoc('children', [text], component))
  const onUpdateBackgroundImage = (src, isExternal) => {
    const nextComponent = assocPath(['props', 'style', 'backgroundImage'], backgroundImagefy(src), component)
    onChangeComponent(
      assocPath(['element', 'isExternal'], isExternal, nextComponent)
    )
  }
  const onUpdateSrc = (src, isExternal) => {
    const nextComponent = assocPath(['props', 'src'], src, component)
    return onChangeComponent(assocPath(['element', 'isExternal'], isExternal, nextComponent))
  }
  const onAddComponentMapToNode = (element, props, customComponent) => onAddComponent(
    getNodeByType(element, props, customComponent)
  )

  const isBlockType = element.type === 'block'

  return <div>
    <div>
      <EditorSection>
        <h4>
          <Small>Selected Element</Small>
          {element.name}
        </h4>
        <EditorElementActions>
          <Small>Actions</Small>
          {!isBlockType && canHaveChildren(element.name)
            ? <Button onClick={e => setIsAddingElement(true)}>Add element</Button>
            : null
          }
          <Button onClick={onRemoveComponent}>Delete</Button>
        </EditorElementActions>
      </EditorSection>

      <EditorSection>
        {renderProps({ style, props, element, children, onUpdateSrc, onUpdateText, onNextProps })}
      </EditorSection>

      {
        isBlockType
          ? null
          : (
            <div>
              <Small>Edit Element</Small>
              <Tabs>
                <TabList>
                  <Tab>Props</Tab>
                  <Tab>Text</Tab>
                  <Tab>Padding</Tab>
                  <Tab>Background</Tab>
                </TabList>

                {/* Common props ~ id, class */}
                <TabPanel>
                  {renderCommonProps({ props, onUpdateProps, key: component.id })}
                </TabPanel>

                {/* Text */}
                <TabPanel>
                  {renderText({ style, elementName: element.name, onUpdateStyle })}
                </TabPanel>

                {/* Padding */}
                <TabPanel>
                  {renderPadding({ style, onUpdateProps, element })}
                </TabPanel>

                {/* BG props */}
                <TabPanel>
                  {renderBackground({ style, onUpdateStyle, onUpdateBackgroundImage })}
                </TabPanel>
              </Tabs>
            </div>
          )
      }
    </div>
    <AddElementDialog
      isPortalOpen={isAddingElement}
      setPortalOpen={setIsAddingElement}
      onAddComponent={onAddComponentMapToNode}
      disabledTypes={disabledTypes}
    />
  </div>
}

export default ComponentPropEditor
