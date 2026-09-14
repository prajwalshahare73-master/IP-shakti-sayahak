/**
 * IP-SAKTI Sahayak — Backend API Configuration
 * Supports n8n Webhook, FastAPI RAG service, and local mock fallback.
 */

export const API_CONFIG = {
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  FASTAPI_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  USE_MOCK: false // Strictly disabled for RAG Grounding Validation — real FastAPI pipeline only
};
