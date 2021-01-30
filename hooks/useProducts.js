import { useSWRInfinite } from 'swr';

import swrFetcher from '../utils/swrFetcher';

const useProducts = (options = {}) => {
  const getKey = (index, previousPageProducts) => {
    if (previousPageProducts && !previousPageProducts.nextPageParameters) {
      return null;
    }

    if (index === 0) {
      return ['product', 'list', JSON.stringify(options)];
    }

    return ['product', 'list', JSON.stringify(previousPageProducts.nextPageParameters)];
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

export default useProducts;
