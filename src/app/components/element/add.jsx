import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'

import Dialog, { DialogTitle, DialogBody } from '../dialog'
import ELEMENTS from '../../../../cms/cms-components'
import { Row } from '../flex'
import texts from '../../texts'

const ElementGroup = styled.div`
`
const Elements = styled.div`

`
const AddElement = styled.div`
  height: 150px;
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 1px 1px rgba(0,0,0,0.2);
  cursor: pointer;
  margin: 6px;
  background: #efefef;
  text-transform: capitalize;
  font-size: 16px;
`
const ElementGroupHeading = styled.h6`

`

const BlockTab = ({ blocks, onAddComponent }) => {
  return <ElementGroup>
    <ElementGroupHeading>Add blocks</ElementGroupHeading>
    <Row>{blocks.map((block) => {
      return <AddElement wrap={0} key={block.id} onClick={e => {
        onAddComponent({
          name: block.name,
          blockId: block.id,
          type: 'block'
        })
      }}>
        {block.name}
      </AddElement>
    })}
    </Row>
  </ElementGroup>
}

const CustomTab = ({ custom, onAddComponent }) => {
  return <ElementGroup>
    <ElementGroupHeading>Add custom component</ElementGroupHeading>
    <Row>
      {custom.map(customComponent => (
        <AddElement
          key={customComponent.name}
          onClick={e => {
            onAddComponent({
              name: customComponent.name,
              type: 'custom'
            },
            {},
            customComponent.component
            )
          }}
        >
          {customComponent.name}
        </AddElement>
      ))}
    </Row>
  </ElementGroup>
}

const AddElementDialog = ({ custom, blocks, isPortalOpen, setPortalOpen, onAddComponent, disabledTypes = [] }) => {
  if (!isPortalOpen) return null
  return <Dialog
    shouldRender={isPortalOpen}
    isOpen={isPortalOpen}
    onClose={e => setPortalOpen(false)}
    type='full'
  >
    <DialogTitle>Add element</DialogTitle>
    <Tabs defaultIndex={0}>
      <TabList>
        <Tab>Components</Tab>
        <Tab>Custom</Tab>
        <Tab>Blocks</Tab>
      </TabList>
      <DialogBody>
        <TabPanel>
          <Elements>
            <ElementGroup>
              <ElementGroupHeading>Layout</ElementGroupHeading>
              <Row>
                {ELEMENTS.LAYOUT.map(element => <AddElement
                  key={element.name}
                  onClick={e => {
                    setPortalOpen(false)
                    const initialProps = element.getInitialProps ? element.getInitialProps() : {}
                    onAddComponent({ name: element.name, tag: element.tag }, initialProps)
                  }}
                >
                  {element.name}
                </AddElement>)}
              </Row>
            </ElementGroup>
            <ElementGroup>
              <ElementGroupHeading>Text</ElementGroupHeading>
              <Row>
                {ELEMENTS.TEXT.map(element => <AddElement
                  key={element.name}
                  onClick={e => {
                    setPortalOpen(false)
                    onAddComponent(element)
                  }}
                >
                  {element.name}
                </AddElement>)}
              </Row>
            </ElementGroup>
            <ElementGroup>
              <ElementGroupHeading>Image</ElementGroupHeading>
              <Row>
                <AddElement
                  onClick={e => {
                    setPortalOpen(false)
                    onAddComponent({ name: 'img', tag: 'img' })
                  }}
                >Image
                </AddElement>
              </Row>
            </ElementGroup>
          </Elements>
        </TabPanel>
        <TabPanel>
          <CustomTab custom={custom} onAddComponent={onAddComponent} />
        </TabPanel>
        <TabPanel>
          {disabledTypes.includes('blocks')
            ? texts('blocks.disabled')
            : <BlockTab blocks={blocks} onAddComponent={onAddComponent} />
          }

        </TabPanel>
      </DialogBody>
    </Tabs>
  </Dialog>
}

const mapStateToProps = (state) => ({
  custom: state.custom,
  blocks: state.blocks.content
})

export default connect(mapStateToProps)(AddElementDialog)
