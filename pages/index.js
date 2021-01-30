import {
  Card,
  Layout,
  Page,
  ResourceItem,
  ResourceList,
  TextStyle,
  Thumbnail
} from '@shopify/polaris';
import { useRouter } from 'next/router';

import useCollectionList from '../hooks/useCollectionList';
import installAppIfNot from '../utils/installAppIfNot';

export default function Home() {
  const router = useRouter();
  const {
    collections: smartCollections,
    isLoading: scIsLoading,
    isError: scIsError,
    size: scSize,
    setSize: scSetSize
  } = useCollectionList('smartCollection');
  const currentPageSmartCollections = smartCollections[scSize - 1] ?? [];

  const {
    collections: customCollections,
    isLoading: ccIsLoading,
    isError: ccIsError,
    size: ccSize,
    setSize: ccSetSize
  } = useCollectionList('customCollection');
  const currentPageCustomCollections = customCollections[ccSize - 1] ?? [];
  return (
    <Page>
      <Layout>
        <Layout.Section oneHalf>
          <Card title="Smart Collections">
            <ResourceList
              loading={scIsLoading}
              resourceName={{ singular: 'smart collection', plural: 'smart collections' }}
              items={currentPageSmartCollections}
              renderItem={(item) => {
                const { id, handle, title } = item;
                const imageSrc =
                  item.image && item.image.src
                    ? item.image.src
                    : 'https://dummyimage.com/60/000/fff';
                return (
                  <ResourceItem
                    id={id}
                    onClick={() =>
                      router.push(`/collections/${id}?imageSrc=${imageSrc}&title=${title}`)
                    }
                    media={<Thumbnail source={imageSrc} alt={handle} />}
                    accessibilityLabel={`View details for ${title} collection`}>
                    <h3>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card title="Custom Collections">
            <ResourceList
              resourceName={{ singular: 'custom collection', plural: 'custom collections' }}
              items={currentPageCustomCollections}
              renderItem={(item) => {
                const { id, handle, title } = item;

                const imageSrc =
                  item.image && item.image.src
                    ? item.image.src
                    : 'https://dummyimage.com/60/000/fff';

                return (
                  <ResourceItem
                    id={id}
                    url={`/collections/${id}`}
                    media={<Thumbnail source={imageSrc} alt={handle} />}
                    accessibilityLabel={`View details for ${title} collection`}>
                    <h3>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                  </ResourceItem>
                );
              }}
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
