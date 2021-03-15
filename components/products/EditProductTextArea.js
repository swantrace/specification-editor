import { TextField } from '@shopify/polaris';
import { useState } from 'react';
import PropTypes from 'prop-types';

function EditProductTextArea({ label, name, value, type }) {
  console.log('label, name, value, type', label, name, value, type);
  const [text, setText] = useState(() => value?.join('\n') ?? '');
  return (
    // <TextField
    //   multiline={3}
    //   name={name}
    //   label={label}
    //   value={text}
    //   onChange={setText}
    // />
    <h1>This should be a textarea</h1>
  );
}

EditProductTextArea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
};

export default EditProductTextArea;
