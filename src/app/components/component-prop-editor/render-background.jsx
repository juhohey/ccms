import React from 'react'

import ImagePicker from '../image-picker'
import { Field } from '../form/input'
import Enum from '../style/enum'
import Button from '../button'
import STYLE from '../../constants/style'
import { getFieldUpdater } from '../../../utils/functions'

const renderBackground = ({ onUpdateStyle, onUpdateBackgroundImage, style }) => {
  const updateField = field => e => onUpdateStyle({ field, value: e.target.value })
  const updateFieldEnum = getFieldUpdater(onUpdateStyle)
  return <div>
    <h5>Background</h5>
    <div>
      <Field full>
        <ImagePicker
          onUpdate={imageProps => onUpdateBackgroundImage(imageProps)}
          value={style.backgroundImage}
          label='Background image'
        />
      </Field>
      <Field>
        <label>Background Color</label>
        <input
          type='color'
          value={!style.backgroundColor ? '#000000' : style.backgroundColor}
          onChange={updateField('backgroundColor')}
        />
        <input
          value={!style.backgroundColor ? '' : style.backgroundColor}
          onChange={updateField('backgroundColor')}
        />
        <Button
          action='cancel'
          onClick={e => onUpdateStyle({ field: 'backgroundColor', value: null })}
        >Clear</Button>
      </Field>
      <Enum
        title='Background position'
        selected={style.backgroundPosition || ''}
        options={STYLE.BACKGROUND_POSITIONS}
        onChange={updateFieldEnum('backgroundPosition')}
      />
      <Enum
        title='Background size'
        selected={style.backgroundSize || ''}
        options={STYLE.BACKGROUND_SIZES}
        onChange={updateFieldEnum('backgroundSize')}
      />
      <Enum
        title='Background repeat'
        selected={style.backgroundRepeat || ''}
        options={STYLE.BACKGROUND_REPEAT}
        onChange={updateFieldEnum('backgroundRepeat')}
      />
    </div>
  </div>
}

export default renderBackground
