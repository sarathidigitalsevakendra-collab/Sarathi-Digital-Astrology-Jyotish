export async function apiClient(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response;
}
