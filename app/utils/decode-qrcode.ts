import jimp from 'jimp';
import * as Task from 'fp-ts/Task';
import * as Either from 'fp-ts/Either';
import * as TaskEither from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import {Decoder} from '@nuintun/qrcode';

import {withReason, type Failure, failureFrom} from '~/utils';
import type {UploadFile} from './parse-request-form';

const decoder = new Decoder();
type Jimp = Awaited<ReturnType<typeof jimp.read>>;

export interface DecodedQRCode {
  filename: string;
  secret: string;
}

export interface DecodeQRCodeFailure {
  failure: QRCodeFailure;
  filename: string | null;
}
export enum QRCodeFailure {
  CannotReadFile = 'cannotReadFile',
  CannotDecodeImage = 'cannotDecodeImage',
  CannotFindSecret = 'cannotFindSecret',
  CannotModifyImage = 'cannotModifyImage',
  WithNoFileName = 'withNoFileName',
}

const decodeQrCode = (
  file: UploadFile,
): TaskEither.TaskEither<Failure<DecodeQRCodeFailure>, DecodedQRCode> =>
  pipe(
    file.filename,
    TaskEither.fromNullable(failureFrom({failure: QRCodeFailure.WithNoFileName, filename: null})),
    TaskEither.chain((filename) =>
      pipe(
        TaskEither.tryCatch(
          () => jimp.read(Buffer.from(file.buff)),
          withReason({failure: QRCodeFailure.CannotReadFile, filename}),
        ),
        Task.map((eitherImage) =>
          pipe(
            eitherImage,
            Either.chain((image): Either.Either<Failure<DecodeQRCodeFailure>, Jimp> => {
              if (image.getMIME() === 'image/png') {
                // draws white background for png images
                return Either.tryCatch(
                  () =>
                    new jimp(image.getWidth(), image.getHeight(), 0xffffffff).composite(
                      image,
                      0,
                      0,
                    ),
                  withReason({failure: QRCodeFailure.CannotModifyImage, filename}),
                );
              }
              return Either.right(image);
            }),
            Either.chain((image) =>
              pipe(
                Either.tryCatch(
                  () =>
                    decoder.decode(
                      new Uint8ClampedArray(image.bitmap.data),
                      image.getWidth(),
                      image.getHeight(),
                    ),
                  withReason({failure: QRCodeFailure.CannotDecodeImage, filename}),
                ),
                Either.chain(
                  Either.fromNullable(
                    failureFrom({failure: QRCodeFailure.CannotDecodeImage, filename}),
                  ),
                ),
                Either.chain(
                  ({data}): Either.Either<Failure<DecodeQRCodeFailure>, DecodedQRCode> => {
                    const params = new URLSearchParams(data.split('?').at(-1) ?? '');
                    const secret = params.get('secret');
                    if (!secret) {
                      return Either.left(
                        failureFrom({failure: QRCodeFailure.CannotFindSecret, filename}),
                      );
                    }
                    return Either.right({filename, secret});
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );

export function decodeQrCodes(
  files: UploadFile[],
): Task.Task<readonly Either.Either<Failure<DecodeQRCodeFailure>, DecodedQRCode>[]> {
  return pipe(files, Task.traverseArray(decodeQrCode));
}

export function mapQRCodeFailures(error: QRCodeFailure): string {
  switch (error) {
    case QRCodeFailure.CannotReadFile:
      return 'Cannot read the file!';
    case QRCodeFailure.CannotDecodeImage:
      return 'Cannot decode QRCode!';
    case QRCodeFailure.CannotFindSecret:
      return 'Cannot find the secret!';
    case QRCodeFailure.CannotModifyImage:
      return 'Cannot modify the image!';
    case QRCodeFailure.WithNoFileName:
      return 'File has no name!';
    default:
      return 'Unknown error!';
  }
}
