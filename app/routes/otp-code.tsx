import {Card, Page, ProgressBar, Text, TextField, VerticalStack} from '@shopify/polaris';
import type {LoaderFunction, V2_MetaFunction} from '@remix-run/node';

import {globalTitle} from '~/constant';

export const meta: V2_MetaFunction<LoaderFunction, {root: LoaderFunction}> = ({matches}) => {
  return [
    {
      title: `One-time-password Code Generator | ${globalTitle}`,
    },
    {
      name: 'description',
      content: 'One-time-password Code Generator from secrets',
    },
  ];
};

export default function OtpCode() {
  return (
    <Page divider title="One-time-password Code Generator">
      <Card>
        <VerticalStack gap="4">
          <TextField autoComplete="off" label="Secret" />
          <Text as="span">Current OTP code:</Text>
          <ProgressBar progress={0.5} size="small" />
        </VerticalStack>
      </Card>
    </Page>
  );
}
