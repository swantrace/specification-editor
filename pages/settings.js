import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  Autocomplete,
  Stack,
  Tag,
  TextContainer,
  Page,
  Layout,
  Card,
  Form,
  FormLayout,
  TextField,
  Select,
  Button,
  Toast,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { titleCase } from "../utils";
import difference from "lodash.difference";
import SettingRuleInputs from "../components/settings/SettingRuleInputs";
import axios from "axios";
import slugify from "slugify";
import pickBy from "lodash.pickby";

const GET_SHOP_DTM_METAFIELDS = gql`
  query getShopDtmMetafields {
    shop {
      metafields(first: 3, namespace: "dtm") {
        edges {
          node {
            id
            key
            legacyResourceId
            namespace
            value
            valueType
            ownerType
          }
        }
      }
    }
  }
`;
const Settings = () => {
  const client = useApolloClient();
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const { data: dataWithShopDtmMetafields } = useQuery(GET_SHOP_DTM_METAFIELDS);
  const [
    toBeSubmittedSpecificationRules,
    setToBeSubmittedSpecificationRules,
  ] = useState([]);

  const [labelValue, setLabelValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [positionValue, setPositionValue] = useState("tag");
  const [typeValue, setTypeValue] = useState("text");
  const [optionsValue, setOptionsValue] = useState([]);
  const resetSpecificationRuleAdderInputs = () => {
    setLabelValue("");
    setNameValue("");
    setPositionValue("tag");
    setTypeValue("text");
    setOptionsValue([]);
  };

  const deselectedOptions = [
    { value: "price50", label: "Price +- 50" },
    { value: "collection", label: "Same collection" },
    { value: "brand", label: "Same brand" },
    { value: "type", label: "Same product type" },
  ];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  useEffect(() => {
    const specificationRulesFromQuery = JSON.parse(
      dataWithShopDtmMetafields?.shop?.metafields?.edges?.filter(
        ({ node }) => node?.key === "info"
      )?.[0]?.node?.value ?? "{}"
    );
    const similarProductsRulesFromQuery = JSON.parse(
      dataWithShopDtmMetafields?.shop?.metafields?.edges?.filter(
        ({ node }) => node?.key === "similar"
      )?.[0]?.node?.value ?? "[]"
    );
    setSelectedOptions(similarProductsRulesFromQuery);
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => {
        return {
          ...previousToBeSubmittedSpecificationRules,
          ...specificationRulesFromQuery,
        };
      }
    );
  }, [dataWithShopDtmMetafields]);
  const handleLabelValueChanged = (value) => {
    setLabelValue(value);
    setNameValue(slugify(value, { lower: true }));
  };
  const handleOptionsValueChanged = (value) => {
    setOptionsValue(value.trim() === "" ? [] : value.split(","));
  };
  const handleSpecificationRulesFormSubmitted = async () => {
    try {
      const newMetafield = await axios
        .post("/createMetafield", {
          key: "info",
          namespace: "dtm",
          owner_resource: "shop",
          value_type: "json_string",
          value: JSON.stringify(toBeSubmittedSpecificationRules),
        })
        .then((response) => response.data);

      client.cache.modify({
        id: `Metafield:${newMetafield.admin_graphql_api_id}`,
        fields: {
          value() {
            return newMetafield.value;
          },
        },
      });
      setToastContent("Changes saved");
      setToastActive(true);
    } catch (err) {
      setToastContent("Failed to save changes");
      setToastActive(true);
    }
  };
  const handleSimilarProductsFormSubmitted = async () => {
    try {
      const newMetafield = await axios
        .post("/createMetafield", {
          key: "similar",
          namespace: "dtm",
          owner_resource: "shop",
          value_type: "json_string",
          value: JSON.stringify(selectedOptions),
        })
        .then((response) => response.data);

      client.cache.modify({
        id: `Metafield:${newMetafield.admin_graphql_api_id}`,
        fields: {
          value() {
            return newMetafield.value;
          },
        },
      });
      setToastContent("Changes saved");
      setToastActive(true);
    } catch (err) {
      setToastContent("Failed to save changes");
      setToastActive(true);
    }
  };
  const handleNewOptionSelected = (selected) => {
    setSelectedOptions((previousSelectedOptions) => {
      if (selected.length > previousSelectedOptions.length) {
        const newAdded = difference(selected, previousSelectedOptions);
        return [...previousSelectedOptions, ...newAdded];
      }
      if (selected.length < previousSelectedOptions.length) {
        console.log(selected, previousSelectedOptions);
        return previousSelectedOptions.filter((option) =>
          selected.includes(option)
        );
      }
      return previousSelectedOptions;
    });
  };
  const handleSpecificationRuleAdderButtonClicked = () => {
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => {
        return {
          ...previousToBeSubmittedSpecificationRules,
          [nameValue]: {
            label: labelValue,
            name: nameValue,
            position: positionValue,
            type: typeValue,
            options: optionsValue.map((option) => option.trim()),
          },
        };
      }
    );
    resetSpecificationRuleAdderInputs();
  };
  const handleSpecificationRuleRemoverButtonClicked = (nameToRemove) => {
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => {
        return pickBy(
          previousToBeSubmittedSpecificationRules,
          (rule, name) => name !== nameToRemove
        );
      }
    );
  };
  const handleSpecificationRuleChanged = (oldRule, newRule) => {
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => {
        return {
          ...pickBy(
            previousToBeSubmittedSpecificationRules,
            (rule, name) => oldRule.name !== rule.name
          ),
          [newRule.name]: {
            label: newRule.label,
            name: newRule.name,
            position: newRule.position,
            type: newRule.type,
            options: newRule.options.map((option) => option.trim()),
          },
        };
      }
    );
  };

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );
      let endIndex = resultOptions.length - 1;
      if (resultOptions.length === 0) {
        endIndex = 0;
      }
      setOptions(resultOptions);
    },
    [deselectedOptions]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
    },
    [selectedOptions]
  );

  const tagsMarkup = selectedOptions.map((option) => {
    const tagLabel = titleCase(option);
    return (
      <Tag key={`option${option}`} onRemove={removeTag(option)}>
        {tagLabel}
      </Tag>
    );
  });

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Similar Products"
      labelHidden
      value={inputValue}
    />
  );
  const toastMarkup = toastActive ? (
    <Toast
      content={toastContent}
      onDismiss={() => setToastActive(false)}
      duration={2000}
    />
  ) : null;
  return (
    <Page fullWidth title="Settings">
      <Layout>
        <Layout.AnnotatedSection
          title="Specification settings"
          description="Add or edit specification rules"
        >
          <Form onSubmit={handleSpecificationRulesFormSubmitted}>
            {Object.values(toBeSubmittedSpecificationRules).map((rule) => (
              <Card sectioned key={rule.name}>
                <FormLayout>
                  <SettingRuleInputs
                    rule={rule}
                    handleSpecificationRuleRemoverButtonClicked={
                      handleSpecificationRuleRemoverButtonClicked
                    }
                    handleSpecificationRuleChanged={
                      handleSpecificationRuleChanged
                    }
                  />
                </FormLayout>
              </Card>
            ))}
            <Card sectioned>
              <FormLayout>
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
                      onChange={setNameValue}
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
                      onChange={setPositionValue}
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
                        onChange={setTypeValue}
                      />
                    ) : (
                      <Select
                        label="Type"
                        options={[{ label: "Textarea", value: "textarea" }]}
                        value={typeValue}
                        onChange={setTypeValue}
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
                    <Button onClick={handleSpecificationRuleAdderButtonClicked}>
                      Add
                    </Button>
                  </Stack.Item>
                </Stack>
              </FormLayout>
            </Card>
            <Card sectioned>
              <FormLayout>
                <Button submit primary fullWidth>
                  Submit
                </Button>
              </FormLayout>
            </Card>
          </Form>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          title="Similar products"
          description="Control the priorities of different factors"
        >
          <Form onSubmit={handleSimilarProductsFormSubmitted}>
            <Card sectioned>
              <FormLayout>
                <TextContainer>
                  <Stack>{tagsMarkup}</Stack>
                </TextContainer>
                <Autocomplete
                  allowMultiple
                  options={options}
                  selected={selectedOptions}
                  textField={textField}
                  onSelect={handleNewOptionSelected}
                />
              </FormLayout>
            </Card>
            <Card sectioned>
              <FormLayout>
                <Button submit primary fullWidth>
                  Submit
                </Button>
              </FormLayout>
            </Card>
          </Form>
        </Layout.AnnotatedSection>
      </Layout>
      {toastMarkup}
    </Page>
  );
};

