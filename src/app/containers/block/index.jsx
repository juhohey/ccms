import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { merge, propEq, assocPath, path, assoc, dissocPath, init, last, compose } from 'ramda'

import { colors } from '../../theme'
import texts from '../../texts'
import { get, post, _delete } from '../../actions/http-action'
import Element from '../../components/element'
import Tree from '../../components/tree'
import { Row, Column } from '../../components/flex'
import Button from '../../components/button'
import { SidebarContainer } from '../../components/sidebar'
import ComponentPropEditor from '../../components/component-prop-editor'
import AddElementDialog from '../../components/element/add'
import Breadcrumb, { BreadcrumbLast } from '../../components/breadcrumb'
import { FormBody } from '../../components/form'
import { showSnack } from '../../../utils/snackbar'
import { onClickPathHandler } from '../../../utils/dom'
import { renderWithPaths, getNodeByType } from '../../../utils/vdom'
import { pass } from '../../../utils/functions'
import ConfirmButton from '../../components/confirm'
import { blocksDeleteBlock } from '../../modules/blocks'

const View = styled.section`
  width: 100%;
  .page__action-save--active {
    background-color: ${colors.lightBlue._400};
    color: white;
  }
`
const cssCurrentPathElement = `
  position: relative;
  z-index: 5;
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
`
const ElementTab = styled.div`
  .section {background-image: url(//placehold.it/200x50/bababa?text=SECTION);}
  .container {background-image: url(//placehold.it/200x50/c1c1c1?text=CONTAINER);}
  .row {background-image: url(//placehold.it/200x50/cfcfcf?text=ROW);}
  .column {background-image: url(//placehold.it/200x50/e1e1e1?text=COL);}
  .text {background-image: url(//placehold.it/200x50/fafafa?text=TEXT);}
  ${({ currentPath }) => currentPath ? `[data-path="${currentPath}"] {${cssCurrentPathElement}}` : ''}
`
const ViewTab = styled.div`

`

const AddElement = styled.div`

width: 100%;
  button {
    margin: 12px auto;
    display: block;
  }
`
const getInitPathBeforeChildren = (path) => last(path) === 'children'
  ? getInitPathBeforeChildren(init(path))
  : path

const Block = ({ blockId, currentBlock, push, blocksDeleteBlock }) => {
  // const [currentTab, setCurrentTab] = useState(currentTabFromRouter)
  const [isAddingElement, setIsAddingElement] = useState(false)
  const [savedBlock, setSavedBlock] = useState(currentBlock) // savedBlock can be diffed
  const [activeBlock, setActiveBlock] = useState(currentBlock)
  const [activePath, setActivePath] = useState([0])

  useEffect(() => {
    const fetchData = async () => {
      const block = await get({ url: `/blocks/${blockId}` })
      setActiveBlock(block)
      setSavedBlock(block)
    }
    fetchData()
  }, [])

  if (!activeBlock) return null

  const onAddRootComponent = compose(
    component => {
      onChangeContent([component])
      setActivePath([0])
    },
    getNodeByType
  )
  const onAddComponent = (component, addToPath = activePath) => {
    const children = path(addToPath.concat(['children']), activeBlock.content)
    const nextChildren = children.concat(component)
    const nextContent = assocPath(activePath.concat(['children']), nextChildren, activeBlock.content)
    onChangeContent(nextContent)
    setActivePath(activePath.concat(['children', nextChildren.length - 1]))
  }
  const onChangeContent = nextContent => setActiveBlock(assoc('content', nextContent, activeBlock))
  const onRemoveComponent = (_) => {
    const nextContent = dissocPath(activePath, activeBlock.content)
    onChangeContent(nextContent)
    setActivePath(getInitPathBeforeChildren(activePath))
  }
  const onChangeComponent = nextComponent => {
    const nextContent = assocPath(activePath, nextComponent, activeBlock.content)
    onChangeContent(nextContent)
  }
  const onSaveBlock = async e => {
    await post({ url: `/blocks/${blockId}`, body: activeBlock })
    showSnack('Block saved!')
  }
  const onDeleteBlock = async e => {
    blocksDeleteBlock(blockId)
    push('/c/blocks')
    showSnack('Block deleted!')
  }

  const renderNoContent = () => (
    <div>
      <AddElement>
        <Button onClick={e => setIsAddingElement(true)}>Add root element</Button>
      </AddElement>
    </div>
  )
  return <View>
    <Breadcrumb currentName={`Block Editor: ${activeBlock.name}`} previous={[{ label: 'Blocks', to: '/c/blocks' }]}>
      <Button onClick={onSaveBlock}>Save</Button>
      <BreadcrumbLast>
        <ConfirmButton label='Delete' onConfirm={onDeleteBlock} />
      </BreadcrumbLast>
    </Breadcrumb>
    <Row wrap={0}>
      <SidebarContainer>
        <ComponentPropEditor
          onAddComponent={onAddComponent}
          onChangeComponent={e => {
            onChangeComponent(e)
          }}
          onRemoveComponent={onRemoveComponent}
          component={path(activePath, activeBlock.content)}
          disabledTypes={['blocks']}
        />
      </SidebarContainer>
      {!activeBlock.content.length
        ? renderNoContent()
        : <Tabs defaultIndex={0}>
          <TabList>
            <Tab>Element View</Tab>
            <Tab>Page View</Tab>
            <Tab>Tree View</Tab>
            <Tab>Settings</Tab>
          </TabList>
          <TabPanel>
            <ElementTab
              currentPath={activePath}
              // onMouseMove={onClickPathHandler(setCurrentPath)}
              // onMouseLeave={onMouseLeave}
              onClick={onClickPathHandler(setActivePath)}
            >
              {activeBlock.content.map((section, i) => (
                <Element
                  {...section}
                  path={[i]}
                  key={i}
                  // onAddItem={(path, item, component) => onAddComponent(getNode(item, component), path)}
                  // onTextChange={(path, text) => pageSetText({ path, text })}
                  onFocus={setActivePath}
                  focusedElementPath={activePath}
                />
              ))}
            </ElementTab>
          </TabPanel>
          <TabPanel>
            <ViewTab onClick={onClickPathHandler(setActivePath)}>
              {renderWithPaths(activeBlock.content)}
            </ViewTab>
          </TabPanel>
          <TabPanel>
            <Tree
              content={activeBlock.content}
              editorSetFocus={setActivePath}
              pageMoveItem={pass}
            />
          </TabPanel>
          <TabPanel>
            <Column>
              <FormBody
                title=''
                blankStyle={1}
                fields={{
                  name: { value: activeBlock.name, label: 'name' },
                  locked: { value: activeBlock.locked, label: 'Locked', description: texts('block.locked'), type: 'checkbox'
                  }
                }
                } onChangeFields={next => setActiveBlock(merge(activeBlock, next))} />
            </Column>
          </TabPanel>

        </Tabs>
      }
      <AddElementDialog
        isPortalOpen={isAddingElement}
        setPortalOpen={setIsAddingElement}
        onAddComponent={onAddRootComponent}
        disabledTypes={['blocks']}
      />
    </Row>
  </View>
}

const mapStateToProps = (store, ownProps) => {
  const blockId = ownProps.match.params.id
  return {
    blockId,
    currentBlock: store.blocks.content.find(propEq('id', blockId)),
    push: ownProps.history.push
  }
}
const mapDispatchToProps = {
  blocksDeleteBlock
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Block)
