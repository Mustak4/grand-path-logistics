import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "dispecer" | "vozac" | null;

interface Profile {
  id: string;
  ime: string | null;
  telefon: string | null;
  uloga: AppRole;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDriver: boolean;
  isDispatcher: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Defer fetching profile to avoid deadlocks
      if (newSession?.user) {
        setTimeout(async () => {
          const { data } = await supabase
            .from("profiles")
            .select("id, ime, telefon, uloga")
            .eq("id", newSession.user!.id)
            .maybeSingle();
          setProfile(data as Profile | null);
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, ime, telefon, uloga")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data as Profile | null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,
    isDriver: profile?.uloga === "vozac",
    isDispatcher: profile?.uloga === "dispecer",
    signOut: async () => { await supabase.auth.signOut(); },
  }), [user, session, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