export default Settings;

// axios
//   .post("/createMetafield", {
//     key: "info",
//     namespace: "dtm",
//     owner_id: 6554731020440,
//     owner_resource: "product",
//     value_type: "json_string",
//     value: JSON.stringify({
//       dimensions: {
//         value: [
//           'LID CLOSED - 24"H X 32.50"W X 25"D',
//           'LID OPEN - 29"H X 32.50"W X 25"D',
//           'BOXED - 26"H X 30"W X 38"D',
//         ],
//       },
//     }),
//   })
//   .then((response) => {
//     console.log(response);
//     return response.data;
//   })
//   .then(console.log);
// axios
//   .post("/createMetafield", {
//     key: "info",
//     namespace: "dtm",
//     owner_resource: "shop",
//     value_type: "json_string",
//     value: JSON.stringify({
//       "category-level-one": {
//         name: "category-level-one",
//         label: "Category Level One",
//         type: "text",
//         position: "tag",
//         options: [],
//       },
//       "category-level-two": {
//         name: "category-level-two",
//         label: "Category Level Two",
//         type: "text",
//         position: "tag",
//         options: [],
//       },
//       "cook-type": {
//         name: "cook-type",
//         label: "Cook Type",
//         type: "select",
//         position: "tag",
//         options: ["Gas Grill", "Charcoal Grill", "Pellet Grill", "Oven"],
//       },
//       "total-btu": {
//         name: "total-btu",
//         label: "Total BTU",
//         type: "number",
//         position: "tag",
//         options: [],
//       },
//       "total-grill-size": {
//         name: "total-grill-size",
//         label: "Total Grill Size",
//         type: "number",
//         position: "tag",
//         options: [],
//       },
//       "cooking-temperature-range": {
//         name: "cooking-temperature-range",
//         label: "Cooking Temperature Range",
//         type: "text",
//         position: "tag",
//         options: [],
//       },
//       "primary-cooking-space": {
//         name: "primary-cooking-space",
//         label: "Primary Cooking Space",
//         type: "number",
//         position: "tag",
//         options: [],
//       },
//       "number-of-racks": {
//         name: "number-of-racks",
//         label: "Number of racks",
//         type: "select",
//         position: "tag",
//         options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
//       },
//       dimensions: {
//         name: "dimensions",
//         label: "Dimensions",
//         type: "textarea",
//         position: "metafield",
//         options: [],
//       },
//       "rear-rotisserie-burner": {
//         name: "rear-rotisserie-burner",
//         label: "Rear Rotisserie Burner",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//       "side-burner": {
//         name: "side-burner",
//         label: "Side Burner",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//       "sear-functionality": {
//         name: "sear-functionality",
//         label: "Sear functionality",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//       "stand-type": {
//         name: "stand-type",
//         label: "Stand Type",
//         type: "select",
//         position: "tag",
//         options: ["Free Standing", "Built In", "Portable"],
//       },
//       "grill-type": {
//         name: "grill-type",
//         label: "Grill Type",
//         type: "select",
//         position: "tag",
//         options: ["Cast Iron", "Stainless", "Ceramic"],
//       },
//       "gluten-free": {
//         name: "gluten-free",
//         label: "Gluten Free",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//       "low-or-sodium-free": {
//         name: "low-or-sodium-free",
//         label: "Low or Sodium Free",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//       "suger-free": {
//         name: "suger-free",
//         label: "Suger Free",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//       "no-msg": {
//         name: "no-msg",
//         label: "NO MSG",
//         type: "checkbox",
//         position: "tag",
//         options: [],
//       },
//     }),
//   })
//   .then((response) => {
//     console.log(response);
//     return response.data;
//   })
//   .then(console.log);
// axios
//   .post("/updateMetafield", {
//     id: "18838527410328",
//     key: "info",
//     namespace: "dtm",
//     owner_resource: "shop",
//     value_type: "json_string",
//     value: JSON.stringify({ a: "b" }),
//   })
//   .then((response) => {
//     console.log(response);
//     return response.data;
//   })
//   .then(console.log);
