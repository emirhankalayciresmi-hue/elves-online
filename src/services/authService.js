import { supabase } from '@/core/supabase/supabaseClient';

/**
 * Elves Online - Supabase Authentication Service
 * Google OAuth, Email/Password and Session Management
 */

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.warn('Google OAuth warning:', error.message);
      return { success: false, error: error.message };
    }

    if (data?.url) {
      // Supabase'de Google provider'ın aktif olup olmadığını kontrol et
      try {
        const checkRes = await fetch(data.url);
        if (checkRes.status === 400) {
          const body = await checkRes.json().catch(() => null);
          if (body?.msg?.includes('not enabled') || body?.error_code === 'validation_failed') {
            return {
              success: false,
              isProviderDisabled: true,
              error: 'Google sağlayıcısı Supabase panelinde henüz etkinleştirilmedi. (Unsupported provider: provider is not enabled)',
            };
          }
        }
      } catch (checkErr) {
        // CORS redirect hatası Google'a yönlendirme yapıldığını gösterir, yani sağlayıcı aktiftir
      }

      // Güvenli: Tarayıcıyı Google oturum açma sayfasına yönlendir
      window.location.href = data.url;
      return { success: true, data };
    }

    return { success: false, error: 'Google yetkilendirme bağlantısı oluşturulamadı.' };
  } catch (err) {
    console.error('Google OAuth exception:', err);
    return { success: false, error: err.message || 'Google ile giriş başarısız oldu.' };
  }
}

export async function checkGoogleProviderEnabled() {
  try {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://elves-online.vercel.app',
        skipBrowserRedirect: true,
      },
    });
    if (!data?.url) return false;
    const res = await fetch(data.url);
    if (res.status === 400) {
      const json = await res.json().catch(() => null);
      if (json?.msg?.includes('not enabled') || json?.error_code === 'validation_failed') {
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}


export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error('Sign out error:', err);
    return { success: false, error: err.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => {
    subscription?.unsubscribe();
  };
}
