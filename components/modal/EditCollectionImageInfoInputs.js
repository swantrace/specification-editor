import { Stack, Button, FormLayout, TextField } from "@shopify/polaris";
import { useState } from "react";

function EditCollectionImageInfoInputs({
  imageInfo,
  imageIndex,
  handleCollectionImageInfoRemoveButtonClicked,
}) {
  console.log(
    imageInfo,
    imageIndex,
    handleCollectionImageInfoRemoveButtonClicked
  );
  const [imageUrl, setImageUrl] = useState(() => {
    return imageInfo?.imageUrl ?? "";
  });
  const [imageTarget, setImageTarget] = useState(() => {
    return imageInfo?.imageTarget ?? "";
  });
  const [imageText, setImageText] = useState(() => {
    return imageInfo?.imageText ?? "";
  });
  return (
    <FormLayout>
      <Stack alignment="trailing">
        <Stack.Item fill>
          <TextField
            type="url"
            label="Image url"
            onChange={setImageUrl}
            value={imageUrl}
            name={`${imageIndex}_imageUrl`}
          />
        </Stack.Item>
        <Stack.Item fill>
          <TextField
            type="url"
            label="Image target"
            onChange={setImageTarget}
            value={imageTarget}
            name={`${imageIndex}_imageTarget`}
          />
        </Stack.Item>
        <Stack.Item fill>
          <TextField
            type="text"
            label="Image text"
            onChange={setImageText}
            value={imageText}
            name={`${imageIndex}_imageText`}
          />
        </Stack.Item>
        <Stack.Item>
          <Button
            onClick={() => {
              handleCollectionImageInfoRemoveButtonClicked(imageIndex);
            }}
          >
            Remove
          </Button>
        </Stack.Item>
      </Stack>
    </FormLayout>
  );
}

export default EditCollectionImageInfoInputs;
