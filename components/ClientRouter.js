/* eslint-disable react/prop-types */
import { ClientRouter as AppBridgeClientRouter } from '@shopify/app-bridge-react';
import { withRouter } from 'next/router';

function ClientRouter(props) {
  const { router } = props;
  return <AppBridgeClientRouter history={router} />;
}

export default withRouter(ClientRouter);
