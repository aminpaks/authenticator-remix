import {Card, Link, Page, Text, VerticalStack} from '@shopify/polaris';
import type {V2_MetaFunction} from '@remix-run/node';

import {globalTitle, viewPort} from '~/constant';

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `About | ${globalTitle}`,
    },
    {
      name: 'description',
      content: 'Authenticator app by Amin Pakseresht',
    },
    viewPort,
  ];
};

export default function OtpCode() {
  return (
    <Page divider title="About Authenticator">
      <Card roundedAbove="sm">
        <VerticalStack gap="2">
          <Text as="span" variant="headingMd">
            Powered by{' '}
            <Link url="https://polaris.shopify.com" target="_blank">
              Polaris
            </Link>
            ,{' '}
            <Link url="https://remix.run" target="_blank">
              Remix
            </Link>
            , and{' '}
            <Link url="https://vercel.com" target="_blank">
              Vercel
            </Link>
            .
          </Text>
          <Text as="p">
            Source code on{' '}
            <Link url="https://github.com/aminpaks/authenticator-remix" target="_blank">
              Github
            </Link>
            .
          </Text>
        </VerticalStack>
      </Card>
    </Page>
  );
}
