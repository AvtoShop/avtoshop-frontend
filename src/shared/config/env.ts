const env = import.meta.env;

const apiOrigin =
  env.VITE_BACKEND_API_BASE_URL ??
  env.BACKEND_API_BASE_URL ??
  'https://avtoshop.ducknds.org';

export const API_BASE = apiOrigin.endsWith('/api') ? apiOrigin : `${apiOrigin}/api`;
