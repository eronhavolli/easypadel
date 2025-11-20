import React, { createContext, useContext, useState } from "react";

export type AuthUser = { userId: string; username: string; role: "user" | "admin" };

const AuthCtx = createContext<{ user: AuthUser | null; setUser: (u: AuthUser | null) => void; }>({
  user: null, setUser: () => {}
});

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  return <AuthCtx.Provider value={{ user, setUser }}>{children}</AuthCtx.Provider>;
};
