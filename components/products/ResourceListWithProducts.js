import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import { AppBridgeContext } from '@shopify/app-bridge-react/context';
import { Redirect } from '@shopify/app-bridge/actions';

import PropTypes from 'prop-types';
import {
  Card,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
  ButtonGroup,
  Button,
  Pagination,
  Thumbnail,
  Modal,
  DataTable,
} from '@shopify/polaris';
import axios from 'axios';
import { parse } from 'json2csv';
import EditProductModalContent from './EditProductModalContent';
import {
  getDownloadLink,
  getProductInfoToExport,
  getProductInputPayload,
  getQueryString,
  getSpecificationGroups,
  getViewProductsTableInfo,
} from '../../utils';
import ImportProductsModalContent from './ImportProductsModalContent';
import ExportProductsModalContent from './ExportProductsModalContenta';
import { useAppContext } from '../../context/state';
import ProductsFilterControl from './ProductsFilterControl';

const GET_PRODUCTS = gql`
  query getProducts(
    $query: String!
    $reverse: Boolean!
    $sortKey: ProductSortKeys!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    products(
      first: $first
      last: $last
      query: $query
      reverse: $reverse
      sortKey: $sortKey
      after: $after
      before: $before
    ) {
      edges {
        cursor
        node {
          id
          handle
          title
          legacyResourceId
          featuredImage {
            originalSrc
            altText
          }
          metafield(key: "info", namespace: "dtm") {
            id
            key
            legacyResourceId
            namespace
            value
            valueType
            ownerType
          }
          tags
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const GET_SHOP_INFO = gql`
  query getShopInfo {
    shop {
      id
      productTypes(first: 250) {
        edges {
          node
          cursor
        }
      }
      productVendors(first: 250) {
        edges {
          node
          cursor
        }
      }
      metafield(key: "info", namespace: "dtm") {
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
`;

const GET_PRODUCT = gql`
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      handle
      title
      legacyResourceId
      metafield(key: "info", namespace: "dtm") {
        id
        key
        legacyResourceId
        namespace
        value
        valueType
        ownerType
      }
      tags
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        handle
        title
        legacyResourceId
        metafield(namespace: "dtm", key: "info") {
          id
          key
          legacyResourceId
          namespace
          value
          valueType
          ownerType
        }
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_PRODUCTS_IN_BULK = gql`
  mutation bulkOperationRunQuery($query: String!) {
    bulkOperationRunQuery(query: $query) {
      bulkOperation {
        id
        completedAt
        createdAt
        errorCode
        fileSize
        objectCount
        partialDataUrl
        query
        rootObjectCount
        status
        url
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_BULK_OPERATION_INFO = gql`
  query getBulkOperationInfo {
    currentBulkOperation {
      id
      url
      status
      completedAt
      createdAt
      errorCode
      fileSize
      objectCount
      query
      rootObjectCount
    }
  }
`;

function ResourceListWithProducts({
  setToastActive,
  setToastContent,
  modalStatusFromImportOrExport,
  setModalStatusFromImportOrExport,
}) {
  const client = useApolloClient();
  const app = useContext(AppBridgeContext);
  const redirect = Redirect.create(app);
  const sharedState = useAppContext();
  const { shopOrigin } = sharedState;
  const [productTypeValue, setProductTypeValue] = useState([]);
  const [productVendorValue, setProductVendorValue] = useState([]);
  const [queryValue, setQueryValue] = useState('');
  const [sortValue, setSortValule] = useState('TITLE_ASC');
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalStatus, setModalStatus] = useState(0);
  const [modalExportScope, setModalExportScope] = useState('all');
  const [modalExportIsWorking, setModalExportIsWorking] = useState(false);
  const [modalFileDialogOpened, setModalFileDialogOpened] = useState(false);
  const [modalImportedFile, setModalImportedFile] = useState(null);
  const [modalImportIsWorking, setModalImportIsWorking] = useState(false);
  const [
    modalImportLeftProductsCount,
    setModalImportLeftProductsCount,
  ] = useState(null);
  const [modalEditingProduct, setModalEditingProduct] = useState(null);
  const [modalViewProductsTableInfo, setModalViewProductsTableInfo] = useState({
    columnContentTypes: [],
    headings: [],
    rows: [],
  });
  const modalContentWrapperRef = useRef();
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const { data: dataWithShopInfo } = useQuery(GET_SHOP_INFO);
  const specificationInfo = JSON.parse(
    dataWithShopInfo?.shop?.metafield?.value ?? '{}'
  );

  const { loading, data: dataWithProducts, refetch, fetchMore } = useQuery(
    GET_PRODUCTS,
    {
      variables: {
        first: 50,
        query: `${getQueryString(
          queryValue,
          productTypeValue,
          productVendorValue
        )}`,
        reverse: !!sortValue.includes('DESC'),
        sortKey: sortValue.replace('_DESC', '').replace('_ASC', ''),
      },
    }
  );

  useEffect(() => {
    refetch();
  }, [queryValue, productTypeValue, productVendorValue, sortValue, refetch]);

  useEffect(() => {
    setModalStatus(modalStatusFromImportOrExport);
  }, [modalStatusFromImportOrExport]);

  const resetModal = () => {
    setModalExportScope('all');
    setModalFileDialogOpened(false);
    setModalImportedFile(null);
    setModalEditingProduct(null);
    setModalExportIsWorking(false);
    setModalImportIsWorking(false);
    setModalViewProductsTableInfo({
      columnContentTypes: [],
      headings: [],
      rows: [],
    });
    setModalStatus(0);
    setModalStatusFromImportOrExport(0);
  };

  const handleModalExportScopeChanged = (_checked, value) => {
    setModalExportScope(value);
  };

  const handleModalDropZoneAccepted = (files) => {
    setModalImportedFile(files?.[0] ?? null);
  };

  const handleViewButtonClicked = async () => {
    const promiseArray = selectedItems.map((id) =>
      client
        .query({ query: GET_PRODUCT, variables: { id } })
        .then((response) => response?.data?.product ?? null)
    );
    const productsInfo = await Promise.all(promiseArray);
    const viewProductsTableInfo = getViewProductsTableInfo(
      productsInfo,
      specificationInfo
    );
    setModalViewProductsTableInfo(viewProductsTableInfo);
    setModalStatus(3);
  };

  const handleEditButtonClicked = async (id) => {
    const productInfo = await client
      .query({
        query: GET_PRODUCT,
        variables: { id },
      })
      .then((response) => response?.data?.product ?? null);

    setModalEditingProduct(productInfo);
    setModalStatus(4);
  };

  const handleModalConfirmButtonClicked = async () => {
    // do something according to modal status;
    if (modalStatus === 1 && modalImportedFile) {
      setModalImportIsWorking(true);
      try {
        const formData = new FormData();
        formData.append('csv', modalImportedFile);
        const productsFromCSV = await axios
          .post('/importCSV', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((response) => response.data);
        const countOfProductsToUpdate = productsFromCSV.length ?? 0;
        setModalImportLeftProductsCount(countOfProductsToUpdate);
        let availablePointsCount = 1000;
        let index = 0;
        productsFromCSV.forEach(async (productFromCSV) => {
          index += 1;
          const { id } = productFromCSV;
          if (id) {
            if (index % 5 === 0) {
              const queryForProduct = await client.query({
                query: GET_PRODUCT,
                variables: { id },
                fetchPolicy: 'no-cache',
              });
              const dataWithProductFromQuery = queryForProduct.data;
              availablePointsCount =
                dataWithProductFromQuery.extensions.cost.throttleStatus
                  .currentlyAvailable;
              const productFromQuery =
                dataWithProductFromQuery?.product ?? null;

              if (productFromQuery) {
                const input = getProductInputPayload(
                  productFromCSV,
                  productFromQuery,
                  specificationInfo
                );

                await updateProduct({ variables: { input } })
                  .then(({ extensions }) => {
                    availablePointsCount =
                      extensions.cost.throttleStatus.currentlyAvailable;
                  })
                  .catch((error) => {
                    throw new Error(error.message);
                  });
              }
            } else {
              client
                .query({
                  query: GET_PRODUCT,
                  variables: { id },
                  fetchPolicy: 'no-cache',
                })
                .then(async (queryForProduct) => {
                  const dataWithProductFromQuery = queryForProduct.data;
                  const productFromQuery =
                    dataWithProductFromQuery?.product ?? null;
                  availablePointsCount =
                    dataWithProductFromQuery.extensions.cost.throttleStatus
                      .currentlyAvailable;
                  if (productFromQuery) {
                    const input = getProductInputPayload(
                      productFromCSV,
                      productFromQuery,
                      specificationInfo
                    );
                    updateProduct({ variables: { input } })
                      .then(({ extensions }) => {
                        availablePointsCount =
                          extensions.cost.throttleStatus.currentlyAvailable;
                      })
                      .catch((error) => {
                        throw new Error(error.message);
                      });
                  }
                });
            }
            if (availablePointsCount < 100) {
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                }, 1000);
              });
            }
            setModalImportLeftProductsCount(countOfProductsToUpdate - index);
          }
        });

        setToastActive(true);
        setToastContent('File imported');
      } catch (err) {
        setToastActive(true);
        setToastContent(err.message);
      }
    }

    if (modalStatus === 2) {
      try {
        setModalExportIsWorking(true);
        const productsQueryString =
          modalExportScope !== 'filtered'
            ? `"*"`
            : `"${getQueryString(
                queryValue,
                productTypeValue,
                productVendorValue
              )}"`;

        const { data } = await client.mutate({
          mutation: GET_PRODUCTS_IN_BULK,
          variables: {
            query: `
            {
              products(query: ${productsQueryString}) {
                edges {
                  node {
                    id
                    handle
                    title
                    legacyResourceId
                    metafield(key: "info", namespace: "dtm") {
                      id
                      key
                      legacyResourceId
                      namespace
                      value
                      valueType
                      ownerType
                    }
                    tags
                  }
                }
              }
            }`,
          },
        });
        if ((data?.bulkOperationRunQuery?.userErrors?.length ?? 0) > 0) {
          throw new Error(
            data.bulkOperationRunQuery.userErrors.map((error) => error.message)
          );
        }
        const bulkOperationCompleted = () =>
          new Promise((resolve) => {
            const interval = setInterval(async () => {
              const { data: dataWithBulkOperationInfo } = await client.query({
                query: GET_BULK_OPERATION_INFO,
                fetchPolicy: 'network-only',
              });
              if (
                dataWithBulkOperationInfo.currentBulkOperation.status ===
                'COMPLETED'
              ) {
                clearInterval(interval);
                resolve(dataWithBulkOperationInfo.currentBulkOperation.url);
              }
            }, 2000);
          });

        const url = await bulkOperationCompleted();
        const rawExportedData = await axios
          .get('/getFile', { params: { url } })
          .then((response) => response.data);

        const targetJSON = rawExportedData
          .filter((product) => {
            switch (modalExportScope) {
              case 'all': {
                return true;
              }
              case 'filtered': {
                return true;
              }
              case 'page': {
                return (dataWithProducts?.products?.edges ?? [])
                  ?.map(({ node }) => node.id)
                  .includes(product.id);
              }
              case 'selected': {
                return selectedItems.includes(product.id);
              }
              default: {
                return false;
              }
            }
          })
          .map((product) => getProductInfoToExport(product, specificationInfo));
        const targetCSV = parse(targetJSON);
        const blob = new Blob([targetCSV], { type: 'text/csv' });
        const now = new Date();
        const fileName = `${now.toDateString()} ${
          now.toTimeString().split(' ')[0]
        }.csv`;
        const csvLink = getDownloadLink(blob, fileName);
        csvLink.click();
      } catch (err) {
        setToastContent(err.message);
        setToastActive(true);
      }
    }

    if (modalStatus === 4) {
      const form = modalContentWrapperRef.current.querySelector('form');
      const toBeSubmittedValues = Array.from(form.elements)
        .filter((element) => element.name)
        .reduce((acc, element) => {
          acc[element.name] = element.value;
          return acc;
        }, {});

      try {
        const input = getProductInputPayload(
          toBeSubmittedValues,
          modalEditingProduct,
          specificationInfo
        );
        await updateProduct({ variables: { input } });
        setToastActive(true);
        setToastContent('Changes saved');
      } catch (err) {
        setToastActive(true);
        setToastContent('Failed to save changes');
      }
    }
    resetModal();
  };

  const handleModalCancelButtonClicked = async () => {
    resetModal();
  };

  const handleModalCloseIconClicked = async () => {
    resetModal();
  };

  const handleClearAll = useCallback(() => {
    setQueryValue('');
    setProductTypeValue([]);
    setProductVendorValue([]);
  }, [setQueryValue, setProductTypeValue, setProductVendorValue]);

  const handleEditProductButtonClicked = (id) => {
    redirect.dispatch(Redirect.Action.ADMIN_PATH, {
      path: `/products/${id}`,
      newContext: true,
    });
  };

  const handleViewProductButtonClicked = (handle) => {
    redirect.dispatch(Redirect.Action.REMOTE, {
      url: `https://${shopOrigin}/products/${handle}`,
      newContext: true,
    });
  };

  const promotedBulkActions = [
    {
      content: 'View specifications',
      onAction: handleViewButtonClicked,
      paginatedSelectAllAction: (...args) => {
        console.log(args);
      },
    },
  ];

  let modalContent = null;
  let modalTitle = '';
  switch (modalStatus) {
    case 0: {
      break;
    }
    case 1: {
      modalTitle = 'Import product specifications by CSV';
      modalContent = (
        <ImportProductsModalContent
          {...{
            modalImportLeftProductsCount,
            modalImportedFile,
            modalImportIsWorking,
            modalFileDialogOpened,
            setModalFileDialogOpened,
            handleModalDropZoneAccepted,
          }}
        />
      );
      break;
    }
    case 2: {
      modalTitle = 'Export product specifications';
      modalContent = (
        <ExportProductsModalContent
          {...{
            modalExportIsWorking,
            modalExportScope,
            selectedItems,
            handleModalExportScopeChanged,
          }}
        />
      );
      break;
    }
    case 3: {
      modalTitle = "Selected product's specifications";
      modalContent = (
        <DataTable
          headings={modalViewProductsTableInfo.headings}
          rows={modalViewProductsTableInfo.rows}
          columnContentTypes={modalViewProductsTableInfo.columnContentTypes}
        />
      );
      break;
    }
    case 4: {
      modalTitle = "Edit the product's specifications";
      const {
        storedSpecifications,
        nonstoredSpecifications,
      } = getSpecificationGroups(modalEditingProduct, specificationInfo);

      modalContent = (
        <EditProductModalContent
          storedSpecifications={storedSpecifications}
          nonstoredSpecifications={nonstoredSpecifications}
        />
      );
      break;
    }
    default: {
      break;
    }
  }

  const hasPrevious =
    dataWithProducts?.products?.pageInfo?.hasPreviousPage ?? false;
  const hasNext = dataWithProducts?.products?.pageInfo?.hasNextPage ?? false;
  const lastCursor =
    dataWithProducts?.products?.edges?.slice(-1)?.[0]?.cursor ?? null;
  const firstCursor = dataWithProducts?.products?.edges?.[0]?.cursor ?? null;

  return (
    <Card>
      <Modal
        large={modalStatus === 3}
        open={modalStatus}
        onClose={handleModalCloseIconClicked}
        title={modalTitle}
        primaryAction={{
          content: 'Confirm',
          onAction: handleModalConfirmButtonClicked,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalCancelButtonClicked,
          },
        ]}
      >
        <Modal.Section>
          <div className="modal-content-wrapper" ref={modalContentWrapperRef}>
            {modalContent}
          </div>
        </Modal.Section>
      </Modal>
      <ResourceList
        resourceName={{ singular: 'Product', plural: 'Products' }}
        loading={loading}
        filterControl={
          <ProductsFilterControl
            {...{
              dataWithShopInfo,
              queryValue,
              productTypeValue,
              productVendorValue,
              setQueryValue,
              setProductTypeValue,
              setProductVendorValue,
              handleClearAll,
            }}
          />
        }
        sortValue={sortValue}
        sortOptions={[
          { label: 'Product title A-Z', value: 'TITLE_ASC' },
          { label: 'Product title Z-A', value: 'TITLE_DESC' },
          { label: 'Created (oldest first)', value: 'CREATED_AT_ASC' },
          { label: 'Created (newest first)', value: 'CREATED_AT_DESC' },
          { label: 'Updated (oldest first)', value: 'UPDATED_AT_ASC' },
          { label: 'Updated (newest first)', value: 'UPDATED_AT_DESC' },
          { label: 'Low inventory', value: 'INVENTORY_TOTAL_ASC' },
          { label: 'High inventory', value: 'INVENTORY_TOTAL_DESC' },
          { label: 'Product type A-Z', value: 'PRODUCT_TYPE_ASC' },
          { label: 'Product type Z-A', value: 'PRODUCT_TYPE_DESC' },
          { label: 'Vendor A-Z', value: 'VENDOR_ASC' },
          { label: 'Vendor Z-A', value: 'VENDOR_DESC' },
        ]}
        onSortChange={setSortValule}
        selectable
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        idForItem={(item, index) => item?.node?.id ?? index}
        promotedBulkActions={promotedBulkActions}
        items={dataWithProducts?.products?.edges ?? []}
        renderItem={({ node: item }) => {
          const media = (
            <Thumbnail
              source={
                item?.featuredImage?.originalSrc ??
                '/product_image_placeholder.png'
              }
              alt={item?.featuredImage?.altText ?? ''}
              size="small"
            />
          );

          return (
            <ResourceItem
              id={item.id}
              media={media}
              accessibilityLabel={`View details for ${item.title}`}
            >
              <Stack>
                <Stack.Item fill>
                  <h3>
                    <TextStyle variation="strong">{item.title}</TextStyle>
                  </h3>
                  <h6>{item.id}</h6>
                </Stack.Item>
                <ButtonGroup>
                  <Button
                    onClick={() =>
                      handleEditProductButtonClicked(item.legacyResourceId)
                    }
                  >
                    Edit Product
                  </Button>
                  <Button
                    onClick={() => handleViewProductButtonClicked(item.handle)}
                  >
                    View Product
                  </Button>
                  <Button onClick={() => handleEditButtonClicked(item.id)}>
                    Edit Specification
                  </Button>
                </ButtonGroup>
              </Stack>
            </ResourceItem>
          );
        }}
      />
      <hr style={{ marginBottom: 0 }} />
      <div style={{ padding: '15px 0' }}>
        <Stack
          alignment="center"
          distribution="center"
          wrap
          vertical
          spacing="none"
        >
          <Pagination
            hasPrevious={hasPrevious}
            onPrevious={() => {
              if (hasPrevious && firstCursor) {
                fetchMore({
                  variables: {
                    before: firstCursor,
                    last: 50,
                    first: undefined,
                  },
                });
              }
            }}
            hasNext={hasNext}
            onNext={() => {
              if (hasNext && lastCursor) {
                fetchMore({ variables: { after: lastCursor } });
              }
            }}
          />
        </Stack>
      </div>
    </Card>
  );
}

ResourceListWithProducts.propTypes = {
  setToastActive: PropTypes.func,
  setToastContent: PropTypes.func,
  modalStatusFromImportOrExport: PropTypes.number,
  setModalStatusFromImportOrExport: PropTypes.func,
};

export default ResourceListWithProducts;
