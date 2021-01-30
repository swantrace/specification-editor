import { useSWRInfinite } from 'swr';

import swrFetcher from '../utils/swrFetcher';

const useCollectionList = (collectionType = 'smartCollection', options = {}) => {
  const getKey = (index, previousPageCollections) => {
    if (previousPageCollections && !previousPageCollections.nextPageParameters) {
      return null;
    }

    if (index === 0) {
      return [collectionType, 'list', JSON.stringify(options)];
    }

    return [collectionType, 'list', JSON.stringify(previousPageCollections.nextPageParameters)];
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, swrFetcher, {
    initialData: [],
    revalidateOnMount: true,
    initialSize: 1
  });
  return {
    collections: data,
    isLoading: !error & !data,
    isError: error,
    mutateCollectionList: mutate,
    size,
    setSize
  };
};

export default useCollectionList;
