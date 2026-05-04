type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function loadJson<T>(
  url: string,
  parse: (input: unknown) => T
): Promise<Result<T>> {
  // Fetch, validate, and normalize remote data.
  const response = await fetch(url);

  if (!response.ok) {
    return { ok: false, error: new Error(`HTTP ${response.status}`) };
  }

  let payload: unknown = await response.json();

  try {
    payload = parse(payload);
    return { ok: true, value: payload as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error("Invalid payload") };
  }
}
