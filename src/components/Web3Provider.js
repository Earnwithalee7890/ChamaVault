"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { celoAlfajores, celoMainnet } from "@/config/contracts";
import { http } from "wagmi";
import { createContext, useContext, useState } from "react";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [celoMainnet, celoAlfajores],
  transports: {
    [celoMainnet.id]: http(),
    [celoAlfajores.id]: http(),
  },
});

// App-level context for toast notifications
const ToastContext = createContext(null);
export function useToast() {
  return useContext(ToastContext);
}

export function Web3Provider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  };

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmp076nja00sd0cjla9bhb1zq"}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#34d399",
        },
        defaultChain: celoMainnet,
        supportedChains: [celoMainnet, celoAlfajores],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ToastContext.Provider value={addToast}>
            {children}
            {/* Toast container */}
            <div
              style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {toasts.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 12,
                    background:
                      t.type === "success"
                        ? "rgba(52,211,153,0.15)"
                        : t.type === "error"
                        ? "rgba(251,113,133,0.15)"
                        : "rgba(255,255,255,0.08)",
                    border: `1px solid ${
                      t.type === "success"
                        ? "rgba(52,211,153,0.3)"
                        : t.type === "error"
                        ? "rgba(251,113,133,0.3)"
                        : "rgba(255,255,255,0.15)"
                    }`,
                    backdropFilter: "blur(20px)",
                    color: "#f0f4ff",
                    fontSize: 14,
                    fontWeight: 500,
                    maxWidth: 360,
                    animation: "fadeInUp 0.3s ease",
                  }}
                >
                  {t.type === "success" && "✅ "}
                  {t.type === "error" && "❌ "}
                  {t.type === "info" && "ℹ️ "}
                  {t.msg}
                </div>
              ))}
            </div>
          </ToastContext.Provider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
