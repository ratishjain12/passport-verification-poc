export function checkValidName(
  providedName: string,
  extractedName: string
): boolean {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");

  const normalizedProvided = normalize(providedName);
  const normalizedExtracted = normalize(extractedName);

  console.log(
    `Provided: ${normalizedProvided}, Extracted: ${normalizedExtracted}`
  );

  return normalizedProvided === normalizedExtracted;
}
