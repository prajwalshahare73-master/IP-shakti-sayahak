/**
 * IP-SAKTI Sahayak — Unified Backend API Configuration
 * Deployed as a full-stack Vercel application with seamless /api/v1 routing.
 */

export const API_CONFIG = {
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  FASTAPI_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://rojtnwhwlfsnhcgvbefd.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MfsZpOzB-jt9ADXCbdEbEw_PdAVZiwv',
  USE_MOCK: false
};
