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

  if (!normalizedExtracted) return false;

  const buildFrequencyMap = (str: string): Map<string, number> => {
    const freqMap = new Map<string, number>();
    for (const char of str) {
      freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }
    return freqMap;
  };

  const providedFreqMap = buildFrequencyMap(normalizedProvided);
  const extractedFreqMap = buildFrequencyMap(normalizedExtracted);

  let matchCount = 0;
  for (const [char, count] of providedFreqMap.entries()) {
    if (extractedFreqMap.has(char)) {
      matchCount += Math.min(count, extractedFreqMap.get(char)!);
    }
  }

  const matchPercentage = (matchCount / normalizedProvided.length) * 100;
  console.log(
    `Match %: ${matchPercentage} | Provided: ${normalizedProvided}, Extracted: ${normalizedExtracted}`
  );

  return matchPercentage >= 95;
}
