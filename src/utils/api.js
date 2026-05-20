// src/utils/api.js

/**
 * A wrapper around fetch that automatically includes the Clerk auth token.
 * It also catches errors so the app can gracefully fallback to localStorage.
 */
export async function fetchAPI(endpoint, method = 'GET', body = null, token = null) {
  if (!token) return null;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const res = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    if (!res.ok) {
      console.warn(`API Error (${method} ${endpoint}):`, res.statusText);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Network Error (${method} ${endpoint}):`, error);
    return null;
  }
}
