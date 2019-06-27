import React, { useState, useEffect } from 'react'
import { propEq } from 'ramda'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { pageGetPage } from '../../modules/layout'
import { pagesEditPage, pagesRemovePage, pagesPublishPage } from '../../modules/pages'
import { latestPublishEvent } from '../../modules/history/selectors'
import PageBreadcrumb from '../page/breadcrumb'
import { Container } from '../../components/flex'
import { LinkLike } from '../../components/link'
import Dialog, { DialogTitle, DialogFooter } from '../../components/dialog'
import { FieldInput } from '../../components/form/input'
import { getPropertySetter } from '../../../utils/hooks'
import Button, { Actions } from '../../components/button'
import ConfirmButton from '../../components/confirm'
import { makeSiteLink } from '../../../utils/site'

const Layout = styled.div`
  width: 100%;
`
const PagesEditorDialog = styled.div``

const EditPage = ({ isEditingPage, setIsEditingPage, onSave, page }) => {
  const [nextPage, setNextPage] = useState(page)
  const propertySetter = getPropertySetter(setNextPage, nextPage)
  const onClose = e => setIsEditingPage(false)
  const onSaveAction = e => {
    onClose()
    onSave(nextPage)
  }

  return <Dialog isOpen={isEditingPage} shouldRender={isEditingPage} onClose={onClose}>
    <PagesEditorDialog>
      <DialogTitle>Edit page</DialogTitle>
      <FieldInput value={nextPage.name} label={'Name'} onChange={propertySetter('name')} />
      <FieldInput value={nextPage.route} label={'Route'} onChange={propertySetter('route')} />
      <FieldInput
        type='checkbox'
        checked={nextPage.isPublished}
        label='Published'
        id='add-page-published'
        onChange={propertySetter('isPublished')} />
      <DialogFooter>
        <Actions>
          <Button onClick={onClose}>Cancel</Button>
          <Button action='confirm' onClick={onSaveAction}>Save</Button>
        </Actions>
      </DialogFooter>
    </PagesEditorDialog>
  </Dialog>
}

const PageDashboard = ({
  currentPage,
  currentPageName,
  latestPublishEvent,
  env,
  push,
  pagesPublishPage,
  pageGetPage,
  pagesEditPage,
  pagesRemovePage
}) => {
  const [isEditingPage, setIsEditingPage] = useState(false)
  useEffect(() => {
    pageGetPage(currentPageName)
  }, currentPageName)

  if (!currentPage) return null
  const crumbs = [{ label: 'Pages', to: '/c/pages' }]
  const currentPageLink = `${makeSiteLink(env)}${currentPage.route}`

  return <Layout>
    <PageBreadcrumb
      currentPage={currentPage}
      currentPageLink={currentPageLink}
      pagesPublishPage={pagesPublishPage}
      latestPublishEvent={latestPublishEvent}
      crumbs={crumbs}
      currentCrumbName={currentPage.name}
    />
    <Container>
      <h1>{currentPage.name}</h1>
      <Link to={`/c/pages/${currentPage.id}/page`}>Editor</Link>
      <div>
        <LinkLike onClick={e => setIsEditingPage(true)}>Edit</LinkLike>
      </div>
      <ConfirmButton label='delete' action='delete' onConfirm={e => {
        pagesRemovePage(currentPage.id)
        push('/c/pages')
      }} />
    </Container>
    <EditPage
      isEditingPage={isEditingPage}
      setIsEditingPage={setIsEditingPage}
      page={currentPage}
      onSave={nextPage => pagesEditPage(nextPage)}
    />
  </Layout>
}

const mapStateToProps = (store, ownProps) => {
  return {
    currentPageName: ownProps.match.params.id,
    currentPage: store.pages.find(propEq('id', store.currentPage)),
    latestPublishEvent: latestPublishEvent(store),
    push: ownProps.history.push,
    env: store.env
  }
}
const mapDispatchToProps = {
  pagesPublishPage,
  pageGetPage,
  pagesEditPage,
  pagesRemovePage
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageDashboard)
