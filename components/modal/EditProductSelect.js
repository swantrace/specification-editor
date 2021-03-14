import { Select } from "@shopify/polaris";
import { useState } from "react";

function EditProductSelect(props) {
  const [selected, setSelected] = useState(() => {
    return props?.value ?? props?.options?.[0] ?? null;
  });
  return (
    <Select
      name={props.name}
      label={props.label}
      options={[
        { label: "N/A", value: "" },
        ...props.options.map((option) => ({
          label: option,
          value: option,
        })),
      ]}
      value={selected}
      onChange={setSelected}
    />
  );
}

export default EditProductSelect;
