"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  SponsorTransactionAction,
  type SponsorButtonState,
} from "../../client-components/SponsorButton";

// Mock FluidClient for demo purposes
const createMockClient = (
  behavior: "success" | "error" | "slow-success" | "slow-error"
) => {
  return {
    requestFeeBump: async (_xdr: string, _submit: boolean) => {
      // Simulate network delay
      const delay = behavior.startsWith("slow-") ? 3000 : 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (behavior === "error" || behavior === "slow-error") {
        throw new Error("Insufficient funds for fee sponsorship");
      }

      return {
        xdr: "AAAAAgAAAAA...",
        status: "submitted" as const,
        hash: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
        fee_payer: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG",
        submitted_via: "horizon-testnet",
        submission_attempts: 1,
      };
    },
  };
};

// Sample transaction XDR (mock)
const SAMPLE_TX_XDR =
  "AAAAAgAAAABi/B0L0JGythwN1lY0aypo19NHxvLCyO5tBEcCVvwF9wAAAGQAAMXvAAAABAAAAAEAAAAAAAAAAAAAAABmF8sAAAAAAAAAAQAAAAAAAAABAAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAAAAAAACYloAAAAAAAA==";

export default function SponsorButtonDemoPage() {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: "success" | "error" }>
  >([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const successClient = createMockClient("success");
  const errorClient = createMockClient("error");
  const slowSuccessClient = createMockClient("slow-success");
  const slowErrorClient = createMockClient("slow-error");

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
                fluid-client
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                SponsorTransactionAction Demo
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Interactive showcase of the sponsor button component
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-right ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Basic Examples */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Examples
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Default button states with success and error scenarios
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Success Flow
                </span>
                <SponsorTransactionAction
                  client={successClient as never}
                  transaction={SAMPLE_TX_XDR}
                  onSuccess={(res) =>
                    addLog(`Success! Hash: ${res.hash?.slice(0, 12)}...`)
                  }
                  onError={(err) => addLog(`Error: ${err.message}`)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Error Flow
                </span>
                <SponsorTransactionAction
                  client={errorClient as never}
                  transaction={SAMPLE_TX_XDR}
                  onSuccess={(res) =>
                    addLog(`Success! Hash: ${res.hash?.slice(0, 12)}...`)
                  }
                  onError={(err) => addLog(`Error: ${err.message}`)}
                />
              </div>
            </div>
          </section>

          {/* Custom Labels */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Custom Labels
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Customize the button text for each state
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                labels={{
                  idle: "Pay with Fluid",
                  loading: "Sponsoring...",
                  success: "Transaction Sent!",
                  error: "Try Again",
                }}
                onSuccess={(res) =>
                  addLog(`Custom labels success: ${res.hash?.slice(0, 12)}...`)
                }
                onError={(err) => addLog(`Custom labels error: ${err.message}`)}
              />

              <SponsorTransactionAction
                client={slowSuccessClient as never}
                transaction={SAMPLE_TX_XDR}
                labels={{
                  idle: "Submit Payment",
                  loading: "Please wait...",
                  success: "Done!",
                  error: "Oops!",
                }}
                onSuccess={(res) =>
                  addLog(`Slow success: ${res.hash?.slice(0, 12)}...`)
                }
                onError={(err) => addLog(`Slow error: ${err.message}`)}
              />
            </div>
          </section>

          {/* Custom Styling */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Custom Styling
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Override styles with Tailwind classes
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                className="rounded-full px-8"
                labels={{ idle: "Rounded Style" }}
                onSuccess={(res) =>
                  addLog(`Rounded: ${res.hash?.slice(0, 12)}...`)
                }
              />

              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                classNames={{
                  idle: "bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:from-violet-700 hover:to-purple-600 shadow-lg",
                  loading:
                    "bg-gradient-to-r from-violet-600 to-purple-500 text-white cursor-wait",
                  success:
                    "bg-gradient-to-r from-green-500 to-emerald-400 text-white",
                  error: "bg-gradient-to-r from-red-600 to-rose-500 text-white",
                }}
                labels={{ idle: "Purple Theme" }}
                onSuccess={(res) =>
                  addLog(`Purple: ${res.hash?.slice(0, 12)}...`)
                }
              />

              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                classNames={{
                  idle: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg",
                  loading: "bg-slate-900 text-white cursor-wait",
                  success: "bg-slate-900 text-emerald-400",
                  error: "bg-slate-900 text-rose-400",
                }}
                labels={{ idle: "Dark Mode" }}
                onSuccess={(res) => addLog(`Dark: ${res.hash?.slice(0, 12)}...`)}
              />
            </div>
          </section>

          {/* Toast Mode */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Toast Mode</h2>
            <p className="mt-1 text-sm text-slate-500">
              External feedback via toast notifications
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                feedbackMode="toast"
                onToast={showToast}
                labels={{ idle: "With Toast (Success)" }}
                onSuccess={(res) =>
                  addLog(`Toast success: ${res.hash?.slice(0, 12)}...`)
                }
              />

              <SponsorTransactionAction
                client={errorClient as never}
                transaction={SAMPLE_TX_XDR}
                feedbackMode="toast"
                onToast={showToast}
                labels={{ idle: "With Toast (Error)" }}
                onError={(err) => addLog(`Toast error: ${err.message}`)}
              />
            </div>
          </section>

          {/* Disabled State */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Disabled State
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Button can be disabled when conditions aren&apos;t met
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                disabled
                labels={{ idle: "Disabled Button" }}
              />

              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                disabled
                className="opacity-30"
                labels={{ idle: "Extra Faded" }}
              />
            </div>
          </section>

          {/* Reset Delay */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Reset Delay</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure how long success/error states persist
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                resetDelay={1000}
                labels={{ idle: "1s Reset" }}
                onSuccess={(res) =>
                  addLog(`Fast reset: ${res.hash?.slice(0, 12)}...`)
                }
              />

              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                resetDelay={5000}
                labels={{ idle: "5s Reset" }}
                onSuccess={(res) =>
                  addLog(`Slow reset: ${res.hash?.slice(0, 12)}...`)
                }
              />

              <SponsorTransactionAction
                client={successClient as never}
                transaction={SAMPLE_TX_XDR}
                resetDelay={0}
                labels={{ idle: "No Reset" }}
                onSuccess={(res) =>
                  addLog(`No reset: ${res.hash?.slice(0, 12)}...`)
                }
              />
            </div>
          </section>

          {/* State Preview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              All States Preview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Visual reference for each button state
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <StatePreviewCard state="idle" label="Idle State" />
              <StatePreviewCard state="loading" label="Loading State" />
              <StatePreviewCard state="success" label="Success State" />
              <StatePreviewCard state="error" label="Error State" />
            </div>
          </section>

          {/* Event Log */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Event Log
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track onSuccess and onError callbacks
                </p>
              </div>
              <button
                onClick={() => setLogs([])}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-4 h-48 overflow-y-auto rounded-lg bg-slate-900 p-4 font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-slate-500">
                  Click buttons above to see events...
                </p>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes("Error")
                        ? "text-rose-400"
                        : log.includes("Success") || log.includes("Hash")
                          ? "text-emerald-400"
                          : "text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Code Example */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Usage Example</h2>
          <p className="mt-1 text-sm text-slate-500">
            How to use SponsorTransactionAction in your application
          </p>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
            <code>{`import { SponsorTransactionAction } from "fluid-client";
import { FluidClient } from "fluid-client";

// Initialize client
const client = new FluidClient({
  serverUrl: "https://api.usefluid.xyz",
  networkPassphrase: "Test SDF Network ; September 2015",
});

// In your component
<SponsorTransactionAction
  client={client}
  transaction={signedTxXdr}
  submit={true}
  onSuccess={(response) => {
    console.log("Sponsored!", response.hash);
  }}
  onError={(error) => {
    console.error("Failed:", error.message);
  }}
  labels={{
    idle: "Send Payment",
    loading: "Processing...",
    success: "Sent!",
    error: "Failed",
  }}
/>`}</code>
          </pre>
        </section>
      </main>
    </div>
  );
}

// Helper component for state preview
function StatePreviewCard({
  state,
  label,
}: {
  state: SponsorButtonState;
  label: string;
}) {
  const stateStyles: Record<SponsorButtonState, string> = {
    idle: "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg",
    loading:
      "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg cursor-wait",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg",
    error: "bg-gradient-to-r from-rose-500 to-red-400 text-white shadow-lg",
  };

  const stateLabels: Record<SponsorButtonState, string> = {
    idle: "Sponsor Transaction",
    loading: "Processing...",
    success: "Sponsored!",
    error: "Failed",
  };

  const stateIcons: Record<SponsorButtonState, React.ReactNode> = {
    idle: null,
    loading: (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ),
    success: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${stateStyles[state]}`}
      >
        {stateIcons[state]}
        <span>{stateLabels[state]}</span>
      </div>
    </div>
  );
}
