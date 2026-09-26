/**
 * IP-SAKTI Sahayak — Backend API Configuration
 * Supports unified single-domain Vercel deployment with relative API routes.
 */

const getApiBase = (): string => {
  const envVal = import.meta.env.VITE_API_BASE_URL;
  // Strictly prevent stale Render or localhost URLs from hijacking production Vercel traffic
  if (!envVal || envVal.includes('onrender.com') || envVal.includes('localhost')) {
    return '/api/v1';
  }
  return envVal;
};

export const API_CONFIG = {
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  FASTAPI_BASE_URL: getApiBase(),
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://rojtnwhwlfsnhcgvbefd.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MfsZpOzB-jt9ADXCbdEbEw_PdAVZiwv',
  USE_MOCK: false
};
