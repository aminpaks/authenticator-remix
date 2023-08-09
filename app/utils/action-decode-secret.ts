import {pipe} from 'fp-ts/function';
import * as Task from 'fp-ts/Task';
import * as Either from 'fp-ts/Either';
import {json, type ActionArgs, type TypedResponse} from '@remix-run/node';

import {decodeQrCodes, type QRCodeFailure} from './decode-qrcode';
import {parseUploadForm} from './parse-request-form';

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
  const files = await parseUploadForm(request);
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
