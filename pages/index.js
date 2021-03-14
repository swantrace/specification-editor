import { useState } from 'react';
import { Layout, Page, ButtonGroup, Button, Toast } from '@shopify/polaris';
import ResourceListWithProducts from '../components/products/ResourceListWithProducts';

const Index = () => {
  const [modalStatus, setModalStatus] = useState(0);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState('');
  const toastMarkup = toastActive ? (
    <Toast
      content={toastContent}
      onDismiss={() => setToastActive(false)}
      duration={2000}
    />
  ) : null;
  return (
    <Page
      title="Products"
      primaryAction={
        <ButtonGroup>
          <Button onClick={() => setModalStatus(1)}>Import</Button>
          <Button onClick={() => setModalStatus(2)}>Export</Button>
        </ButtonGroup>
      }
    >
      <Layout>
        <Layout.Section>
          <ResourceListWithProducts
            setToastActive={setToastActive}
            setToastContent={setToastContent}
            modalStatusFromImportOrExport={modalStatus}
            setModalStatusFromImportOrExport={setModalStatus}
          />
        </Layout.Section>
      </Layout>
      {toastMarkup}
    </Page>
  );
};
export default Index;
