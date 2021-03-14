import { TextField } from '@shopify/polaris';
import { useState } from 'react';
import PropTypes from 'prop-types';

function EditProductTextArea({ label, name, value, type }) {
  const [text, setText] = useState(() => value?.join('\n') ?? '');
  return (
    <TextField
      multiline
      name={name}
      label={label}
      type={type}
      value={text}
      onChange={setText}
    />
  );
}

EditProductTextArea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
};

export default EditProductTextArea;
