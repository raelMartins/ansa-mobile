import { getApiBaseUrl } from "../../core/config/env";

/** Turn API-relative upload paths into absolute URLs for Image components. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
}
