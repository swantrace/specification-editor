import { Button, FormLayout, Popover, Select, TextField } from '@shopify/polaris';
import { useCallback, useState } from 'react';
function CreateNewSpecificationForm() {
  const specificationTypes = [
    'Cook Type',
    'Total Grill Size',
    'Primary Cooking Space',
    'Number of racks',
    'Warranty',
    'Create A New Type'
  ];
  const specificationTypeDataTypes = ['text', 'number', 'rich text'];

  const [popoverActive, setPopoverActive] = useState(false);
  const [specificationType, setSpecificationType] = useState(specificationTypes[0]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDataType, setNewTypeDataType] = useState(specificationTypeDataTypes[0]);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    []
  );

  const handleSpecificationTypeChange = useCallback((value) => setSpecificationType(value), []);

  const handleNewTypeNameChange = useCallback((value) => setNewTypeName(value), []);

  const handleNewTypeDataTypeChange = useCallback((value) => setNewTypeDataType(value), []);

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      Add New Specification
    </Button>
  );

  return (
    <div style={{ height: '25px' }}>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopoverActive}
        ariaHaspopup={false}
        sectioned>
        <FormLayout>
          <Select
            label="Select one from existing specification types or select 'Create New Type'"
            options={specificationTypes}
            value={specificationType}
            onChange={handleSpecificationTypeChange}
          />
          {specificationType === specificationTypes[specificationTypes.length - 1] ? (
            <>
              <TextField
                label="New Type Name"
                value={newTypeName}
                onChange={handleNewTypeNameChange}
              />
              <Select
                label="Data Type"
                value={newTypeDataType}
                onChange={handleNewTypeDataTypeChange}
                options={specificationTypeDataTypes}
              />
            </>
          ) : null}

          <Button size="slim" primary>
            Add
          </Button>
        </FormLayout>
      </Popover>
    </div>
  );
}

export default CreateNewSpecificationForm;
