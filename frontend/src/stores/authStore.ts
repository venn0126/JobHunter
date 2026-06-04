import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storageKeys } from "@/lib/storageKeys";
import type { AuthSession, AuthUser } from "@/types/auth";

const demoUser: Readonly<AuthUser> = {
  id: "demo_user",
  name: "Demo User",
  email: "demo@jobhunter.local",
  avatarText: "DU",
  isDemo: true,
};

interface AuthState {
  error: string;
  session: AuthSession | null;
  isAuthenticated: boolean;
  expireSessionForValidation: () => void;
  login: (email: string, password: string) => boolean;
  loginAsDemo: () => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
  resetDemoSession: () => void;
  updateProfile: (profile: { email?: string; name: string }) => void;
}

function createSession(user: AuthUser): AuthSession {
  return {
    accessToken: `mock-token-${user.id}`,
    user: { ...user },
  };
}

function createDemoAuthState() {
  return {
    error: "",
    isAuthenticated: true,
    session: createSession({ ...demoUser }),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      error: "",
      session: null,
      isAuthenticated: false,
      expireSessionForValidation: () => {
        set({
          error: "登录已过期，请重新进入演示账号。",
          isAuthenticated: false,
          session: null,
        });
      },
      login: (email, password) => {
        if (!email.includes("@") || password.length < 6) {
          set({ error: "请输入有效邮箱和至少 6 位密码" });
          return false;
        }

        const name = email.split("@")[0] || "JobHunter User";
        set({
          error: "",
          isAuthenticated: true,
          session: createSession({
            id: `user_${Date.now()}`,
            name,
            email,
            avatarText: name.slice(0, 2).toUpperCase(),
            isDemo: false,
          }),
        });
        return true;
      },
      loginAsDemo: () => {
        set(createDemoAuthState());
      },
      logout: () => {
        set({ error: "", isAuthenticated: false, session: null });
      },
      register: (name, email, password) => {
        if (!name.trim()) {
          set({ error: "请输入昵称" });
          return false;
        }
        if (!email.includes("@") || password.length < 6) {
          set({ error: "请输入有效邮箱和至少 6 位密码" });
          return false;
        }

        set({
          error: "",
          isAuthenticated: true,
          session: createSession({
            id: `user_${Date.now()}`,
            name: name.trim(),
            email,
            avatarText: name.trim().slice(0, 2).toUpperCase(),
            isDemo: false,
          }),
        });
        return true;
      },
      resetDemoSession: () => {
        set(createDemoAuthState());
      },
      updateProfile: ({ email, name }) => {
        const normalizedName = name.trim();
        if (!normalizedName) {
          set({ error: "请输入昵称" });
          return;
        }

        set((state) => {
          if (!state.session) {
            return state;
          }

          const normalizedEmail = email?.trim() || state.session.user.email;
          return {
            error: "",
            session: {
              ...state.session,
              user: {
                ...state.session.user,
                avatarText: normalizedName.slice(0, 2).toUpperCase(),
                email: normalizedEmail,
                name: normalizedName,
              },
            },
          };
        });
      },
    }),
    {
      name: storageKeys.auth,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        session: state.session,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
