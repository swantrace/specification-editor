/* eslint-disable react/jsx-key */
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import {
  Button,
  ButtonGroup,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  ResourceItem,
  ResourceList,
  Select,
  TextField,
  Thumbnail
} from '@shopify/polaris';
import { CompositeDecorator, ContentState, convertFromHTML, EditorState } from 'draft-js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import CreateNewSpecificationForm from '../../components/CreateNewSpecificationForm';
import installAppIfNot from '../../utils/installAppIfNot';

export default function Product() {
  const router = useRouter();
  const { id: productId, title, imageSrc } = router.query;
  const storedSpecifications = [
    {
      specificationType: 'Cook Type',
      dataType: 'text',
      content: 'Cook Type 1',
      existedValues: ['Cook Type 1', 'Cook Type 2']
    },
    { specificationType: 'Primary Cooking Space', dataType: 'number', content: '100' },
    {
      specificationType: 'Warranty',
      dataType: 'rich text',
      content: `<ul>
    <li><strong><span>10 years All components from the date of purchase when assembled and operated in accordance with the accompanying Owner’s Manual, normal wear and tear excluded. </span></strong></li>
    <li><strong><span>*3 years Electrical components (Weber Connect controller)</span></strong></li>
    </ul>`
    }
  ];

  const Editor = dynamic(() => import('react-draft-wysiwyg').then(({ Editor }) => Editor), {
    ssr: false
  });

  // const stateFromHTML = dynamic(
  //   () => import('draft-js-import-html').then(({ stateFromHTML }) => stateFromHTML),
  //   {
  //     ssr: false
  //   }
  // );
  // const EditorState = dynamic(() => import('draft-js').then(({ EditorState }) => EditorState), {
  //   ssr: false
  // });
  // const [editorState, setEditorState] = useState(() =>
  //   EditorState.createWithContent(stateFromHTML(storedSpecifications[2].content))
  // );

  const [editorState, setEditorState] = useState(null);

  useEffect(() => {
    function findLinkEntities(contentBlock, callback, contentState) {
      contentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
      }, callback);
    }

    const Link = (props) => {
      const { url } = props.contentState.getEntity(props.entityKey).getData();
      return (
        <a href={url} style={styles.link}>
          {props.children}
        </a>
      );
    };

    function findImageEntities(contentBlock, callback, contentState) {
      contentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'IMAGE';
      }, callback);
    }

    const Image = (props) => {
      const { height, src, width } = props.contentState.getEntity(props.entityKey).getData();

      return <img src={src} height={height} width={width} />;
    };
    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link
      },
      {
        strategy: findImageEntities,
        component: Image
      }
    ]);
    const blocksFromHTML = convertFromHTML(storedSpecifications[2].content);
    const state = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );

    setEditorState(EditorState.createWithContent(state, decorator));
  }, []);

  return (
    <Page
      breadcrumbs={[
        {
          content: 'Products',
          onAction: () => {
            router.back();
          }
        }
      ]}
      primaryAction={<CreateNewSpecificationForm />}
      title={title}
      thumbnail={<Thumbnail source={imageSrc} alt={title} />}>
      <Layout>
        <Layout.Section>
          {storedSpecifications.map((specification) => (
            <Card title={specification.specificationType} sectioned>
              <FormLayout>
                {specification.dataType === 'text' ? (
                  <FormLayout.Group>
                    <TextField type="text" value={specification.content} />
                    <ButtonGroup>
                      <Button
                        primary
                        connectedDisclosure={{
                          accessibilityLabel: 'Other save actions',
                          actions: [{ content: 'Save as an option' }]
                        }}>
                        Save
                      </Button>
                      <Button>Remove</Button>
                    </ButtonGroup>
                  </FormLayout.Group>
                ) : specification.dataType === 'number' ? (
                  <FormLayout.Group>
                    <TextField type="number" value={specification.content} />
                    <ButtonGroup>
                      <Button primary>Save</Button>
                      <Button>Remove</Button>
                    </ButtonGroup>
                  </FormLayout.Group>
                ) : specification.dataType === 'rich text' ? (
                  <>
                    <Editor editorState={editorState} onEditorStateChange={setEditorState} />
                    <ButtonGroup>
                      <Button primary>Save</Button>
                      <Button>Remove</Button>
                    </ButtonGroup>
                  </>
                ) : null}
              </FormLayout>
            </Card>
          ))}
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
