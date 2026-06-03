import type { ErrorInfo, PropsWithChildren } from "react";
import { Component } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ErrorBoundaryState {
  errorMessage: string;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    return { errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.errorMessage) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-ink-950 p-6 text-slate-100">
        <Card surface="hero" className="mx-auto mt-16 max-w-2xl p-8">
          <div className="text-sm text-risk-high">页面异常</div>
          <h1 className="mt-3 text-3xl font-semibold">当前页面出现错误，但应用没有白屏。</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {this.state.errorMessage || "未知错误"}。可以返回首页或刷新页面恢复。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => window.location.assign("/")}>返回首页</Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}
