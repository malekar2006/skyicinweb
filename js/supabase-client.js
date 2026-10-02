/* Sky Icon Supabase client foundation.
 * The public anon key is intended for browser use and is constrained by RLS.
 * Never place SUPABASE_SERVICE_ROLE_KEY in this file or any client bundle.
 */
(function (global) {
  'use strict';

  const config = global.SKYICON_CONFIG || {};
  const url = config.supabaseUrl || global.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = config.supabaseAnonKey || global.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  function getConfig() {
    return { url, anonKey, configured: Boolean(url && anonKey) };
  }

  function assertConfigured() {
    if (!url || !anonKey) {
      throw new Error('Supabase غير مهيأ: أضف SKYICON_CONFIG.supabaseUrl وSKYICON_CONFIG.supabaseAnonKey قبل الاستخدام.');
    }
  }

  async function request(path, options) {
    assertConfigured();
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        ...(options && options.headers)
      }
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Supabase request failed (${response.status}): ${detail}`);
    }
    return response.status === 204 ? null : response.json();
  }

  global.SkyIconSupabase = Object.freeze({ getConfig, request });
})(window);
