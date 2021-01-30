import '@shopify/polaris/dist/styles.css';

import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import translations from '@shopify/polaris/locales/en.json';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { Fragment } from 'react';

import ClientRouter from '../components/ClientRouter';

function MyApp({ Component, pageProps }) {
  const { shopOrigin } = pageProps;
  const config = {
    apiKey: process.env.SHOPIFY_APP_CLIENT_ID,
    shopOrigin,
    forceRedirect: true
  };
  return (
    <Fragment>
      <Head>
        <title>Sample App</title>
        <meta charSet="utf-8" />
      </Head>
      <AppBridgeProvider config={config}>
        <ClientRouter />
        <AppProvider i18n={translations}>
          <Component {...pageProps} />
        </AppProvider>
      </AppBridgeProvider>
    </Fragment>
  );
}

MyApp.propTypes = {
  pageProps: PropTypes.shape({
    shopOrigin: PropTypes.string.isRequired
  }),
  Component: PropTypes.elementType
};

export default MyApp;
