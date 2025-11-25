import React, { createContext, useContext, useState } from "react";
import { UserInfo } from "./REST-API/api";

export type AuthUser = UserInfo & {
  token: string;
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
