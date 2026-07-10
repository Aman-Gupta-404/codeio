type QueryParams = Record<string, string | number | boolean | undefined | null>;

export function buildUrlSearchQuery(params: any): string {
  return new URLSearchParams(
    Object.entries(params)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      )
      .map(([key, value]) => [key, String(value)]),
  ).toString();
}
