import {Page, Text} from '@shopify/polaris';
import {globalTitle} from '~/constant';
import type {V2_MetaFunction} from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `QRCode Decoder | ${globalTitle}`,
    },
    {
      name: 'description',
      content: 'Decode two-step authentication QRCode to discover the secret',
    },
  ];
};

export default function Index() {
  return (
    <Page title="Two-step Auth QRCode Decoder">
      <Text as="h2">Welcome!</Text>
    </Page>
  );
}
