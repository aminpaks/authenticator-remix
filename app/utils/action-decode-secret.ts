import {pipe} from 'fp-ts/function';
import * as Task from 'fp-ts/Task';
import * as Either from 'fp-ts/Either';
import {
  json,
  type ActionArgs,
  type TypedResponse,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
} from '@remix-run/node';

import {decodeQrCodes, type QRCodeFailure} from './decode-qrcode';

export interface QRCodeDecode {
  filename: string | null;
  secret?: string;
  error?: QRCodeFailure;
}
export interface DecodeSecretsResponse {
  data?: QRCodeDecode[];
  errors: string[];
}

export async function actionDecodeSecret({
  request,
}: ActionArgs): Promise<TypedResponse<DecodeSecretsResponse>> {
  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({maxPartSize: 500 * 1024 /* 500kb */}),
  );
  const files = Array.from(formData.entries()).reduce<File[]>((acc, [key, value]) => {
    if (key === 'qrCode' && value instanceof File) {
      acc.push(value);
    }
    return acc;
  }, []);
  if (files.length > 0) {
    const data = await pipe(
      decodeQrCodes(files),
      Task.map((items) =>
        items.map((eitherResult) =>
          pipe(
            eitherResult,
            Either.fold(
              ({details}): QRCodeDecode => ({
                filename: details.filename,
                error: details.failure,
              }),
              ({filename, secret}): QRCodeDecode => ({filename: filename, secret: secret}),
            ),
          ),
        ),
      ),
    )();
    if (process.env.NODE_ENV === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return json({data, errors: []});
  }

  return json({errors: ['No files were uploaded!']});
}
