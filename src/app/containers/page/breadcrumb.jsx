import React from 'react'
import styled from 'styled-components'

import Breadcrumb, { BreadcrumbLast } from '../../components/breadcrumb'
import { Small } from '../../components/elements'
import Button from '../../components/button'
import { colors } from '../../theme'
import { Row } from '../../components/flex'

const StatusContainer = styled.div`
  margin-right: 16px;
  color: ${colors.font._300}
  width: 120px;
  font-size: 11px;
`
const PublishButton = styled(Button)`
  width: 120px;
`
const getPrettyDate = ts => {
  const d = new Date(ts).toISOString()
  return `${d.substring(0, 10)} ${d.substring(11, 19)}`
}

const PageBreadcrumb = ({ currentPage, currentPageLink, pagesPublishPage, latestPublishEvent, crumbs, currentCrumbName, children }) => {
  if (!currentPage) return null

  const publishMaybe = nextState => e => pagesPublishPage({ isPublished: nextState, id: currentPage.id })
  const publishedLabel = currentPage.isPublished ? 'Published' : 'Unpublished'
  const publishDate = latestPublishEvent ? getPrettyDate(latestPublishEvent.when) : '-'
  return <Breadcrumb previous={crumbs} currentName={currentCrumbName}>
    {children}
    <BreadcrumbLast>
      <Row>
        <StatusContainer>
          <Small>{publishedLabel}</Small>
          {publishDate}
          <br />
          {currentPage.isPublished ? <a target='_blank' href={currentPageLink}>View published</a> : null}
        </StatusContainer>
        {currentPage.isPublished
          ? <PublishButton action='cancel' onClick={publishMaybe(false)}>Unpublish</PublishButton>
          : <PublishButton action='attention' onClick={publishMaybe(true)}>Publish</PublishButton>
        }
      </Row>
    </BreadcrumbLast>
  </Breadcrumb>
}

export default PageBreadcrumb
