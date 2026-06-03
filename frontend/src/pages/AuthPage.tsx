import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppBackground } from "@/components/layout/AppBackground";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";

type AuthMode = "login" | "register";

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const loginAsDemo = useAuthStore((state) => state.loginAsDemo);
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState("demo@jobhunter.local");
  const [name, setName] = useState("JobHunter User");
  const [password, setPassword] = useState("demo123");

  const fromLocation = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const from = fromLocation?.pathname ? `${fromLocation.pathname}${fromLocation.search ?? ""}` : "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const submit = () => {
    const ok = mode === "login" ? login(email, password) : register(name, email, password);
    if (ok) {
      navigate(from, { replace: true });
    }
  };

  const enterDemo = () => {
    loginAsDemo();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <AppBackground />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <Card surface="hero" className="grid w-full max-w-5xl gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <section className="flex flex-col justify-between rounded-[1.75rem] border border-cyanGlow/20 bg-cyanGlow/10 p-6">
            <div>
              <div className="text-sm text-cyanGlow">JobHunter</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                AI 求职作战中枢
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                登录后进入首页驾驶舱，切换求职身份，查看机会热度、岗位推荐和求职管线。
              </p>
            </div>
            <div className="mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <Card surface="subtle" className="p-4">演示账号一键进入</Card>
              <Card surface="subtle" className="p-4">Mock 数据稳定可讲</Card>
              <Card surface="subtle" className="p-4">刷新保持登录态</Card>
            </div>
          </section>

          <section className="p-1">
            <div className="mb-6">
              <div className="text-sm text-slate-400">{mode === "login" ? "登录" : "注册"}</div>
              <h2 className="mt-2 text-3xl font-semibold">
                {mode === "login" ? "进入求职驾驶舱" : "创建 JobHunter 账号"}
              </h2>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              {mode === "register" ? (
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="昵称" />
              ) : null}
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" />
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="密码，至少 6 位"
                type="password"
              />
              {error ? <div className="text-sm text-risk-high">{error}</div> : null}
              <Button className="w-full" size="lg" type="submit">
                {mode === "login" ? "登录" : "注册并进入"}
              </Button>
              <Button className="w-full" size="lg" variant="secondary" type="button" onClick={enterDemo}>
                演示账号一键进入
              </Button>
            </form>
            <div className="mt-6 text-sm text-slate-400">
              {mode === "login" ? (
                <>
                  还没有账号？
                  <Link className="ml-1 text-cyanGlow" to="/register">
                    去注册
                  </Link>
                </>
              ) : (
                <>
                  已有账号？
                  <Link className="ml-1 text-cyanGlow" to="/login">
                    去登录
                  </Link>
                </>
              )}
            </div>
          </section>
        </Card>
      </main>
    </div>
  );
}
