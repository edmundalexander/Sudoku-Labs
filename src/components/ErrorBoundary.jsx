const { Component } = React;

let __errorCodeCounter = 0;
const makeErrorCode = () => {
  const ts = Date.now().toString(36);
  const seq = (__errorCodeCounter++ % 4096).toString(16).padStart(3, "0");
  return `E-${ts}-${seq}`;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, code: null, stack: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, code: makeErrorCode() };
  }

  componentDidCatch(error, errorInfo) {
    const stack = errorInfo?.componentStack || error?.stack || null;
    this.setState({ stack });
    console.error("React Error Boundary caught:", error, errorInfo);
    if (typeof logError === "function") {
      const meta = {
        code: this.state.code,
        message: error?.message,
        stack,
        url: window.location?.href,
        userAgent: navigator?.userAgent,
        appVersion: window?.APP_VERSION,
      };
      logError(`React Error Boundary [${this.state.code}]`, {
        ...error,
        meta,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      const { code, error, stack } = this.state;

      const copyReport = async () => {
        const payload = {
          code,
          message: error?.message,
          stack,
          url: window.location?.href,
          userAgent: navigator?.userAgent,
          appVersion: window?.APP_VERSION,
        };
        try {
          await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
          alert("Error report copied to clipboard.");
        } catch (e) {
          console.warn("Clipboard copy failed", e);
        }
      };

      const renderStack = () => {
        if (!stack) return null;
        const lines = stack.split("\n").slice(0, 6);
        return (
          <pre className="text-[11px] leading-snug bg-gray-900/80 text-white rounded px-3 py-2 overflow-auto max-h-36 whitespace-pre-wrap mt-2">
            {lines.join("\n")}
          </pre>
        );
      };
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md text-center space-y-3">
            <div className="text-4xl mb-1">😕</div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Something went wrong
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 inline-block mb-2">
                Code: {code || "N/A"}
              </div>
              <div className="text-left bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
                <div className="font-semibold text-gray-700 dark:text-gray-200 text-xs mb-1">
                  Details
                </div>
                <div className="text-xs break-words text-gray-700 dark:text-gray-200">
                  {error?.message || "Unexpected error"}
                </div>
                {renderStack()}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Share the code with support to cross-reference the issue.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={copyReport}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-semibold"
              >
                Copy error report
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Game
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

window.ErrorBoundary = ErrorBoundary;
