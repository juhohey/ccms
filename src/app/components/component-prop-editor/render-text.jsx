import React from 'react'

import { Field } from '../form/input'
import Enum from '../style/enum'
import STYLE from '../../constants/style'
import { getFieldUpdater } from '../../../utils/functions'
import CanHaveStyle from '../style/can-have-style'

const renderText = ({ onUpdateStyle, style, elementName }) => {
  const isColorInherited = style.color === 'inherit' || !style.color
  const updateField = getFieldUpdater(onUpdateStyle)

  return <div>
    <Enum title='Text align' selected={style.textAlign} options={STYLE.TEXT_ALIGNS}
      onChange={updateField('textAlign')}
    />
    <CanHaveStyle property='color' elementName={elementName}>
      <Field>
        <label>Color</label>
        <input
          type='color'
          value={isColorInherited ? '#000000' : style.color}
          onChange={updateField('color', true)}
        />
        <input
          value={isColorInherited ? '' : style.color}
          onChange={updateField('color', true)}
        />
        <Field>
          <label>Inherit</label>
          <input
            type='checkbox'
            checked={isColorInherited}
            onChange={e => onUpdateStyle({ field: 'color', value: e.target.checked ? 'inherit' : '' })}
          />
        </Field>
      </Field>
    </CanHaveStyle>
  </div>
}

export default renderText
