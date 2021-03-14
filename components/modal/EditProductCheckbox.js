import { Checkbox } from "@shopify/polaris";
import { useState } from "react";

function EditProductCheckbox(props) {
  console.log("checkbox props", props);
  const [checked, setChecked] = useState(() => {
    return props?.value ?? false;
  });
  return (
    <Checkbox
      checked={checked}
      name={props.name}
      label={props.label}
      value={checked}
      onChange={setChecked}
    />
  );
}

export default EditProductCheckbox;
