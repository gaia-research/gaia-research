export interface FetchResult {
  url: string;
  status: number;
  data: string;
}

export function fetchUrl(
  url: string,
  callback: (err: Error | null, result?: FetchResult) => void
): void {
  // Callback-based mock fetcher
  setTimeout(() => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      callback(new Error(`Invalid URL: ${url}`));
      return;
    }
    if (url.includes('error')) {
      callback(new Error(`HTTP 500: Server Error fetching ${url}`));
      return;
    }
    callback(null, {
      url,
      status: 200,
      data: JSON.stringify({ id: 1, name: 'Sample Payload', url }),
    });
  }, 10);
}
