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
            <div className="toast-container">
              {toasts.map((t) => (
                <div key={t.id} className={`toast-item ${t.type}`}>
                  <div className="toast-icon">
                    {t.type === "success" && "✨"}
                    {t.type === "error" && "⚠️"}
                    {t.type === "info" && "ℹ️"}
                  </div>
                  <div className="toast-content">
                    <div className="toast-message">{t.msg}</div>
                  </div>
                  <div className="toast-progress"></div>
                </div>
              ))}
            </div>

            <style jsx>{`
              .toast-container {
                position: fixed;
                bottom: 32px;
                right: 32px;
                zIndex: 10000;
                display: flex;
                flex-direction: column;
                gap: 16px;
                pointer-events: none;
              }
              .toast-item {
                pointer-events: auto;
                min-width: 320px;
                max-width: 420px;
                background: rgba(17, 24, 39, 0.85);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border-glass);
                padding: 16px 20px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
                animation: toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .toast-icon {
                font-size: 20px;
                width: 36px;
                height: 36px;
                border-radius: 10px;
                background: rgba(255,255,255,0.05);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .success { border-color: rgba(52, 211, 153, 0.3); }
              .success .toast-icon { background: rgba(52, 211, 153, 0.1); }
              .error { border-color: rgba(251, 113, 133, 0.3); }
              .error .toast-icon { background: rgba(251, 113, 133, 0.1); }
              
              .toast-content { flex: 1; }
              .toast-message { font-size: 14px; color: var(--text-primary); font-weight: 500; }
              
              .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--gradient-primary);
                width: 100%;
                animation: progress 5s linear forwards;
                opacity: 0.6;
              }
              .error .toast-progress { background: var(--accent-rose); }
              
              @keyframes toastIn {
                from { opacity: 0; transform: translateX(50px) scale(0.9); }
                to { opacity: 1; transform: translateX(0) scale(1); }
              }
              @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
          </ToastContext.Provider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
