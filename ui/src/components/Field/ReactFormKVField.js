import React, { Component } from "react"
import PropTypes from "prop-types"
import { NestedField } from "react-form"
import { X } from "react-feather"
import { pick } from "lodash"
import { ReactFormFieldText } from "./FieldText"
import Button from "../styled/Button"
import Field from "../styled/Field"
import NestedKeyValueRow from "../styled/NestedKeyValueRow"
import intentTypes from "../../constants/intentTypes"
import KVFieldInput from "./KVFieldInput"
import {
  SHARED_KV_FIELD_PROPS,
  SHARED_KV_FIELD_DEFAULT_PROPS,
} from "../../utils/kvFieldHelpers"

export class ReactFormKVField extends Component {
  /** Removes a value specified by index. */
  handleRemoveClick = index => {
    const { removeValue, field } = this.props

    removeValue(field, index)
  }

  render() {
    const { field, label, values, keyField, addValue, valueField } = this.props

    return (
      <Field label={label}>
        {!!values &&
          values.map((v, i) => (
            <NestedField key={`${field}-${i}`} field={[field, i]}>
              <NestedKeyValueRow>
                <ReactFormFieldText field={keyField} label={null} isRequired />
                <ReactFormFieldText
                  field={valueField}
                  label={null}
                  isRequired
                />
                <Button
                  intent={intentTypes.error}
                  onClick={this.handleRemoveClick.bind(this, i)}
                >
                  <X size={14} />
                </Button>
              </NestedKeyValueRow>
            </NestedField>
          ))}
        <KVFieldInput
          addValue={addValue}
          {...pick(this.props, [
            "field",
            "isKeyRequired",
            "isValueRequired",
            "keyField",
            "valueField",
          ])}
        />
      </Field>
    )
  }
}

ReactFormKVField.propsTypes = {
  ...SHARED_KV_FIELD_PROPS,
  addValue: PropTypes.func.isRequired,
  removeValue: PropTypes.func.isRequired,
}

ReactFormKVField.defaultProps = SHARED_KV_FIELD_DEFAULT_PROPS

export default ReactFormKVField