import React from 'react'
import { connect } from 'react-redux'
import { path } from 'ramda'
import { pageUpdateProps, pageRemoveItem, pageAddItem } from '../../modules/layout'
import { SidebarContainer } from '../../components/sidebar'
import ComponentPropEditor from '../../components/component-prop-editor'

const SidebarEditor = (props) => {
  const currentPath = props.editor.focusedElementPath
  if (!currentPath.length) {
    return null
  }
  const component = path(currentPath, props.layout.content)
  const onChangeComponent = nextComponent => props.pageUpdateProps({ path: currentPath, value: nextComponent })
  const onRemoveComponent = e => props.pageRemoveItem(currentPath)
  const onAddComponent = nextComponent => props.pageAddItem({ path: currentPath, item: nextComponent })

  return <SidebarContainer>
    <ComponentPropEditor
      component={component}
      onChangeComponent={onChangeComponent}
      onRemoveComponent={onRemoveComponent}
      onAddComponent={onAddComponent}
    />
  </SidebarContainer>
}

const mapStateToProps = (store, ownProps) => ({
  layout: store.layout,
  editor: store.editor
})

const mapDispatchToProps = {
  pageUpdateProps,
  pageRemoveItem,
  pageAddItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SidebarEditor)
