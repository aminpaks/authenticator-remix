export const getHumanReadableFileSize = (() => {
  const byteUnits = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (inBytes: number): string => {
    let i = -1;
    let fileSizeInBytes = inBytes;
    do {
      i++;
      fileSizeInBytes /= 1024;
    } while (fileSizeInBytes > 1024);

    return `${Math.max(fileSizeInBytes, 0.1).toFixed(1)} ${byteUnits[i]}`;
  };
})();
