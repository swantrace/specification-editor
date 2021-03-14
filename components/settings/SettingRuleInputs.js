import { Select, Stack, TextField, Button } from "@shopify/polaris";
import { useState } from "react";
import slugify from "slugify";

function SettingRuleInputs({
  rule,
  handleSpecificationRuleRemoverButtonClicked,
  handleSpecificationRuleChanged,
}) {
  const [labelValue, setLabelValue] = useState(() => {
    return rule?.label ?? "";
  });
  const [nameValue, setNameValue] = useState(() => {
    return rule?.name ?? "";
  });
  const [positionValue, setPositionValue] = useState(() => {
    return rule?.position ?? "tag";
  });
  const [typeValue, setTypeValue] = useState(() => {
    return rule?.type ?? "text";
  });
  const [optionsValue, setOptionsValue] = useState(() => {
    return rule?.options ?? [];
  });
  const handleLabelValueChanged = (value) => {
    setLabelValue(value);
    setNameValue(slugify(value, { lower: true }));
    handleSpecificationRuleChanged(rule, {
      label: value,
      name: slugify(value, { lower: true }),
      position: positionValue,
      type: typeValue,
      options: optionsValue,
    });
  };
  const handleNameValueChanged = (value) => {
    setNameValue(value);
    handleSpecificationRuleChanged(rule, {
      label: labelValue,
      name: value,
      position: positionValue,
      type: typeValue,
      options: optionsValue,
    });
  };
  const handlePositionValueChanged = (value) => {
    setPositionValue(value);
    handleSpecificationRuleChanged(rule, {
      label: labelValue,
      name: nameValue,
      position: value,
      type: typeValue,
      options: optionsValue,
    });
  };
  const handleTypeValueChanged = (value) => {
    setPositionValue(value);
    handleSpecificationRuleChanged(rule, {
      label: labelValue,
      name: nameValue,
      position: positionValue,
      type: value,
      options: optionsValue,
    });
  };
  const handleOptionsValueChanged = (value) => {
    setOptionsValue(value.split(","));
    handleSpecificationRuleChanged(rule, {
      label: labelValue,
      name: nameValue,
      position: positionValue,
      type: typeValue,
      options: value.split(","),
    });
  };
  const handleRemoveButtonClicked = () => {
    handleSpecificationRuleRemoverButtonClicked(rule.name);
  };
  return (
    <Stack alignment="trailing">
      <Stack.Item fill>
        <TextField
          label="Label"
          value={labelValue}
          onChange={handleLabelValueChanged}
        />
      </Stack.Item>
      <Stack.Item fill>
        <TextField
          label="Name"
          value={nameValue}
          onChange={handleNameValueChanged}
        />
      </Stack.Item>
      <Stack.Item fill>
        <Select
          label="Position"
          options={[
            { label: "Tag", value: "tag" },
            { label: "Metafield", value: "metafield" },
          ]}
          value={positionValue}
          onChange={handlePositionValueChanged}
        />
      </Stack.Item>
      <Stack.Item fill>
        {positionValue === "tag" ? (
          <Select
            label="Type"
            options={[
              { label: "Text", value: "text" },
              { label: "Number", value: "number" },
              { label: "Checkbox", value: "checkbox" },
              { label: "Select", value: "select" },
            ]}
            value={typeValue}
            onChange={handleTypeValueChanged}
          />
        ) : (
          <Select
            label="Type"
            options={[{ label: "Textarea", value: "textarea" }]}
            value={typeValue}
            onChange={handleTypeValueChanged}
          />
        )}
      </Stack.Item>
      {typeValue === "select" ? (
        <Stack.Item fill>
          <TextField
            label="Options"
            value={optionsValue.join(",")}
            onChange={handleOptionsValueChanged}
          />
        </Stack.Item>
      ) : null}
      <Stack.Item>
        <Button onClick={handleRemoveButtonClicked}>Remove</Button>
      </Stack.Item>
    </Stack>
  );
}

export default SettingRuleInputs;
