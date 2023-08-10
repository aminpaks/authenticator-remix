import {useCallback, useEffect, useState} from 'react';
import {useSearchParams} from '@remix-run/react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  HorizontalGrid,
  HorizontalStack,
  Icon,
  Layout,
  Page,
  ProgressBar,
  Text,
  TextField,
  Tooltip,
  VerticalStack,
} from '@shopify/polaris';
import {ClipboardMinor, DuplicateMinor, KeyMajor} from '@shopify/polaris-icons';
import type {V2_MetaFunction} from '@remix-run/node';

import {globalTitle, viewPort} from '~/constant';
import {createSecret, generateTOTP, useToast, createQRCode, createKeyUri} from '~/utils';

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `One-time-password Code Generator | ${globalTitle}`,
    },
    {
      name: 'description',
      content: 'Generate a one-time-password code from secrets',
    },
    {
      viewport: viewPort,
    },
  ];
};

interface State {
  token: string;
  nextToken: string;
  progress: number;
  nextIn: string;
  qrCode: string;
}

export default function OtpCode() {
  const [params, setParams] = useSearchParams();
  const secret = params.get('secret') || '';
  const [showToast, toastMarkup] = useToast();
  const [state, setState] = useState<State>({
    token: '',
    nextToken: '',
    progress: 0,
    nextIn: '30',
    qrCode: '',
  });

  const handleSecretChange = useCallback(
    (newValue: string) => {
      setParams({secret: newValue});
    },
    [setParams],
  );

  const handleSecretPaste = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setParams({secret: text});
    });
  }, [setParams]);

  const copyValue = useCallback(
    async ({value, toastContent}: {value: string; toastContent: string}) => {
      await navigator.clipboard.writeText(value);
      showToast({content: toastContent});
    },
    [showToast],
  );

  useEffect(() => {
    if (!secret) {
      return handleSecretChange(createSecret());
    }
    if (secret) {
      createQRCode({text: createKeyUri({secret})}).then((qrCode) =>
        setState((state) => ({...state, qrCode})),
      );
    }

    let timeoutId: number;
    function tick() {
      setState(({qrCode}) => {
        const interval = (Date.now() / 1000) % 30;
        const progress = Number(((interval / 30) * 100).toFixed(1));
        const nextIn = String(Math.ceil(30 - interval));
        const token = generateTOTP({key: secret});
        const nextToken = generateTOTP({key: secret, now: Date.now() + 30_000});

        return {
          token,
          nextToken,
          progress,
          nextIn,
          qrCode,
        };
      });
      timeoutId = window.setTimeout(tick, 50);
    }
    tick();
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [handleSecretChange, secret]);

  return (
    <>
      {toastMarkup}
      <Page divider title="One-time-password Code Generator">
        <Layout>
          <Layout.Section oneHalf>
            <Card>
              <VerticalStack gap="4">
                <TextField
                  autoComplete="off"
                  label="Secret"
                  value={secret}
                  connectedRight={
                    <ButtonGroup segmented>
                      <Tooltip content="Paste from clipboard">
                        <Button
                          icon={<Icon source={ClipboardMinor} />}
                          onClick={handleSecretPaste}
                        />
                      </Tooltip>
                      <Tooltip content="Generate random secret!">
                        <Button
                          icon={<Icon source={KeyMajor} />}
                          onClick={() => handleSecretChange(createSecret())}
                        />
                      </Tooltip>
                    </ButtonGroup>
                  }
                  onChange={handleSecretChange}
                />
                <HorizontalGrid columns={2} gap="4" alignItems="center">
                  <Text as="span">Current OTP code:</Text>
                  <TextField
                    readOnly
                    autoComplete="off"
                    labelHidden
                    label="Current OTP code"
                    value={state.token}
                    connectedRight={
                      <Tooltip content="Copy to clipboard">
                        <Button
                          icon={<Icon source={DuplicateMinor} />}
                          onClick={() => {
                            copyValue({value: state.token, toastContent: 'Current OTP copied!'});
                          }}
                        />
                      </Tooltip>
                    }
                  />
                </HorizontalGrid>
                <HorizontalGrid columns={2} gap="4" alignItems="center">
                  <Text as="span">Next OTP code:</Text>
                  <TextField
                    readOnly
                    autoComplete="off"
                    labelHidden
                    label="Current OTP code"
                    value={state.nextToken}
                    connectedRight={
                      <Tooltip content="Copy to clipboard">
                        <Button
                          icon={<Icon source={DuplicateMinor} />}
                          onClick={() => {
                            copyValue({value: state.nextToken, toastContent: 'Next OTP copied!'});
                          }}
                        />
                      </Tooltip>
                    }
                  />
                </HorizontalGrid>
                <HorizontalStack wrap={false} gap="4" align="space-between" blockAlign="baseline">
                  <span style={{minWidth: 75, whiteSpace: 'nowrap'}}>
                    <Text as="span">Next in {state.nextIn}s</Text>
                  </span>
                  <ProgressBar size="small" progress={state.progress} />
                </HorizontalStack>
              </VerticalStack>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            {state.qrCode ? (
              <HorizontalStack align="center" blockAlign="center">
                <Box padding="4">
                  <Box borderWidth="1" borderColor="border-subdued">
                    <img style={{display: 'block'}} width={180} src={state.qrCode} alt="QR Code" />
                  </Box>
                </Box>
              </HorizontalStack>
            ) : null}
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
