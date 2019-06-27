import React, { useState } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { push } from 'connected-react-router'
import { clone, assoc } from 'ramda'

import Dialog, { DialogTitle } from '../../components/dialog'
import { FieldInput } from '../../components/form/input'
import Button, { Actions } from '../../components/button'
import { getId } from '../../../utils/id'
import { pageRemoveItem, pageSave, pageAddItem } from '../../modules/layout'
import { pagesAddPage, pagesEditPage, pagesRemovePage } from '../../modules/pages'
import { colors } from '../../theme'
import { SidebarContainer } from '../../components/sidebar'
import { Row } from '../../components/flex'

import View from '../../components/view'
import { Small } from '../../components/elements'
import { makeSiteLink } from '../../../utils/site'
import { LinkLike } from '../../components/link'
const PagesEditorComponent = styled.div`

`
const PagesEditorDialog = styled.div``
const Link = styled.a`
  cursor: pointer;
  display: inline-block;
  margin-right: 6px;
`

const List = styled.ul`
  list-style: none;
`
const ListItem = styled.li`
  margin-bottom: 16px;
`
const ListItemTitle = styled.span`
  font-size: 16px;
  color: ${colors.font._400};
  display: block;
`
const ListItemSubTitle = styled.span`
  font-size: 14px;
  color: ${colors.font._300};
  display: block;
`
const ListItemAction = styled.div`
  display: flex;

`

const Pages = ({ pages, pagesAddPage, pagesEditPage, pagesRemovePage, push, editorSetFocus, env }) => {
  return <Row wrap={0}>
    <SidebarPages pagesAddPage={pagesAddPage} />
    <View>
      <List>
        {pages.map((page, i) => (
          <ListItem key={page.route}>
            <ListItemTitle>{page.name}</ListItemTitle>
            <ListItemSubTitle>{page.route}</ListItemSubTitle>

            <LinkLike onClick={e => push(`/c/pages/${page.id}/page`)}>Editor</LinkLike>
            <LinkLike onClick={e => push(`/c/pages/${page.id}`)}>View</LinkLike>
            <ListItemAction>
              <Link target='_blank' href={`${makeSiteLink(env)}${page.route}`}>View published</Link>
            </ListItemAction>
          </ListItem>
        ))}
      </List>
    </View>

  </Row >
}

const initialState = { name: '', route: '', isPublished: '', id: '' }
const SidebarPages = ({ pagesAddPage }) => {
  const [isAddingPage, setIsAddingPage] = useState(false)
  const [nextPage, setNextPage] = useState(initialState)
  const propertySetter = (fieldName) => e => setNextPage(assoc(fieldName, e.target.value, nextPage))
  const onSave = e => {
    pagesAddPage(assoc('id', getId(), nextPage))
    setNextPage(clone(initialState))
    setIsAddingPage(false)
  }

  return <SidebarContainer>
    <PagesEditorComponent>
      <h4>Pages</h4>
      <div>
        <Small>Actions</Small>
        <button onClick={e => setIsAddingPage(true)}>Add page</button>
      </div>
    </PagesEditorComponent>
    <Dialog isOpen={isAddingPage} shouldRender={isAddingPage} onClose={e => setIsAddingPage(false)}>
      <PagesEditorDialog>
        <DialogTitle>Add page</DialogTitle>
        <FieldInput value={nextPage.name} label={'Name'} onChange={propertySetter('name')} />
        <FieldInput value={nextPage.route} label={'Route'} onChange={propertySetter('route')} />
        {/* <RouteInput value={nextPage.route} onChange={propertySetter('route')} /> */}
        <FieldInput
          type='checkbox'
          checked={nextPage.isPublished}
          label='Published'
          id='add-page-published'
          onChange={
            e => setNextPage(assoc('isPublished', e.target.checked, nextPage))
          } />
        <Actions>
          <Button onClick={e => setIsAddingPage(false)}>Cancel</Button>
          <Button action='confirm' onClick={onSave}>Save</Button>
        </Actions>
      </PagesEditorDialog>
    </Dialog>
  </SidebarContainer>
}

const mapStateToProps = (store) => ({
  pages: store.pages,
  editor: store.editor,
  router: store.router,
  env: store.env
})

const mapDispatchToProps = {
  pageRemoveItem,
  pagesAddPage,
  pageAddItem,
  pagesEditPage,
  pagesRemovePage,
  push,
  pageSave
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pages)
