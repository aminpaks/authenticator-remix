export function getRandomName() {
  return (
    String(Date.now()) +
    Math.floor(Math.random() * 9e15)
      .toString(16)
      .padStart(15, '0')
      .toUpperCase()
  );
}
