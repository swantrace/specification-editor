import axios from 'axios';
import isJSON from 'is-json';

import shopifyResourceTypes from './shopifyResourceTypes';
const swrFetcher = (resourceName, methodName, ...args) => {
  if (
    shopifyResourceTypes[resourceName] &&
    shopifyResourceTypes[resourceName][methodName] &&
    shopifyResourceTypes[resourceName][methodName].length >= args.length
  ) {
    const options = args.reduce((acc, cur, idx) => {
      acc[shopifyResourceTypes[resourceName][methodName][idx]] = isJSON(cur)
        ? JSON.parse(cur)
        : cur;
      return acc;
    }, {});
    console.log(resourceName, methodName, options);
    return axios.post(`/api/${resourceName}/${methodName}`, options).then((res) => res.data);
  } else {
    return window.Promise.reject(
      new Error("You didn't use fetcher correctly, please check it again")
    );
  }
};

export default swrFetcher;
