import {
  Form,
  FormLayout,
  Stack,
  Select,
  Button,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";
import EditCollectionImageInfoInputs from "./EditCollectionImageInfoInputs";

function EditCollectionModalContent({ modalEditingCollection }) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageText, setImageText] = useState("");
  const [imageTarget, setImageTarget] = useState("");
  const [collectionImageInfoArray, setCollectionImageInfoArray] = useState(
    () => {
      const images =
        JSON.parse(modalEditingCollection?.metafield?.value ?? "{}")?.images ??
        [];
      return images;
    }
  );

  console.log(collectionImageInfoArray);

  const handleCollectionImageInfoAdderButtonClicked = () => {
    if (imageUrl && imageTarget && imageText) {
      setCollectionImageInfoArray((previousCollectionImageInfoArray) => {
        return [
          ...previousCollectionImageInfoArray,
          { imageUrl, imageTarget, imageText },
        ];
      });
      setImageUrl("");
      setImageTarget("");
      setImageText("");
    }
  };
  const handleCollectionImageInfoRemoveButtonClicked = (index) => {
    setCollectionImageInfoArray((previousCollectionImageInfoArray) => {
      return previousCollectionImageInfoArray.filter((e, i) => i !== index);
    });
  };

  const collectionImageInfoEditor = (
    <FormLayout>
      {collectionImageInfoArray.map((imageInfo, index) => (
        <EditCollectionImageInfoInputs
          imageInfo={imageInfo}
          imageIndex={index}
          handleCollectionImageInfoRemoveButtonClicked={
            handleCollectionImageInfoRemoveButtonClicked
          }
        />
      ))}
    </FormLayout>
  );

  const collectionImageInfoAdder = (
    <FormLayout>
      <Stack alignment="trailing">
        <Stack.Item fill>
          <TextField
            type="url"
            label="Image url"
            onChange={setImageUrl}
            value={imageUrl}
          />
        </Stack.Item>
        <Stack.Item fill>
          <TextField
            type="url"
            label="Image target"
            onChange={setImageTarget}
            value={imageTarget}
          />
        </Stack.Item>
        <Stack.Item fill>
          <TextField
            type="text"
            label="Image text"
            onChange={setImageText}
            value={imageText}
          />
        </Stack.Item>
        <Stack.Item>
          <Button onClick={handleCollectionImageInfoAdderButtonClicked}>
            Add
          </Button>
        </Stack.Item>
      </Stack>
    </FormLayout>
  );

  return (
    <Form>
      <Stack vertical>
        <Stack.Item>{collectionImageInfoEditor}</Stack.Item>
        <Stack.Item>{collectionImageInfoAdder}</Stack.Item>
      </Stack>
    </Form>
  );
}

export default EditCollectionModalContent;
