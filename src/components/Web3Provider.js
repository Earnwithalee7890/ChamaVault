"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { connectorsForWallets, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { celoAlfajores, celoMainnet } from "@/config/contracts";
import { createContext, useContext, useState } from "react";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, injectedWallet],
    },
  ],
  {
    appName: "ChamaVault",
    projectId: "87106bd465234d097b8a51ba585bf799",
  }
);

const config = createConfig({
  connectors,
  chains: [celoAlfajores, celoMainnet],
  transports: {
    [celoAlfajores.id]: http(),
    [celoMainnet.id]: http(),
  },
  ssr: false,
});

const queryClient = new QueryClient();

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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#34d399" })}>
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
