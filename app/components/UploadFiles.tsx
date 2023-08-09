import {
  Box,
  Button,
  ButtonGroup,
  HorizontalStack,
  Spinner,
  Text,
  Thumbnail,
  VerticalStack,
} from '@shopify/polaris';

import {getHumanReadableFileSize} from '~/utils';

export interface Props {
  items: UploadFile[];
}

export type UploadFile = {
  id: string;
  file: File;
} & (
  | {
      status: 'loading';
    }
  | {
      status: 'complete';
      value: string;
    }
  | {
      status: 'error';
      reason: string;
    }
);

export function UploadFiles({items}: Props) {
  return items.length > 0 ? (
    <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
      {items.map((item, index) => (
        <li key={item.id}>
          <Box
            paddingBlockStart="4"
            paddingBlockEnd="4"
            borderBlockStartWidth={index > 0 ? '1' : undefined}
            borderColor="border-subdued"
          >
            <HorizontalStack gap="4" wrap={false} align="space-between" blockAlign="center">
              <HorizontalStack gap="4">
                <Thumbnail alt="Upload image" source={URL.createObjectURL(item.file)} />
                <VerticalStack gap="2">
                  <Text variant="bodySm" as="p" fontWeight="semibold">
                    {item.file.name}
                  </Text>
                  <Text variant="bodySm" as="p">
                    Size: {getHumanReadableFileSize(item.file.size)}
                  </Text>
                </VerticalStack>
              </HorizontalStack>
              {item.status === 'complete' ? (
                <ButtonGroup noWrap segmented>
                  <Button size="slim">Copy secret</Button>
                  <Button size="slim" url={`/otp-code?secret=${item.value}`}>
                    Generate OTP
                  </Button>
                </ButtonGroup>
              ) : null}
              {item.status === 'error' ? (
                <Text variant="bodySm" as="p" color="critical">
                  Process failed: {item.reason}
                </Text>
              ) : null}
              {item.status === 'loading' ? (
                <div>
                  <Spinner accessibilityLabel="Processing image" size="small" />
                </div>
              ) : null}
            </HorizontalStack>
          </Box>
        </li>
      ))}
    </ul>
  ) : null;
}
