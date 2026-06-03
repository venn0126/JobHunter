export function copyText(text: string) {
  if (!navigator.clipboard) {
    return Promise.resolve(false);
  }

  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false,
  );
}
