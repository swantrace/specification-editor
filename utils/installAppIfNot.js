import nc from 'next-connect';
import createNextShopifyFunctions from 'next-connect-shopify';

import prepareSessionOptions from './prepareSessionOptions';

export default async function installAppIfNot({ req, res }) {
  const {
    SHOPIFY_APP_CLIENT_SECRET: sharedSecret,
    SHOPIFY_APP_CLIENT_ID: apiKey,
    SHOPIFY_APP_SCOPES: scopes
  } = process.env;
  const {
    setSessionMiddleware,
    loginAgainIfDirrentShopMiddleware,
    verifyTokenMiddleware
  } = createNextShopifyFunctions({
    prepareSessionOptions,
    sharedSecret,
    apiKey,
    scopes
  });

  const handler = nc()
    .use(setSessionMiddleware)
    .use(loginAgainIfDirrentShopMiddleware)
    .use(verifyTokenMiddleware);

  try {
    await handler.run(req, res);
  } catch (err) {
    console.log(`failed to verify access token because ${err.message}`);
  }
}
