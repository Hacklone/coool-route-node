const MOCK_BASE_URL = 'https://mockbaseurl.com';
const ABSOLUTE_URL_REGEX = /^(?:[a-z+]+:)?\/\//i;

export abstract class UrlUtils {
  public static addQueryToUrl(url: string, queryParams: { [prop: string]: string | undefined }): string {
    const isRelative = !ABSOLUTE_URL_REGEX.test(url);

    let result = new URL(url, isRelative ? MOCK_BASE_URL : undefined);

    const urlEntries = Object.entries(queryParams);

    for (const [param, val] of urlEntries) {
      if (val) {
        result.searchParams.set(param, val);
      }
    }

    if (isRelative) {
      return result.toString().substring(MOCK_BASE_URL.length + (url.startsWith('/') ? 0 : 1));
    }

    return result.toString();
  }
}