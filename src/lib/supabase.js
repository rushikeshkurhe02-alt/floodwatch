import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let runtimeUrl = null;
let runtimeKey = null;

try {
  runtimeUrl = sessionStorage.getItem('FLOODWATCH_SUPABASE_URL');
  runtimeKey = sessionStorage.getItem('FLOODWATCH_SUPABASE_KEY');
} catch (err) {
  // Ignore storage access errors
}

export const defaultUrl = (envUrl && envUrl.trim() !== '' && !envUrl.includes('your-project-id'))
  ? envUrl.trim()
  : '';

const activeUrl = defaultUrl || (runtimeUrl && runtimeUrl.trim() !== '' ? runtimeUrl.trim() : null);

const isPlaceholderKey = (key) => {
  if (!key) return true;
  const k = key.trim();
  return k === '' || k === 'PASTE_KEY_HERE' || k.includes('your-anon-public-key');
};

const activeKey = (envAnonKey && !isPlaceholderKey(envAnonKey))
  ? envAnonKey.trim()
  : (runtimeKey && !isPlaceholderKey(runtimeKey))
    ? runtimeKey.trim()
    : null;

export const isConfigured = Boolean(
  activeUrl &&
  activeKey &&
  (activeUrl.startsWith('https://') || activeUrl.startsWith('http://'))
);

export const supabase = isConfigured
  ? createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Allows interactive setup via browser UI if .env was not configured prior to startup
 */
export function setRuntimeCredentials(url, key) {
  try {
    sessionStorage.setItem('FLOODWATCH_SUPABASE_URL', url.trim());
    sessionStorage.setItem('FLOODWATCH_SUPABASE_KEY', key.trim());
    window.location.reload();
  } catch (e) {
    console.error('Failed to save runtime credentials to sessionStorage', e);
  }
}

export function clearRuntimeCredentials() {
  try {
    sessionStorage.removeItem('FLOODWATCH_SUPABASE_URL');
    sessionStorage.removeItem('FLOODWATCH_SUPABASE_KEY');
    window.location.reload();
  } catch (e) {
    console.error('Failed to clear runtime credentials', e);
  }
}
