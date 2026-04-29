// FIX: was exported as a function — callers used it as a string (e.g. `${ApI_URL}/login`),
// so it was resolving to "[object Object]/login". Export a plain constant instead.

const apiBase = import.meta.env.VITE_API_URL;

if (!apiBase) {
  throw new Error("VITE_API_URL environment variable is not defined");
}

export const API_URL = `${apiBase}/api/v1`;

export const IS_PRODUCTION =
  import.meta.env.VITE_APP_ENV === "production" || import.meta.env.PROD === true;