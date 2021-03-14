import { TextField } from "@shopify/polaris";
import { useState } from "react";

function EditProductText(props) {
  const [value, setValue] = useState(() => {
    return props?.value ?? "";
  });
  return (
    <TextField
      name={props.name}
      label={props.label}
      type={props.type}
      value={value}
      onChange={setValue}
    />
  );
}

export default EditProductText;
