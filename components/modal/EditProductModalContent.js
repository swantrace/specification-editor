import EditProductCheckbox from "./EditProductCheckbox";
import EditProductSelect from "./EditProductSelect";
import EditProductText from "./EditProductText";
import EditProductTextArea from "./EditProductTextArea";
import EditProductNumber from "./EditProductNumber";
import { Form, FormLayout, Stack, Select, Button } from "@shopify/polaris";
import { useState } from "react";

function EditProductModalContent({
  storedSpecifications,
  nonstoredSpecifications,
}) {
  const [
    toBeAddedSpecificationNames,
    setToBeAddedSpecificationNames,
  ] = useState([]);

  const [selectedSpecificationName, setSelectedSpecificationName] = useState(
    () => {
      return nonstoredSpecifications?.[0]?.name ?? null;
    }
  );

  const handleSpecificationAdderButtonClicked = () => {
    setToBeAddedSpecificationNames((previousToBeAddedSpecificationNames) => {
      return [
        ...previousToBeAddedSpecificationNames,
        selectedSpecificationName,
      ];
    });
    setSelectedSpecificationName((previousSelectedSpecificationName) => {
      return (
        nonstoredSpecifications.filter(
          (specification) =>
            !toBeAddedSpecificationNames.includes(specification.name) &&
            specification.name !== previousSelectedSpecificationName
        )?.[0]?.name ?? ""
      );
    });
  };

  const specificationInputs = (
    <FormLayout>
      {[
        ...storedSpecifications,
        ...nonstoredSpecifications.filter((specification) =>
          toBeAddedSpecificationNames.includes(specification.name)
        ),
      ].map((specification) => {
        console.log("specification", specification);
        switch (specification.type) {
          case "select":
            return (
              <EditProductSelect key={specification.name} {...specification} />
            );
            break;
          case "text":
            return (
              <EditProductText key={specification.name} {...specification} />
            );
            break;
          case "textarea":
            return (
              <EditProductTextArea
                key={specification.name}
                {...specification}
              />
            );
            break;
          case "number":
            return (
              <EditProductNumber key={specification.name} {...specification} />
            );
            break;
          case "checkbox":
            return (
              <EditProductCheckbox
                key={specification.name}
                {...specification}
              />
            );
            break;
          default:
            return null;
            break;
        }
      })}
    </FormLayout>
  );

  const specificationAdder = (
    <FormLayout>
      <Stack>
        <Stack.Item fill>
          <Select
            options={nonstoredSpecifications
              .filter(
                (specification) =>
                  !toBeAddedSpecificationNames.includes(specification.name)
              )
              .map((specification) => ({
                label: specification.label,
                value: specification.name,
              }))}
            value={selectedSpecificationName}
            onChange={setSelectedSpecificationName}
          />
        </Stack.Item>
        <Stack.Item>
          <Button onClick={handleSpecificationAdderButtonClicked}>Add</Button>
        </Stack.Item>
      </Stack>
    </FormLayout>
  );

  return (
    <Form>
      {specificationInputs}
      {specificationAdder}
    </Form>
  );
}

export default EditProductModalContent;
