import {
  Card,
  Filters,
  Layout,
  Page,
  Pagination,
  ResourceItem,
  ResourceList,
  TextStyle,
  Thumbnail
} from '@shopify/polaris';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import ImportExportActionList from '../components/ImportExportActionList';
import useProducts from '../hooks/useProducts';
import installAppIfNot from '../utils/installAppIfNot';

export default function Home() {
  const router = useRouter();
  const {
    products,
    isLoading: pIsLoading,
    isError: pIsError,
    mutateProducts,
    size: pSize,
    setSize: pSetSize
  } = useProducts({ limit: 10 });
  const currentPageProducts = useMemo(() => products[pSize - 1] ?? [], [products, pSize]);
  const [queryValue, setQueryValue] = useState(null);
  const handleFiltersQueryChange = useCallback((value) => setQueryValue(value), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleFiltersClearAll = useCallback(() => setQueryValue(null), []);
  const handlePreviousPage = useCallback(() => {
    pSetSize(pSize - 1);
  }, []);
  const handleNextPage = useCallback(() => pSetSize(pSize + 1), []);
  const filters = [];
  const handleImport = useCallback(() => {
    console.log('import');
  }, []);
  const handleExport = useCallback(() => {
    console.log('export');
  }, []);
  return (
    <Page fullWidth primaryAction={<ImportExportActionList />}>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <ResourceList
              resourceName={{ singular: 'product', plural: 'products' }}
              filterControl={
                <Filters
                  queryValue={queryValue}
                  filters={filters}
                  onQueryChange={handleFiltersQueryChange}
                  onQueryClear={handleQueryValueRemove}
                  onClearAll={handleFiltersClearAll}
                />
              }
              items={currentPageProducts}
              renderItem={(product) => {
                console.log(product);
                const { id, title, image } = product;
                const imageSrc = image
                  ? image.src
                  : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=jpg&quality=90&v=1530129081';
                return (
                  <ResourceItem
                    id={id}
                    onClick={() => {
                      router.push(`/products/${id}?title=${title}&imageSrc=${imageSrc}`);
                    }}
                    media={<Thumbnail source={imageSrc} alt={title} size="small" />}
                    accessibilityLabel={`View details for ${title}`}>
                    <h3>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                  </ResourceItem>
                );
              }}
            />
            <Pagination
              hasPrevious={true}
              hasNext={true}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
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
