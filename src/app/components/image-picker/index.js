import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { propEq, path } from 'ramda'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import Dialog from '../dialog'
import Icon from '../icon'
import { Row } from '../flex'
import { css, colors } from '../../theme'
import Button from '../button'
import { backgroundImagefy, unBackgroundImagefy } from '../../../utils/string'
import { FieldInput } from '../form/input'

const Image = styled.div`
  background-image: ${({ backgroundImage }) => backgroundImage || ''};
  height: 50px;
  width: 250px;
  cursor: pointer;
  margin-top: 6px;
  margin-bottom: 12px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0,0,0,0.2);
  ${css.cardLike}
`
const ImagePickerLabel = styled.label`
`
const ImagePickerInput = styled.div`
  i {
    display: inline-block;
    font-size: 22px;
    vertical-align: middle;
    margin-left: 16px;
    cursor: pointer;
  }
`
const Container = styled.div``
const UploadFormContainer = styled.div`

`
const GalleryContainer = styled.div``
const GalleryImage = styled.img`
  width: 200px;
  margin: 12px;
  ${({ isActive }) => isActive ? css.focused : ''}
`

/**
 * Image dialog picker component
 * Has 2 tabs: existing items & upload
 * Existing items tab is an ls grep png/jp
 * Upload tab is an input with a submit button
 * @param {Object} props
 *
 */
const ImagePicker = ({ label, onUpdate, value, isExternal }) => {
  const [isDialogOpen, setDialog] = useState(false)
  const [tabIndex, setTab] = useState(0)

  return <Container>
    <ImagePickerInput>
      <Row>
        <ImagePickerLabel>{label}</ImagePickerLabel>
      </Row>
      {value ? <Image backgroundImage={backgroundImagefy(value)} onClick={e => setDialog(true)} /> : null}
      {value
        ? <Button action='delete' onClick={e => onUpdate('', false)} >Remove</Button>
        : <Button onClick={e => setDialog(true)}>Add</Button>
      }
    </ImagePickerInput>

    <Dialog shouldRender={isDialogOpen} isOpen={isDialogOpen} onClose={e => setDialog(false)}>
      <Tabs selectedIndex={tabIndex} onSelect={n => setTab(n)}>
        <TabList>
          <Tab>Gallery</Tab>
          <Tab>External</Tab>
          <Tab>Upload</Tab>
        </TabList>

        <TabPanel>
          <Gallery value={value} onSelectImage={src => {
            setDialog(false)
            onUpdate(src, false)
          }} />
        </TabPanel>
        <TabPanel>
          <ExternalSource value={isExternal && value ? value : ''} onUpdate={src => {
            setDialog(false)
            onUpdate(src, true)
          }} />
        </TabPanel>
        <TabPanel>
          <UploadForm />
        </TabPanel>
      </Tabs>
    </Dialog>
  </Container>
}

const ExternalSource = ({ onUpdate, value, isExternal }) => {
  const [src, setSrc] = useState(value)

  return <section>
    <FieldInput label='URL Address' value={src} onChange={e => setSrc(e.target.value)} />
    <Button action='cancel' onClick={e => onUpdate('')}>Cancel</Button>
    <Button action='confirm' onClick={e => onUpdate(src)}>Save</Button>
  </section>
}

const Gallery = ({ onSelectImage, value }) => {
  const currentSrc = unBackgroundImagefy(value)
  const [images, setImages] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      const images = await (await fetch('/c/api/upload/image')).json()
      setImages(images)
    }
    fetchData()
  }, [])

  return <GalleryContainer>
    {images.map(image => (
      <GalleryImage isActive={image === currentSrc} key={image} src={image} onClick={e => onSelectImage(new URL(e.target.src).pathname)} />
    ))}
  </GalleryContainer>
}

const UploadForm = () => {
  const [selectedImage, setSelectedImage] = useState('')
  const [uploaded, callUpload] = useState(0)
  const [uploadState, setUploadState] = useState(-1) // initial, loading, done
  useEffect(() => {
    if (uploaded === 0) return
    const fetchData = async () => {
      const form = new FormData()
      form.append('image', selectedImage)
      setUploadState(0)
      const res = await fetch(
        '/c/api/upload/image',
        { method: 'POST', eaders: { 'Content-Type': 'multipart/form-data' }, body: form }
      )
      setUploadState(1)
    }
    fetchData()
  }, [uploaded])

  return <UploadFormContainer>
    <input type='file' onChange={e => setSelectedImage(e.target.files[0])} />
    <button onClick={e => callUpload(uploaded + 1)}> Upload</button>
    <label>
      {uploadState === -1 ? '' : uploadState === 0
        ? 'uploading...' : 'upload successful'
      }
    </label>
  </UploadFormContainer>
}

export default ImagePicker
