export function createSecret(
  {length = Math.ceil(Math.random() * 6) + 16} = {} as {length?: number},
) {
  return BigInt(crypto.getRandomValues(new Uint8Array(length)).join(''))
    .toString(32)
    .toUpperCase()
    .substring(0, length);
}
