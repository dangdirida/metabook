"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-accent-orange mb-3" />
            <p className="text-mono-700 font-medium mb-1">문제가 발생했어요</p>
            <p className="text-sm text-mono-500 mb-4">
              잠시 후 다시 시도해주세요
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
            >
              <RotateCcw className="w-4 h-4" /> 다시 시도
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
