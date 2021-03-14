import { TextField } from "@shopify/polaris";
import { useState } from "react";
function EditProductTextArea(props) {
  const [value, setValue] = useState(() => {
    return props?.value?.join("\n") ?? "";
  });
  return (
    <TextField
      multiline
      name={props.name}
      label={props.label}
      type={props.type}
      value={value}
      onChange={setValue}
    />
  );
}

export default EditProductTextArea;
