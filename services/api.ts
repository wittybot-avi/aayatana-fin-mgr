
// Placeholder API service for client-side mode
// This prevents import errors in components that might reference it
// but in this rollback state, DataStore handles everything locally.

export const api = {
  get: async (url: string) => { console.warn("API GET called in client-mode", url); return []; },
  post: async (url: string, data: any) => { console.warn("API POST called in client-mode", url); return {}; },
  put: async (url: string, data: any) => { return {}; },
  delete: async (url: string) => { return {}; }
};
