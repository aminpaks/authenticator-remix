import {pipe} from 'fp-ts/function';
import * as Eq from 'fp-ts/Eq';
import * as Array from 'fp-ts/Array';
import * as Identity from 'fp-ts/Identity';
import * as Option from 'fp-ts/Option';
import {useCallback, useEffect, useState} from 'react';
import {useFetcher} from '@remix-run/react';
import {Bleed, DropZone, LegacyCard, LegacyStack, Page} from '@shopify/polaris';
import type {V2_MetaFunction} from '@remix-run/node';

import {globalTitle, viewPort} from '~/constant';
import {UploadFiles, type UploadFile} from '~/components';
import {getRandomName, actionDecodeSecret, mapQRCodeFailures} from '~/utils';

export {actionDecodeSecret as action};

const uploadFileEq = Eq.fromEquals<UploadFile>((a, b) => a.id === b.id);
const stateSemigroup = Array.getUnionSemigroup<UploadFile>(uploadFileEq);

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `QRCode Decoder | ${globalTitle}`,
    },
    {
      name: 'description',
      content: 'Decode two-step authentication QRCode to discover the secret',
    },
    viewPort,
  ];
};

export default function Index() {
  const fetcher = useFetcher<typeof actionDecodeSecret>();
  const [state, setState] = useState<UploadFile[]>([]);

  const handleDropZoneDrop = useCallback(
    (_: File[], acceptedFiles: File[]) => {
      const formData = new FormData();

      const newItems = acceptedFiles
        .slice()
        .reverse()
        .map((file) => {
          const id = getRandomName();
          formData.append('qrCode', file, id);
          return {
            id,
            file,
            status: 'loading',
          } as UploadFile;
        });

      fetcher.submit(formData, {method: 'post', encType: 'multipart/form-data'});

      setState((state) => [...newItems, ...state]);
    },
    [fetcher],
  );

  useEffect(() => {
    const data = fetcher.data;
    if (data) {
      setState((state) => {
        const newState = pipe(
          data.data,
          Option.fromNullable,
          Option.map((items) =>
            pipe(
              items,
              Array.wither(Identity.Applicative)((item) =>
                pipe(
                  item.filename,
                  Option.fromNullable,
                  Option.chain((filename) =>
                    pipe(
                      state.find(({id}) => id === filename),
                      Option.fromNullable,
                    ),
                  ),
                  Option.map((stateItem) =>
                    pipe(
                      item.secret,
                      Option.fromNullable,
                      Option.map(
                        (secret): UploadFile => ({...stateItem, status: 'complete', value: secret}),
                      ),
                      Option.getOrElse(
                        (): UploadFile => ({
                          ...stateItem,
                          status: 'error',
                          reason: mapQRCodeFailures(item.error!),
                        }),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Option.getOrElse(() => state),
        );
        return stateSemigroup.concat(newState, state);
      });
    }
  }, [fetcher.data]);

  return (
    <Page divider title="Two-step Auth QRCode Decoder">
      <LegacyCard sectioned>
        <LegacyStack vertical>
          <DropZone accept=".png,.jpg,.jpeg,.gif" onDrop={handleDropZoneDrop}>
            <DropZone.FileUpload
              actionHint="Drag, and drop or click to process images. Only PNG, JPG, GIF are supported, each max 500 KB"
              actionTitle="Add QRCode image"
            />
          </DropZone>
          {state.length > 0 ? (
            <fetcher.Form method="post" encType="multipart/form-data">
              <Bleed marginBlock="4">
                <UploadFiles items={state} />
              </Bleed>
            </fetcher.Form>
          ) : null}
        </LegacyStack>
      </LegacyCard>
    </Page>
  );
}
