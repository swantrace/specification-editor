import { useSWRInfinite } from 'swr';

import swrFetcher from '../utils/swrFetcher';

const useCollectionProducts = (collectionId, options = {}) => {
  const getKey = (index, previousPageProducts) => {
    if (previousPageProducts && !previousPageProducts.nextPageParameters) {
      return null;
    }

    if (index === 0) {
      return ['collection', 'products', collectionId, JSON.stringify(options)];
    }

    return [
      'collection',
      'products',
      collectionId,
      JSON.stringify(previousPageProducts.nextPageParameters)
    ];
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, swrFetcher, {
    initialData: [],
    revalidateOnMount: true,
    initialSize: 1
  });
  return {
    products: data,
    isLoading: !error & !data,
    isError: error,
    mutateProducts: mutate,
    size,
    setSize
  };
};

export default useCollectionProducts;
