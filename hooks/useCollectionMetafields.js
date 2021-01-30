import { useSWRInfinite } from 'swr';

import swrFetcher from '../utils/swrFetcher';

const useCollectionMetafields = (
  collectionId,
  otherOptions = { limit: 250, namespace: 'luxe' }
) => {
  const getKey = (index, previousPageMetafields) => {
    if (previousPageMetafields && !previousPageMetafields.nextPageParameters) {
      return null;
    }

    if (index === 0) {
      return [
        'metafield',
        'list',
        JSON.stringify({
          metafield: { owner_resource: 'collection', owner_id: collectionId },
          ...otherOptions
        })
      ];
    }

    return ['metafield', 'list', JSON.stringify(previousPageMetafields.nextPageParameters)];
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, swrFetcher, {
    initialData: [],
    revalidateOnMount: true,
    initialSize: 1
  });
  return {
    metafields: data,
    isLoading: !error & !data,
    isError: error,
    mutateMetafields: mutate,
    size,
    setSize
  };
};

export default useCollectionMetafields;
