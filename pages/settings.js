import { gql, useApolloClient, useQuery } from '@apollo/client';
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
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import difference from 'lodash.difference';
import axios from 'axios';
import slugify from 'slugify';
import pickBy from 'lodash.pickby';
import SettingRuleInputs from '../components/settings/SettingRuleInputs';
import { titleCase } from '../utils';

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
  const [toastContent, setToastContent] = useState('');
  const { data: dataWithShopDtmMetafields } = useQuery(GET_SHOP_DTM_METAFIELDS);
  const [
    toBeSubmittedSpecificationRules,
    setToBeSubmittedSpecificationRules,
  ] = useState([]);

  const [labelValue, setLabelValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [positionValue, setPositionValue] = useState('tag');
  const [typeValue, setTypeValue] = useState('text');
  const [optionsValue, setOptionsValue] = useState([]);
  const resetSpecificationRuleAdderInputs = () => {
    setLabelValue('');
    setNameValue('');
    setPositionValue('tag');
    setTypeValue('text');
    setOptionsValue([]);
  };

  const deselectedOptions = [
    { value: 'price50', label: 'Price +- 50' },
    { value: 'collection', label: 'Same collection' },
    { value: 'brand', label: 'Same brand' },
    { value: 'type', label: 'Same product type' },
  ];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(deselectedOptions);

  useEffect(() => {
    const specificationRulesFromQuery = JSON.parse(
      dataWithShopDtmMetafields?.shop?.metafields?.edges?.filter(
        ({ node }) => node?.key === 'info'
      )?.[0]?.node?.value ?? '{}'
    );
    const similarProductsRulesFromQuery = JSON.parse(
      dataWithShopDtmMetafields?.shop?.metafields?.edges?.filter(
        ({ node }) => node?.key === 'similar'
      )?.[0]?.node?.value ?? '[]'
    );
    setSelectedOptions(similarProductsRulesFromQuery);
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => ({
        ...previousToBeSubmittedSpecificationRules,
        ...specificationRulesFromQuery,
      })
    );
  }, [dataWithShopDtmMetafields]);
  const handleLabelValueChanged = (value) => {
    setLabelValue(value);
    setNameValue(slugify(value, { lower: true }));
  };
  const handleOptionsValueChanged = (value) => {
    setOptionsValue(value.trim() === '' ? [] : value.split(','));
  };
  const handleSpecificationRulesFormSubmitted = async () => {
    try {
      const newMetafield = await axios
        .post('/createMetafield', {
          key: 'info',
          namespace: 'dtm',
          owner_resource: 'shop',
          value_type: 'json_string',
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
      setToastContent('Changes saved');
      setToastActive(true);
    } catch (err) {
      setToastContent('Failed to save changes');
      setToastActive(true);
    }
  };
  const handleSimilarProductsFormSubmitted = async () => {
    try {
      const newMetafield = await axios
        .post('/createMetafield', {
          key: 'similar',
          namespace: 'dtm',
          owner_resource: 'shop',
          value_type: 'json_string',
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
      setToastContent('Changes saved');
      setToastActive(true);
    } catch (err) {
      setToastContent('Failed to save changes');
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
        return previousSelectedOptions.filter((option) =>
          selected.includes(option)
        );
      }
      return previousSelectedOptions;
    });
  };
  const handleSpecificationRuleAdderButtonClicked = () => {
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => ({
        ...previousToBeSubmittedSpecificationRules,
        [nameValue]: {
          label: labelValue,
          name: nameValue,
          position: positionValue,
          type: typeValue,
          options: optionsValue.map((option) => option.trim()),
        },
      })
    );
    resetSpecificationRuleAdderInputs();
  };
  const handleSpecificationRuleRemoverButtonClicked = (nameToRemove) => {
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) =>
        pickBy(
          previousToBeSubmittedSpecificationRules,
          (rule, name) => name !== nameToRemove
        )
    );
  };
  const handleSpecificationRuleChanged = (oldRule, newRule) => {
    setToBeSubmittedSpecificationRules(
      (previousToBeSubmittedSpecificationRules) => ({
        ...pickBy(
          previousToBeSubmittedSpecificationRules,
          (rule) => oldRule.name !== rule.name
        ),
        [newRule.name]: {
          label: newRule.label,
          name: newRule.name,
          position: newRule.position,
          type: newRule.type,
          options: newRule.options.map((option) => option.trim()),
        },
      })
    );
  };

  const updateText = useCallback(
    (value) => {
      setInputValue(value);
      if (value === '') {
        setOptions(deselectedOptions);
        return;
      }
      const filterRegex = new RegExp(value, 'i');
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );
      setOptions(resultOptions);
    },
    [deselectedOptions]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const newOptions = [...selectedOptions];
      newOptions.splice(newOptions.indexOf(tag), 1);
      setSelectedOptions(newOptions);
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

  const typeSelector =
    positionValue === 'tag' ? (
      <Select
        label="Type"
        options={[
          { label: 'Text', value: 'text' },
          { label: 'Number', value: 'number' },
          { label: 'Checkbox', value: 'checkbox' },
          { label: 'Select', value: 'select' },
        ]}
        value={typeValue}
        onChange={setTypeValue}
      />
    ) : (
      <Select
        label="Type"
        options={[{ label: 'Textarea', value: 'textarea' }]}
        value={typeValue}
        onChange={setTypeValue}
      />
    );

  const optionsInput =
    typeValue === 'select' ? (
      <Stack.Item fill>
        <TextField
          label="Options"
          value={optionsValue.join(',')}
          onChange={handleOptionsValueChanged}
        />
      </Stack.Item>
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
                        { label: 'Tag', value: 'tag' },
                        { label: 'Metafield', value: 'metafield' },
                      ]}
                      value={positionValue}
                      onChange={setPositionValue}
                    />
                  </Stack.Item>
                  <Stack.Item fill>{typeSelector}</Stack.Item>
                  {optionsInput}
                  <Button onClick={handleSpecificationRuleAdderButtonClicked}>
                    Add
                  </Button>
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
