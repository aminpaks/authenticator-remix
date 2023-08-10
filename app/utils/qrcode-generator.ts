import qrcode, {type QRCodeErrorCorrectionLevel} from 'qrcode';

export function createKeyUri({
  secret,
  account = 'example-account',
  issuer = 'Shopify',
  algorithm = 'SHA1',
  digits = 6,
  period = 30,
}: {
  secret: string;
  account?: string;
  issuer?: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 8;
  period?: 30 | 60;
}) {
  const params = new URLSearchParams(
    Object.entries({
      issuer,
      secret,
      algorithm,
      digits,
      period,
    }).map(([key, value]) => [key, value.toString()]),
  );
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    account,
  )}?${params.toString()}`;
}

export async function createQRCode({
  text,
  errorCorrectionLevel = 'M',
}: {
  text: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
}) {
  const data = await qrcode.toDataURL(text, {
    type: 'image/png',
    errorCorrectionLevel,
    width: 256,
  });
  return data;
}
