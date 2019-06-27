import React from 'react'
import ReactSelect from 'react-select'

class Select extends React.Component {
  constructor (props) {
    super(props)
    this.state = { selectedOption: [] }
    this.onChange = this.onChange.bind(this)
  }
  componentWillMount () {
    this.setState({ selectedOption: this.props.values || [] })
  }
  componentWillReceiveProps (nextProps) {
    this.setState({ selectedOption: nextProps.values || [] })
  }
  onChange (selectedOption) {
    this.props.onChange(selectedOption)
  };
  render () {
    const { selectedOption } = this.state

    return (
      <ReactSelect
        value={selectedOption}
        onChange={this.onChange}
        options={this.props.options}
        isMulti
      />
    )
  }
}

export default Select
