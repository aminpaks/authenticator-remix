import {streamMultipart} from '@web3-storage/multipart-parser';

export interface UploadFile {
  contentType: string;
  filename: string | null;
  size: number;
  buff: Uint8Array;
}

async function getFile(part: {
  contentType: string;
  filename?: string;
  data: AsyncIterable<Uint8Array>;
}): Promise<UploadFile | null> {
  let filename: string | null = null;
  if (typeof part.filename === 'string') {
    const potentialName = part.filename.split(/[/\\]/).pop();
    if (potentialName) {
      filename = potentialName;
    }
  }

  let size = 0;
  let buff: number[] = [];
  for await (const chunk of part.data) {
    size += chunk.byteLength;
    buff.push(...chunk);
  }

  return buff.length > 0
    ? {
        filename,
        size,
        buff: new Uint8Array(buff),
        contentType: part.contentType,
      }
    : null;
}

const boundaryRegEx = /boundary=(.+?)$/i;
export async function parseUploadForm(req: any): Promise<UploadFile[]> {
  try {
    const boundary = boundaryRegEx.exec(String(req.headers.get('content-type')))?.[1];
    if (!boundary) {
      return [];
    }
    const parts = streamMultipart(req.body, boundary);
    console.log({boundary, parts});

    const files: UploadFile[] = [];
    for await (const part of parts) {
      console.log({part});
      if (part.done) {
        break;
      }

      const file = await getFile(part);
      if (file) {
        files.push(file);
      }
    }

    return files;
  } catch (error) {
    console.error(error);
    return [];
  }
}
