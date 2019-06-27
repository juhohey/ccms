import React, { Component } from 'react'
import styled from 'styled-components'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'

const EditorContainer = styled.div`
  .wysiwyg {
    background: #fafafa;
  }
  .public-DraftStyleDefault-ltr {
    padding: 6px;
  }
`

class EditorComponent extends Component {
  constructor (props) {
    super(props)
    const contentBlock = htmlToDraft(`${props.html}`)
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      this.state = {
        editorState

      }
    }
    this.domEditor = null
    this.setDomEditorRef = ref => { this.domEditor = ref }
  }

  onEditorStateChange (editorState) {
    const raw = convertToRaw(editorState.getCurrentContent())
    this.props.onChange(draftToHtml(raw).trim())
    this.setState({
      editorState
    })
  };

  componentDidMount () {
    this.domEditor.focusEditor()
  }

  render () {
    const { editorState } = this.state
    return (
      <EditorContainer onFocus={this.props.onFocus}>
        <Editor
          ref={this.setDomEditorRef}
          editorState={editorState}
          wrapperClassName='wrapper'
          editorClassName='wysiwyg'
          onEditorStateChange={e => this.onEditorStateChange(e)}
        />
        {/* <textarea
          disabled
          value={editorState.getCurrentContent ? draftToHtml(convertToRaw(editorState.getCurrentContent())) : ''}
        /> */}
      </EditorContainer>
    )
  }
}

export default EditorComponent
