import React, { useEffect, useState } from 'react'
import { prop } from 'ramda'
import Select from '../dropdown/select'
import { get } from '../../actions/http-action'
import { useDidMount } from '../../../utils/hooks'
import { Label } from '../form/input'
import { pass } from '../../../utils/functions'

const ClassSelect = ({ className, onChange }) => {
  const [classNames, setClassNames] = useState([])
  const didMount = useDidMount()

  useEffect(() => {
    if (didMount) return
    const fetchData = async () => {
      const res = await get({ url: '/class-names' })
      setClassNames(res.classNames.map(className => ({ label: className, value: className })))
    }
    fetchData()
  }, [])

  const classNameLabelValue = className.trim().split(' ').filter(pass).map(value => ({ label: value, value }))
  return <div>
    <Label>Class name</Label>
    <Select
      values={classNameLabelValue}
      onChange={nextClasses => onChange(nextClasses ? nextClasses.map(prop('value')).join(' ') : '')}
      options={classNames}
    />
  </div>
}

export default ClassSelect
