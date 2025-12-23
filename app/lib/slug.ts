/**
 * Converts a title string into a URL-safe slug
 * @param title - The title to convert
 * @returns A lowercase, hyphenated slug with only alphanumeric characters
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
