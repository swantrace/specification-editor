import { Form, FormLayout, Stack, Select, Button } from '@shopify/polaris';
import { useState } from 'react';
import PropTypes from 'prop-types';
import EditProductCheckbox from './EditProductCheckbox';
import EditProductSelect from './EditProductSelect';
import EditProductText from './EditProductText';
import EditProductTextArea from './EditProductTextArea';
import EditProductNumber from './EditProductNumber';

function EditProductModalContent({
  storedSpecifications,
  nonstoredSpecifications,
}) {
  const [
    toBeAddedSpecificationNames,
    setToBeAddedSpecificationNames,
  ] = useState([]);

  const [selectedSpecificationName, setSelectedSpecificationName] = useState(
    () => nonstoredSpecifications?.[0]?.name ?? null
  );

  const handleSpecificationAdderButtonClicked = () => {
    setToBeAddedSpecificationNames((previousToBeAddedSpecificationNames) => [
      ...previousToBeAddedSpecificationNames,
      selectedSpecificationName,
    ]);
    setSelectedSpecificationName(
      (previousSelectedSpecificationName) =>
        nonstoredSpecifications.filter(
          (specification) =>
            !toBeAddedSpecificationNames.includes(specification.name) &&
            specification.name !== previousSelectedSpecificationName
        )?.[0]?.name ?? ''
    );
  };

  const specificationInputs = (
    <FormLayout>
      {[
        ...storedSpecifications,
        ...nonstoredSpecifications.filter((specification) =>
          toBeAddedSpecificationNames.includes(specification.name)
        ),
      ].map((specification) => {
        console.log('specification', specification);
        switch (specification.type) {
          case 'select':
            return (
              <EditProductSelect key={specification.name} {...specification} />
            );
          case 'text':
            return (
              <EditProductText key={specification.name} {...specification} />
            );
          case 'textarea':
            return (
              <EditProductTextArea
                key={specification.name}
                {...specification}
              />
            );
          case 'number':
            return (
              <EditProductNumber key={specification.name} {...specification} />
            );
          case 'checkbox':
            return (
              <EditProductCheckbox
                key={specification.name}
                {...specification}
              />
            );
          default:
            return null;
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
        <Button onClick={handleSpecificationAdderButtonClicked}>Add</Button>
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

EditProductModalContent.propTypes = {
  storedSpecifications: PropTypes.object,
  nonstoredSpecifications: PropTypes.object,
};

export default EditProductModalContent;
