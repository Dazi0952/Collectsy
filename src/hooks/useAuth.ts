// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ta funkcja uruchomi się raz, przy starcie aplikacji,
    // i sprawdzi, czy w pamięci urządzenia jest zapisana sesja.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Następnie ustawiamy "nasłuchiwanie" na zmiany stanu logowania.
    // Jeśli użytkownik się zaloguje lub wyloguje, ta funkcja zareaguje.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Na koniec, gdy komponent zniknie, "odpinamy" nasłuchiwanie,
    // aby uniknąć wycieków pamięci.
    return () => subscription.unsubscribe();
  }, []); // Pusta tablica [] oznacza, że efekt uruchomi się tylko raz.

  return { session, loading, user: session?.user };
}