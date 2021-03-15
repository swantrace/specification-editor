import { ChoiceList, Filters } from '@shopify/polaris';
import PropTypes from 'prop-types';

function ProductsFilterControl({
  dataWithShopInfo,
  queryValue,
  productTypeValue,
  productVendorValue,
  setQueryValue,
  setProductTypeValue,
  setProductVendorValue,
  handleClearAll,
}) {
  const filters = [
    {
      key: 'productType',
      label: 'Product type',
      filter: (
        <ChoiceList
          allowMultiple
          title=""
          choices={
            dataWithShopInfo?.shop?.productTypes?.edges?.map((typeEdge) => ({
              label: typeEdge.node,
              value: typeEdge.node,
            })) ?? []
          }
          selected={productTypeValue}
          onChange={setProductTypeValue}
        />
      ),
      shortcut: true,
    },
    {
      key: 'productVendor',
      label: 'Product vendor',
      filter: (
        <ChoiceList
          allowMultiple
          title=""
          choices={
            dataWithShopInfo?.shop?.productVendors?.edges?.map(
              (vendorEdge) => ({
                label: vendorEdge.node,
                value: vendorEdge.node,
              })
            ) ?? []
          }
          selected={productVendorValue}
          onChange={setProductVendorValue}
        />
      ),
      shortcut: true,
    },
  ];

  const vendorAppliedFilter = productVendorValue.reduce((acc, vendor) => {
    if (acc.length === 0) {
      acc[0] = {};
    }
    acc[0].key ??= 'productVendor';
    acc[0].onRemove ??= () => setProductVendorValue([]);
    if (acc[0].label) {
      acc[0].label = `${acc[0].label.replace('is', 'contains')}, ${vendor}`;
    } else {
      acc[0].label = `Product vendor is ${vendor}`;
    }
    return acc;
  }, []);

  const typeAppliedFilter = productTypeValue.reduce((acc, type) => {
    if (acc.length === 0) {
      acc[0] = {};
    }
    acc[0].key ??= 'productType';
    acc[0].onRemove ??= () => setProductTypeValue([]);
    if (acc[0].label) {
      acc[0].label = `${acc[0].label.replace('is', 'contains')}, ${type}`;
    } else {
      acc[0].label = `Product type is ${type}`;
    }
    return acc;
  }, []);

  const appliedFilters = [...vendorAppliedFilter, ...typeAppliedFilter];

  return (
    <Filters
      queryPlaceholder="Please enter one product's title, sku or barcode"
      queryValue={queryValue}
      filters={filters}
      appliedFilters={appliedFilters}
      onQueryChange={setQueryValue}
      onQueryClear={() => setQueryValue('')}
      onClearAll={handleClearAll}
    />
  );
}

ProductsFilterControl.propTypes = {
  dataWithShopInfo: PropTypes.object,
  queryValue: PropTypes.string,
  productTypeValue: PropTypes.arrayOf(PropTypes.string),
  productVendorValue: PropTypes.arrayOf(PropTypes.string),
  setQueryValue: PropTypes.func,
  setProductTypeValue: PropTypes.func,
  setProductVendorValue: PropTypes.func,
  handleClearAll: PropTypes.func,
};

export default ProductsFilterControl;
