/* eslint-disable react/jsx-key */
import {
  Button,
  ButtonGroup,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  ResourceItem,
  ResourceList,
  Select,
  TextField,
  Thumbnail
} from '@shopify/polaris';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTable } from 'react-table';
import slugify from 'slugify';
import styled from 'styled-components';

import useCollectionMetafields from '../../hooks/useCollectionMetafields';
import useCollectionProducts from '../../hooks/useCollectionProducts';
import installAppIfNot from '../../utils/installAppIfNot';
import swrFetcher from '../../utils/swrFetcher';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

export default function Collection() {
  const router = useRouter();
  const { id: collectionId, imageSrc, title } = router.query;

  const [label, setLabel] = useState('');

  const inputTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Single Select', value: 'single' },
    {
      label: 'Multiple Select',
      value: 'multiple'
    }
  ];
  const [editedMetafieldId, setEditedMetafieldId] = useState(null);
  const [inputType, setInputType] = useState(inputTypeOptions[0].value);
  const [optionsInputEnabled, setOptionsInputEnabled] = useState(false);
  const [options, setOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const {
    metafields,
    isLoading: mIsLoading,
    isError: mIsError,
    size: mSize,
    setSize: mSetSize,
    mutateMetafields
  } = useCollectionMetafields(collectionId);

  const currentPageMetafields = useMemo(() => metafields[mSize - 1] ?? [], [metafields, mSize]);

  const {
    products,
    isLoading: pIsLoading,
    isError: pIsError,
    size: pSize,
    setSize: pSetSize,
    mutateProducts
  } = useCollectionProducts(collectionId);

  const currentPageProducts = useMemo(() => products[pSize - 1] ?? [], [products, pSize]);

  const data = useMemo(
    () =>
      currentPageProducts.map((product) => {
        return currentPageMetafields.reduce(
          (acc, cur) => {
            const tagQuestionInfo = JSON.parse(cur.value);
            const tagPrefix = cur.key;
            const tags = product.tags ? product.tags.split(',') : [];
            const relatedTags = tags.filter((tag) => tag.startsWith(tagPrefix));
            acc[`${cur.key}`] = { ...tagQuestionInfo, tagPrefix, relatedTags };
            return acc;
          },
          { title: product.title }
        );
      }),
    [currentPageMetafields, currentPageProducts]
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Product Title',
        accessor: 'title'
      },
      ...currentPageMetafields.map(({ key, value }) => ({
        Header: JSON.parse(value).label,
        accessor: key,
        Cell: ({ value }) => {
          console.log('value:', value);
          return value
            ? value.relatedTags.map((tag) => tag.replace(`${value.tagPrefix}_`, '')).join()
            : '';
        }
      }))
    ],
    [currentPageMetafields, currentPageProducts]
  );
  console.log('data', data);

  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await swrFetcher('metafield', 'create', {
        key: slugify(label.toLowerCase()),
        value_type: 'json_string',
        value: JSON.stringify({
          label,
          inputType,
          options: options.map((rawOption) => rawOption.trim()).filter((rawOption) => rawOption)
        }),
        namespace: 'luxe',
        owner_resource: 'collection',
        owner_id: collectionId
      });
      mutateMetafields();
      setLabel('');
      setInputType(null);
      setOptions([]);
      setOptionsInputEnabled(false);
      setSaving(false);
    } catch (err) {
      console.log(err);
      setSaving(false);
    }
  };
  const handleLabelChange = (value) => {
    setLabel(value);
  };

  const handleInputTypeSelectChange = (value) => {
    if (value === 'single' || value === 'multiple') {
      setOptionsInputEnabled(true);
    } else {
      setOptionsInputEnabled(false);
      setOptions([]);
    }
    setInputType(value);
  };

  const handleOptionsChange = (value) => {
    setOptions(value.split(','));
  };

  const handleMetafieldClicked = (id) => {
    setEditedMetafieldId(id);
  };

  const handleMetafieldRemoved = async (e, id) => {
    setSaving(true);
    try {
      await swrFetcher('metafield', 'delete', id);
      mutateMetafields();
      setSaving(false);
    } catch (err) {
      console.log(err);
      setSaving(false);
    }
  };

  const handleCancelClicked = () => {
    console.log('cancel');
    setEditedMetafieldId(null);
    setLabel('');
    setInputType(inputTypeOptions[0].value);
    setOptions([]);
  };

  return (
    <Page
      breadcrumbs={[
        {
          content: 'Collections',
          onAction: () => {
            router.back();
          }
        }
      ]}
      title={title}
      thumbnail={<Thumbnail source={imageSrc} alt={title} />}>
      <Layout>
        <Layout.Section>
          <Card title="Relevant Metafields" sectioned>
            <ResourceList
              resourceName={{ singular: 'metafield', plural: 'metafields' }}
              items={currentPageMetafields}
              renderItem={(item) => {
                console.log(item);
                const { id, value, key } = item;
                const { label, inputType, options } = JSON.parse(value);
                return (
                  <ResourceItem
                    id={id}
                    onClick={handleMetafieldClicked}
                    shortcutActions={[
                      {
                        content: 'Remove this spedification',
                        onAction: (e) => handleMetafieldRemoved(e, id)
                      }
                    ]}
                    persistActions>
                    {key}/{label}/{inputType}
                    {options.length > 0 ? '/' : null}
                    {options.join(',')}
                  </ResourceItem>
                );
              }}
            />
          </Card>
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                {editedMetafieldId ? (
                  <TextField
                    value={editedMetafieldId.toString()}
                    label="Metafield ID"
                    type="number"
                    readOnly
                  />
                ) : null}
                <TextField
                  value={label}
                  onChange={handleLabelChange}
                  label="Label"
                  type="text"
                  disabled={saving}
                  helpText={<span>Please do not use special characters</span>}
                />
                <Select
                  label="Input Type"
                  options={inputTypeOptions}
                  onChange={handleInputTypeSelectChange}
                  value={inputType}
                  disabled={saving}
                />
                {optionsInputEnabled ? (
                  <TextField
                    value={options.join(',')}
                    onChange={handleOptionsChange}
                    label="Options"
                    type="text"
                    disabled={saving}
                    helpText={<span>Please separate options with comma</span>}
                  />
                ) : null}
                {!editedMetafieldId ? (
                  <Button submit disabled={saving}>
                    Submit
                  </Button>
                ) : (
                  <ButtonGroup>
                    <Button onClick={handleCancelClicked}>Cancel</Button>
                    <Button primary submit>
                      Update
                    </Button>
                  </ButtonGroup>
                )}
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Products" sectioned>
            <Styles>
              <table {...getTableProps()}>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Styles>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export async function getServerSideProps(ctx) {
  await installAppIfNot(ctx);
  return {
    props: {
      shopOrigin: ctx.req.session.shop
    }
  };
}
