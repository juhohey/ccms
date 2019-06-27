import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { propEq } from 'ramda'

import { pageAddSection, pageAddItem, pageSetText, pageRemoveItem, pageGetPage, pageMoveItem, pageSave } from '../../modules/layout'
import { pagesPublishPage } from '../../modules/pages'
import { latestPublishEvent } from '../../modules/history/selectors'
import Element from '../../components/element'
import { editorSetFocus } from '../../modules/editor'
import { renderWithPaths } from '../../../utils/vdom'
import { onClickPathHandler } from '../../../utils/dom'
import Tree from '../../components/tree'
import SidebarEditor from '../sidebar/editor'
import { Row } from '../../components/flex'
import { colors } from '../../theme'
import PageBreadcrumb from './breadcrumb'
import Button from '../../components/button'
import { makeSiteLink } from '../../../utils/site'
import { mapBlocksToContent, removeEmptyBlocks } from '../../../utils/cms'

const View = styled.section`
  width: 100%;
  .page__action-save--active {
    background-color: ${colors.lightBlue._400};
    color: white;
  }
`
const AddSection = styled.div`
  border: 1px solid #ddd;
  padding: 64px 0;
  text-align: center;
  cursor: pointer;
`

const TreeTab = styled.div`

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
  .column-1,
  .column-2,
  .column-3,
  .column-4,
  .column-5,
  .column-6,.column-7.column-8,.column-9,
  .column-10,
  .column-11,
  .column-12
  {background-image: url(//placehold.it/200x50/e1e1e1?text=COL);}
  .text {background-image: url(//placehold.it/200x50/fafafa?text=TEXT);}
  .block {background-image: url(//placehold.it/200x50/888888?text=BLOCK);    display: flex;justify-content: center;
    align-items: center;
    font-size: 22px;
    color: white;}
  ${({ currentPath }) => currentPath ? `[data-path="${currentPath}"] {${cssCurrentPathElement}}` : ''}
`
const ViewTab = styled.div`

`

const Page = ({
  currentPageName,
  currentTabFromRouter,
  currentPage,
  focusedElementPath,
  layout,
  blocks,
  env,
  push,
  latestPublishEvent,
  pageAddSection,
  pageAddItem,
  pageSetText,
  pageRemoveItem,
  pageGetPage,
  pageMoveItem,
  pageSave,
  pagesPublishPage,
  editorSetFocus
}) => {
  const [currentTab, setCurrentTab] = useState(currentTabFromRouter)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    pageGetPage(currentPageName)
  }, currentPageName)

  if (!currentPage || blocks.status === 'initial' || blocks.status === 'loading') return null

  const onMouseLeave = () => setCurrentPath('')
  const crumbs = [{ label: 'Pages', to: '/c/pages' }, { label: currentPage.name, to: `/c/pages/${currentPage.id}` }]
  const currentPageLink = `${makeSiteLink(env)}${currentPage.route}`
  const content = removeEmptyBlocks(layout.content, blocks.content)

  return <View>
    <PageBreadcrumb
      currentPage={currentPage}
      currentPageLink={currentPageLink}
      pagesPublishPage={pagesPublishPage}
      latestPublishEvent={latestPublishEvent}
      crumbs={crumbs}
      currentCrumbName={'Editor'}
    >{
        layout.status === 'loading'
          ? 'Loading...'
          : <Button action='save' className={'page__action-save'} onClick={pageSave}>Save changes</Button>
      }
    </PageBreadcrumb>

    <Row wrap={0}>
      <SidebarEditor />
      <Tabs onSelect={i => {
        setCurrentTab(i)
        push({ search: `?tab=${i}` })
      }} defaultIndex={currentTab}>
        <TabList>
          <Tab>Element View</Tab>
          <Tab>Page View</Tab>
          <Tab>Tree View</Tab>
        </TabList>

        <TabPanel>
          <ElementTab
            currentPath={currentPath}
            onMouseMove={onClickPathHandler(setCurrentPath)} onMouseLeave={onMouseLeave}
            onClick={onClickPathHandler(editorSetFocus)
            }>
            {content.map((section, i) => (
              <Element
                {...section}
                path={[i]}
                key={i}
                // onAddItem={(path, item, component) => pageAddItem({ path, item: getNode(item, component) })}
                onTextChange={(path, text) => pageSetText({ path, text })}
                onFocus={(path) => {
                  editorSetFocus(path)
                }}
                onRemoveItem={pageRemoveItem}
                focusedElementPath={focusedElementPath}
              />
            ))}
            <AddSection onClick={pageAddSection}>Add Section +</AddSection>
          </ElementTab>
        </TabPanel>
        <TabPanel>
          <ViewTab onClick={onClickPathHandler(editorSetFocus)}>
            {renderWithPaths(mapBlocksToContent(content, blocks.content))}
          </ViewTab>
        </TabPanel>
        <TabPanel>
          <TreeTab>
            <Tree content={content} editorSetFocus={editorSetFocus} pageMoveItem={pageMoveItem} />
          </TreeTab>
        </TabPanel>
      </Tabs>
    </Row>
  </View>
}

const mapStateToProps = (store, ownProps) => {
  const routerSearch = ownProps.location.search.substring(1).split('&').find(paramValue => paramValue.includes('tab'))
  const currentTabFromRouter = routerSearch ? parseInt(routerSearch.split('=').pop()) : 0
  return {
    blocks: store.blocks,
    layout: store.layout,
    currentPageName: ownProps.match.params.id,
    currentTabFromRouter,
    push: ownProps.history.push,
    focusedElementPath: store.editor.focusedElementPath,
    currentPage: store.pages.find(propEq('id', store.currentPage)),
    latestPublishEvent: latestPublishEvent(store),
    env: store.env
  }
}
const mapDispatchToProps = {
  pageAddSection,
  pageAddItem,
  pageSetText,
  editorSetFocus,
  pageRemoveItem,
  pageGetPage,
  pageMoveItem,
  pageSave,
  pagesPublishPage
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Page)
