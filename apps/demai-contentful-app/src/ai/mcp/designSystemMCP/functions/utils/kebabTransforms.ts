export function kebabToSentence(kebab: string): string {
  return kebab
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

export function kebabToClassName(kebab: string): string {
  return kebab
    .split("-") // Split by hyphens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(""); // Join words without spaces
}

export function kebabToCamel(kebab: string): string {
  return kebab
    .split("-")
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
}
