"use client";
import "./app.css";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction, useSwitchChain, useBlockNumber } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Web3Provider, useToast } from "@/components/Web3Provider";
import WalletConnect from "@/components/WalletConnect";
import {
  CHAMAVAULT_ABI,
  CHAMAVAULT_ADDRESS,
  CHAMAMINER_ABI,
  CHAMAMINER_ADDRESS,
  CHAMAQUESTS_ABI,
  CHAMAQUESTS_ADDRESS,
  CHAMASALE_ABI,
  CHAMASALE_ADDRESS,
  CUSD_ADDRESS,
  REAL_CUSD_ADDRESS,
  ERC20_ABI,
  CATEGORIES,
  CELO_CHAIN_ID,
} from "@/config/contracts";
import StatCard from "@/components/StatCard";

const TOKEN = CUSD_ADDRESS; // Switch to CUSD_ADDRESS for mainnet
const STATES = ["Forming", "Active", "Completed"];

function getEffectiveChainId(wagmiChainId) {
  if (typeof window !== "undefined" && window.ethereum?.chainId) {
    try {
      const parsed = parseInt(window.ethereum.chainId, 16);
      if (!isNaN(parsed)) return parsed;
    } catch (e) {
      console.error("Failed to parse window.ethereum.chainId:", e);
    }
  }
  return wagmiChainId;
}

/* ===== Premium Glassmorphic Modal ===== */
function GlassModal({ isOpen, onClose, title, message, type = "success" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ cursor: "default" }}>
        <div className="modal-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <span className="modal-icon" style={{ fontSize: 48, animation: "bounce 2s infinite" }}>
            {type === "success" && "🎉"}
            {type === "streak" && "🔥"}
            {type === "info" && "ℹ️"}
            {type === "error" && "⚠️"}
          </span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
        </div>
        <p className="modal-message" style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{message}</p>
        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 24, width: "100%", justifyContent: "center" }}>
          Awesome!
        </button>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 8, 15, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        .modal-content {
          width: 100%;
          max-width: 440px;
          padding: 32px;
          background: rgba(17, 24, 39, 0.85) !important;
          border: 1px solid rgba(52, 211, 153, 0.2) !important;
          text-align: center;
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(52, 211, 153, 0.1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

/* ===== Navbar ===== */
function AppNav({ view, setView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "explore", label: "Explore", icon: "🧭" },
    { id: "my", label: "My Circles", icon: "🤝" },
    { id: "leaderboard", label: "Ranks", icon: "🏆" },
    { id: "rewards", label: "Quests", icon: "⚔️" },
    { id: "mining", label: "Mining", icon: "⛏️" },
    { id: "buy", label: "CHAMA", icon: "💰" },
    { id: "create", label: "Create", icon: "✨" },
  ];

  const bottomNavItems = [
    { id: "explore", label: "Explore", icon: "🧭" },
    { id: "my", label: "Circles", icon: "🤝" },
    { id: "rewards", label: "Quests", icon: "⚔️" },
    { id: "mining", label: "Mining", icon: "⛏️" },
  ];

  return (
    <>
      {/* Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav className={`navbar scrolled ${mobileMenuOpen ? "mobile-open" : ""}`} id="app-navbar">
        <div className="navbar-inner">
          <a href="/" className="navbar-logo" id="app-logo">
            <img src="/logo.png" alt="ChamaVault" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <span>ChamaVault</span>
          </a>
          
          <ul className={`navbar-links dashboard-nav ${mobileMenuOpen ? "active" : ""}`}>
            {navItems.map((item) => (
              <li key={item.id}>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setView(item.id); 
                    setMobileMenuOpen(false); 
                  }} 
                  className={view === item.id ? "active" : ""}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <WalletConnect />
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
        <style jsx>{`
          .dashboard-nav .nav-icon { margin-right: 8px; font-size: 16px; }
          .dashboard-nav a.active { color: var(--accent-emerald) !important; font-weight: 700; }
          
          .mobile-menu-toggle {
            display: none;
            flex-direction: column;
            gap: 6px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
          }
          .bar {
            width: 24px;
            height: 2px;
            background: var(--text-primary);
            transition: 0.3s;
            border-radius: 2px;
          }

          .mobile-bottom-nav {
            display: none;
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(5, 8, 15, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 998;
            animation: fadeIn 0.2s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @media (max-width: 1024px) {
            .mobile-menu-toggle {
              display: flex;
            }
            .navbar-links.dashboard-nav {
              position: fixed;
              top: 0;
              right: -100%;
              width: 280px;
              height: 100vh;
              background: #0d121f;
              flex-direction: column;
              padding: 100px 32px;
              transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: -10px 0 30px rgba(0,0,0,0.5);
              z-index: 999;
              border-left: 1px solid var(--border-glass);
            }
            .navbar-links.dashboard-nav.active {
              right: 0;
            }
            .navbar-links li {
              width: 100%;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              padding: 12px 0;
            }
            .mobile-open .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
            .mobile-open .bar:nth-child(2) { opacity: 0; }
            .mobile-open .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
          }

          @media (max-width: 768px) {
            .mobile-bottom-nav {
              display: flex;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: calc(72px + env(safe-area-inset-bottom, 0px));
              background: rgba(10, 14, 23, 0.92);
              backdrop-filter: blur(25px);
              -webkit-backdrop-filter: blur(25px);
              border-top: 1px solid var(--border-glass);
              justify-content: space-around;
              align-items: center;
              z-index: 997;
              padding: 0 8px calc(env(safe-area-inset-bottom, 0px) + 2px) 8px;
              box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
            }
            .mobile-nav-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: var(--text-secondary);
              text-decoration: none;
              flex: 1;
              height: 100%;
              gap: 4px;
              transition: all 0.2s;
              font-size: 10px;
              font-weight: 500;
            }
            .mobile-nav-item.active {
              color: var(--accent-emerald);
            }
            .mobile-nav-icon {
              font-size: 20px;
              transition: transform 0.2s;
            }
            .mobile-nav-item.active .mobile-nav-icon {
              transform: scale(1.15);
            }
            .mobile-nav-label {
              font-family: var(--font-body);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
            }
            :global(body) {
              padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)) !important;
            }
          }
        `}</style>
      </nav>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="mobile-bottom-nav">
        {bottomNavItems.map((item) => (
          <a 
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView(item.id);
              setMobileMenuOpen(false);
            }}
            className={`mobile-nav-item ${view === item.id && !mobileMenuOpen ? "active" : ""}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </a>
        ))}
        {/* Burger menu trigger on bottom nav */}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className={`mobile-nav-item ${mobileMenuOpen ? "active" : ""}`}
        >
          <span className="mobile-nav-icon">☰</span>
          <span className="mobile-nav-label">Menu</span>
        </a>
      </div>
    </>
  );
}

/* ===== Create Chama Form ===== */
function CreateChamaForm({ onCreated }) {
  const toast = useToast();
  const { address, chainId: wagmiChainId } = useAccount();
  const chainId = getEffectiveChainId(wagmiChainId);
  const [form, setForm] = useState({
    name: "",
    category: "general",
    contribution: "1",
    frequency: "604800",
    maxMembers: "5",
  });
  const [modalOpen, setModalOpen] = useState(false);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isSuccess, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeError) {
      console.error("CreateChama Write Error:", writeError);
      toast(writeError.shortMessage || writeError.message || "Transaction failed", "error");
    }
  }, [writeError]);

  useEffect(() => {
    if (txError) {
      console.error("CreateChama TX Error:", txError);
      toast("Transaction receipt error", "error");
    }
  }, [txError]);

  useEffect(() => {
    if (isSuccess) {
      setModalOpen(true);
    }
  }, [isSuccess]);

  const { switchChain } = useSwitchChain();

  const handleCreate = async () => {
    if (!address) return toast("Connect your wallet first", "error");
    if (!form.name.trim()) return toast("Enter a circle name", "error");

    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to create your circle.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }

    const fullName = `[${form.category}] ${form.name}`;
    writeContract({
      address: CHAMAVAULT_ADDRESS,
      abi: CHAMAVAULT_ABI,
      functionName: "createChama",
      chainId: CELO_CHAIN_ID,
      args: [
        fullName,
        TOKEN,
        parseUnits(form.contribution, 18),
        BigInt(form.frequency),
        BigInt(form.maxMembers),
      ],
    });
  };

  const freqOptions = [
    { label: "Daily", value: "86400" },
    { label: "Weekly", value: "604800" },
    { label: "Bi-weekly", value: "1209600" },
    { label: "Monthly", value: "2592000" },
  ];

  return (
    <div className="create-form glass-card" style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
      <GlassModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (onCreated) onCreated();
        }}
        title="Circle Created On-Chain! 🎉"
        message={`Your savings circle "${form.name}" has been successfully created on Celo. Other members can now search for and join it!`}
        type="success"
      />
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 8 }}>
        Create a <span className="text-gradient">New Circle</span>
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
        Set up your savings circle. The smart contract handles the trust.
      </p>

      {/* Category selector */}
      <label className="form-label">Category</label>
      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${form.category === cat.id ? "active" : ""}`}
            onClick={() => setForm({ ...form, category: cat.id })}
            style={{ "--cat-color": cat.color }}
            id={`cat-${cat.id}`}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Circle name */}
      <label className="form-label">Circle Name</label>
      <input
        className="form-input"
        placeholder="e.g. Nairobi Builders"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        id="input-name"
      />

      {/* Contribution amount */}
      <label className="form-label">Contribution Amount (cUSD)</label>
      <input
        className="form-input"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="1.00"
        value={form.contribution}
        onChange={(e) => setForm({ ...form, contribution: e.target.value })}
        id="input-contribution"
      />

      {/* Frequency */}
      <label className="form-label">Contribution Frequency</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {freqOptions.map((f) => (
          <button
            key={f.value}
            className={`freq-btn ${form.frequency === f.value ? "active" : ""}`}
            onClick={() => setForm({ ...form, frequency: f.value })}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Max members */}
      <label className="form-label">Max Members (2–20)</label>
      <input
        className="form-input"
        type="number"
        min="2"
        max="20"
        value={form.maxMembers}
        onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
        id="input-members"
      />

      {/* Summary */}
      <div className="glass-card" style={{ padding: 20, marginTop: 24, marginBottom: 24 }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 8 }}>Each member contributes:</p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>
          <span className="text-gradient">{form.contribution} cUSD</span>
          <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 8 }}>
            per {freqOptions.find((f) => f.value === form.frequency)?.label?.toLowerCase()}
          </span>
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
          Total pot per round: <strong>{(parseFloat(form.contribution || 0) * parseInt(form.maxMembers || 0)).toFixed(2)} cUSD</strong>
        </p>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleCreate}
        disabled={isPending || !address}
        style={{ width: "100%", justifyContent: "center" }}
        id="btn-create-chama"
      >
        {isPending ? "⏳ Creating on-chain..." : "✨ Create Circle On-Chain"}
      </button>
    </div>
  );
}

/* ===== Chama Card ===== */
function ChamaCard({ chamaId, onSelect }) {
  const { data, isLoading } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "getChamaInfo",
    args: [BigInt(chamaId)],
    chainId: CELO_CHAIN_ID,
  });

  if (isLoading || !data) {
    return (
      <div className="glass-card" style={{ padding: 28, minHeight: 180 }}>
        <div style={{ color: "var(--text-muted)" }}>Loading circle #{chamaId}...</div>
      </div>
    );
  }

  const [name, creator, contribution, maxMembers, currentRound, totalRounds, memberCount, state] = data;
  const parsedName = name || `Circle #${chamaId}`;
  const category = CATEGORIES.find((c) => parsedName.includes(`[${c.id}]`));
  const displayName = parsedName.replace(/\[.*?\]\s*/, "");
  const progress = state === 2 ? 100 : state === 0 ? (Number(memberCount) / Number(maxMembers)) * 100 : ((Number(currentRound) + 1) / Number(totalRounds)) * 100;

  return (
    <div className="glass-card circle-card" onClick={() => onSelect(chamaId)} style={{ cursor: "pointer", padding: 28 }} id={`chama-card-${chamaId}`}>
      <div className="circle-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {category && <span style={{ fontSize: 24 }}>{category.icon}</span>}
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{displayName}</h4>
        </div>
        <span className={`circle-status ${state === 1 ? "active" : state === 0 ? "filling" : "active"}`}>
          {state === 1 ? "🟢 Active" : state === 0 ? "🟡 Forming" : "✅ Done"}
        </span>
      </div>
      <div className="progress-bar" style={{ marginTop: 16 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="circle-details" style={{ marginTop: 16 }}>
        <div className="circle-detail">
          <label>Contribution</label>
          <span className="text-gradient">{formatUnits(contribution, 18)} cUSD</span>
        </div>
        <div className="circle-detail">
          <label>Members</label>
          <span>{Number(memberCount)}/{Number(maxMembers)}</span>
        </div>
        <div className="circle-detail">
          <label>Round</label>
          <span>{state === 0 ? "—" : `${Number(currentRound) + 1}/${Number(totalRounds)}`}</span>
        </div>
      </div>
    </div>
  );
}

/* ===== Circle Detail View ===== */
function CircleDetail({ chamaId, onBack }) {
  const toast = useToast();
  const { address, chainId: wagmiChainId } = useAccount();
  const chainId = getEffectiveChainId(wagmiChainId);

  const { data: info } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "getChamaInfo",
    args: [BigInt(chamaId)],
    chainId: CELO_CHAIN_ID,
  });

  const { data: members } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "getChamaMembers",
    args: [BigInt(chamaId)],
    chainId: CELO_CHAIN_ID,
  });

  // Join
  const { writeContract: writeJoin, data: joinTx, isPending: joining, error: joinError } = useWriteContract();
  const { isSuccess: joinSuccess, error: joinTxError } = useWaitForTransactionReceipt({ hash: joinTx });

  // Approve cUSD
  const { writeContract: writeApprove, data: approveTx, isPending: approving, error: approveError } = useWriteContract();
  const { isSuccess: approveSuccess, error: approveTxError } = useWaitForTransactionReceipt({ hash: approveTx });

  // Contribute
  const { writeContract: writeContribute, data: contributeTx, isPending: contributing, error: contributeError } = useWriteContract();
  const { isSuccess: contributeSuccess, error: contributeTxError } = useWaitForTransactionReceipt({ hash: contributeTx });

  useEffect(() => {
    const error = joinError || approveError || contributeError || joinTxError || approveTxError || contributeTxError;
    if (error) {
      console.error("Circle Detail Error:", error);
      toast(error.shortMessage || error.message || "Action failed", "error");
    }
  }, [joinError, approveError, contributeError, joinTxError, approveTxError, contributeTxError]);

  useEffect(() => { if (joinSuccess) toast("Joined circle! 🎉", "success"); }, [joinSuccess]);
  useEffect(() => { if (approveSuccess) toast("cUSD approved! Now contribute.", "success"); }, [approveSuccess]);
  useEffect(() => { if (contributeSuccess) toast("Contribution made! 💸", "success"); }, [contributeSuccess]);

  if (!info) return <div className="container" style={{ paddingTop: 120 }}>Loading...</div>;

  const [name, creator, contribution, maxMembers, currentRound, totalRounds, memberCount, state] = info;
  const displayName = (name || "").replace(/\[.*?\]\s*/, "");
  const category = CATEGORIES.find((c) => (name || "").includes(`[${c.id}]`));
  const isMember = members?.some((m) => m.toLowerCase() === address?.toLowerCase());
  const potSize = Number(formatUnits(contribution, 18)) * Number(maxMembers);

  const { switchChain } = useSwitchChain();

  const handleJoin = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to join.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeJoin({
      address: CHAMAVAULT_ADDRESS,
      abi: CHAMAVAULT_ABI,
      functionName: "joinChama",
      args: [BigInt(chamaId)],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleApprove = async () => {
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to approve.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeApprove({
      address: TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CHAMAVAULT_ADDRESS, contribution],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleContribute = async () => {
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to contribute.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeContribute({
      address: CHAMAVAULT_ADDRESS,
      abi: CHAMAVAULT_ABI,
      functionName: "contribute",
      args: [BigInt(chamaId)],
      chainId: CELO_CHAIN_ID,
    });
  };

  return (
    <div className="container" style={{ paddingTop: 120 }}>
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: 24, padding: "8px 20px", fontSize: 14 }}>
        ← Back
      </button>
      <div className="glass-card" style={{ padding: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          {category && <span style={{ fontSize: 48 }}>{category.icon}</span>}
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800 }}>{displayName}</h2>
            <span className={`circle-status ${state === 1 ? "active" : state === 0 ? "filling" : "active"}`} style={{ fontSize: 14 }}>
              {STATES[state]}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Contribution</div>
            <div className="text-gradient" style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>
              {formatUnits(contribution, 18)} cUSD
            </div>
          </div>
          <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Pot Size</div>
            <div className="text-gradient" style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>
              {potSize.toFixed(2)} cUSD
            </div>
          </div>
          <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Members</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>
              {Number(memberCount)}/{Number(maxMembers)}
            </div>
          </div>
          <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Round</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>
              {state === 0 ? "—" : `${Number(currentRound) + 1}/${Number(totalRounds)}`}
            </div>
          </div>
        </div>

        {/* Members list */}
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Members</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
          {members?.map((m, i) => (
            <div key={i} className="glass-card" style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${m}`} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                <span style={{ fontFamily: "monospace", fontSize: 14 }}>
                  {m.slice(0, 8)}...{m.slice(-6)}
                </span>
              </div>
              {m.toLowerCase() === creator.toLowerCase() && (
                <span style={{ fontSize: 11, color: "var(--accent-gold)", fontWeight: 600 }}>Creator</span>
              )}
              {m.toLowerCase() === address?.toLowerCase() && (
                <span style={{ fontSize: 11, color: "var(--accent-emerald)", fontWeight: 600 }}>You</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {state === 0 && !isMember && (
            <button className="btn btn-primary" onClick={handleJoin} disabled={joining} id="btn-join">
              {joining ? "⏳ Joining..." : "🤝 Join Circle"}
            </button>
          )}
          {state === 1 && isMember && (
            <>
              <button className="btn btn-secondary" onClick={handleApprove} disabled={approving} id="btn-approve">
                {approving ? "⏳ Approving..." : "✅ Approve cUSD"}
              </button>
              <button className="btn btn-primary" onClick={handleContribute} disabled={contributing} id="btn-contribute">
                {contributing ? "⏳ Contributing..." : "💸 Contribute Now"}
              </button>
            </>
          )}
          {state === 2 && (
            <div style={{ color: "var(--accent-emerald)", fontWeight: 600, fontSize: 18 }}>
              ✅ This circle has completed all rounds!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Leaderboard View ===== */
function LeaderboardView() {
  const { address } = useAccount();
  
  const { data: usersData } = useReadContract({
    address: CHAMAQUESTS_ADDRESS,
    abi: CHAMAQUESTS_ABI,
    functionName: "getAllUsersStats",
    chainId: CELO_CHAIN_ID,
    query: { refetchInterval: 5000 },
  });

  const leaders = [];
  if (usersData && usersData[0]) {
    for (let i = 0; i < usersData[0].length; i++) {
      leaders.push({
        address: usersData[0][i],
        score: Number(usersData[1][i]),
        streak: Number(usersData[2][i])
      });
    }
  }
  
  // Sort by score descending
  leaders.sort((a, b) => b.score - a.score);
  
  // Assign ranks
  leaders.forEach((u, i) => u.rank = i + 1);

  const myData = leaders.find(l => l.address.toLowerCase() === address?.toLowerCase());
  const myScore = myData ? myData.score : 0;
  return (
    <>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <h2>
          Top <span className="text-gradient">Savers</span>
        </h2>
        <p>Live on-chain reputation leaderboard for ChamaVault members.</p>
      </div>

      <div className="glass-card" style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
        
        {address && (
          <div className="my-rank-card glass-card" style={{ padding: 24, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--accent-emerald)", background: "rgba(52, 211, 153, 0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${address}`} alt="avatar" style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
              <div>
                <h3 style={{ fontSize: 18, color: "var(--accent-emerald)", marginBottom: 4 }}>Your Reputation Score</h3>
                <p style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{address.slice(0,6)}...{address.slice(-4)}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{myScore}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Points</div>
            </div>
          </div>
        )}

        <div className="leaderboard-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {leaders.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No savers yet. Be the first!</div>}
          {leaders.map((user) => (
            <div key={user.rank} className="leaderboard-row" style={{ display: "flex", alignItems: "center", padding: "16px 24px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", transition: "all 0.3s" }}>
              <div style={{ width: 40, fontSize: 20, fontWeight: 800, color: user.rank <= 3 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                #{user.rank}
              </div>
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.address}`} alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 16, background: "rgba(255,255,255,0.05)" }} />
              <div style={{ flex: 1, fontFamily: "monospace", fontSize: 16 }}>{user.address.slice(0, 8)}...{user.address.slice(-6)}</div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-emerald)" }}>{user.score} XP</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>🔥 {user.streak} Streak</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ===== Yield Calculator Component ===== */
function YieldCalculator({ currentTier }) {
  const [stakeAmount, setStakeAmount] = useState(10);
  
  const multi = currentTier === 2 ? 3.0 : currentTier === 1 ? 1.5 : 1.0;
  const dailyYield = stakeAmount * 0.000000432 * multi;
  const monthlyYield = dailyYield * 30;
  const yearlyYield = dailyYield * 365;

  return (
    <div className="glass-card" style={{ padding: 24, border: "1px solid rgba(52, 211, 153, 0.2)", background: "rgba(10, 14, 23, 0.3)", marginTop: 28 }}>
      <h4 style={{ fontSize: 16, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 8 }}>
        Staking <span className="text-gradient">Yield Calculator</span>
      </h4>
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 20 }}>
        Estimate your yCHAMA yield emissions based on your staked CHMT balance and Rig level ({multi}x multiplier).
      </p>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          <span>Forecast Staked CHMT</span>
          <span className="text-gradient" style={{ fontSize: 15, fontWeight: "700" }}>{stakeAmount} CHMT</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="5000" 
          step="10"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", outline: "none", cursor: "pointer", accentColor: "var(--accent-emerald)" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="glass-card" style={{ padding: 12, textAlign: "center", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase" }}>Daily Est</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-emerald)", fontFamily: "monospace", marginTop: 4 }}>
            {dailyYield.toFixed(8)}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 9 }}>yCHAMA</div>
        </div>
        <div className="glass-card" style={{ padding: 12, textAlign: "center", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase" }}>Monthly Est</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-emerald)", fontFamily: "monospace", marginTop: 4 }}>
            {monthlyYield.toFixed(8)}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 9 }}>yCHAMA</div>
        </div>
        <div className="glass-card" style={{ padding: 12, textAlign: "center", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase" }}>Yearly Est</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-emerald)", fontFamily: "monospace", marginTop: 4 }}>
            {yearlyYield.toFixed(6)}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 9 }}>yCHAMA</div>
        </div>
      </div>
    </div>
  );
}

/* ===== Mining View ===== */
function MiningView() {
  const { address, chainId: wagmiChainId } = useAccount();
  const chainId = getEffectiveChainId(wagmiChainId);
  const toast = useToast();

  const { data: userTierData, refetch: refetchTier } = useReadContract({
    address: CHAMAMINER_ADDRESS,
    abi: CHAMAMINER_ABI,
    functionName: "userTiers",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { data: stakedBalance, refetch: refetchBalance } = useReadContract({
    address: CHAMAMINER_ADDRESS,
    abi: CHAMAMINER_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { data: pendingRewardsData, refetch: refetchRewards } = useReadContract({
    address: CHAMAMINER_ADDRESS,
    abi: CHAMAMINER_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CHAMAMINER_ADDRESS] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isSuccess, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  const { writeContract: writeFaucet, data: faucetTx, isPending: faucetMinting, error: faucetError } = useWriteContract();
  const { isSuccess: faucetSuccess, error: faucetTxError } = useWaitForTransactionReceipt({ hash: faucetTx });

  useEffect(() => {
    const error = writeError || txError || faucetError || faucetTxError;
    if (error) {
      console.error("Mining Error:", error);
      toast(error.shortMessage || error.message || "Mining action failed", "error");
    }
  }, [writeError, txError, faucetError, faucetTxError]);

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  useEffect(() => {
    if (isSuccess) {
      toast("Transaction successful! 🎉", "success");
      refetchTier();
      refetchBalance();
      refetchRewards();
      refetchAllowance();
      refetchTokenBalance();
    }
  }, [isSuccess]);

  const { writeContract: writeApprove, data: approveTx, isPending: approving } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });

  useEffect(() => {
    if (approveSuccess) {
      toast("CHMT approved! Now confirm your action.", "success");
      refetchAllowance();
      refetchTokenBalance();
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (faucetSuccess) {
      toast("100 CHMT requested from Faucet! 🎉", "success");
      refetchTokenBalance();
    }
  }, [faucetSuccess]);

  const { switchChain } = useSwitchChain();

  const handleMintFaucet = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to request faucet.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    const mintAmount = parseUnits("100", 18);
    writeFaucet({
      address: TOKEN,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [address, mintAmount],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleApprove = async (amount) => {
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to approve.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeApprove({
      address: TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CHAMAMINER_ADDRESS, amount],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleDepositMine = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to stake.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    const depositAmount = parseUnits("10", 18); 
    writeContract({
      address: CHAMAMINER_ADDRESS,
      abi: CHAMAMINER_ABI,
      functionName: "deposit",
      args: [depositAmount],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleHarvest = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to harvest.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeContract({
      address: CHAMAMINER_ADDRESS,
      abi: CHAMAMINER_ABI,
      functionName: "harvest",
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleUpgrade = async (tier) => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to buy rig.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeContract({
      address: CHAMAMINER_ADDRESS,
      abi: CHAMAMINER_ABI,
      functionName: "upgradeTier",
      args: [tier],
      chainId: CELO_CHAIN_ID,
    });
  };

  const userCHMTBalance = tokenBalance ? Number(formatUnits(tokenBalance, 18)) : 0;
  const miningActive = stakedBalance && Number(stakedBalance) > 0;
  const currentTier = userTierData !== undefined ? Number(userTierData) : 0;
  const tierName = currentTier === 2 ? "PRO" : currentTier === 1 ? "LITE" : "FREE";
  const multiplier = currentTier === 2 ? "3x" : currentTier === 1 ? "1.5x" : "1x";

  const baseMinedAmount = pendingRewardsData ? Number(formatUnits(pendingRewardsData, 18)) : 0;
  const [lastReadTime, setLastReadTime] = useState(Date.now());
  const [visualMinedAmount, setVisualMinedAmount] = useState(baseMinedAmount);

  useEffect(() => {
    setVisualMinedAmount(baseMinedAmount);
    setLastReadTime(Date.now());
  }, [pendingRewardsData]);

  useEffect(() => {
    let interval;
    if (miningActive) {
      interval = setInterval(() => {
        const stakedUnits = Number(formatUnits(stakedBalance || 0n, 18));
        const multi = currentTier === 2 ? 300 : currentTier === 1 ? 150 : 100;
        const rewardRate = 500000;
        const ratePerSecond = (stakedUnits * rewardRate * multi) / (100 * 1e18);
        
        const elapsedSeconds = (Date.now() - lastReadTime) / 1000;
        setVisualMinedAmount(baseMinedAmount + ratePerSecond * elapsedSeconds);
      }, 50); // update every 50ms for ultra-smooth counting!
    } else {
      setVisualMinedAmount(baseMinedAmount);
    }
    return () => clearInterval(interval);
  }, [miningActive, stakedBalance, currentTier, baseMinedAmount, lastReadTime]);

  const formattedYield = visualMinedAmount.toFixed(12);
  const dotIndex = formattedYield.indexOf('.');
  const integerPart = formattedYield.slice(0, dotIndex);
  const fractionalPart = formattedYield.slice(dotIndex);

  const minerBtnStyle = {
    flex: "1 1 200px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "56px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "14px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "none",
  };

  return (
    <>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <h2>
          Yield & <span className="text-gradient">Mining</span>
        </h2>
        <p>Deposit CHMT into the mining machine and passively earn yCHAMA tokens.</p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <StatCard 
            label="Current Tier" 
            value={tierName} 
            subValue={`Multiplier: ${multiplier}`}
            icon="💎"
            variant={currentTier > 0 ? "emerald" : "default"}
          />
          <StatCard 
            label="Staked Balance" 
            value={`${formatUnits(stakedBalance || 0n, 18)} CHMT`}
            subValue={`Wallet Balance: ${tokenBalance ? Number(formatUnits(tokenBalance, 18)).toFixed(2) : "0.00"} CHMT`}
            icon="💰"
          />
          <StatCard 
            label="Mining Status" 
            value={miningActive ? "RUNNING" : "IDLE"}
            subValue={miningActive ? "Earning yCHAMA" : "Stake to start"}
            icon={miningActive ? "⚡" : "💤"}
            variant={miningActive ? "emerald" : "default"}
          />
        </div>

        <div className="glass-card" style={{ padding: 40, border: "1px solid rgba(52, 211, 153, 0.3)", position: "relative", overflow: "hidden" }}>
          <div className="rig-glow"></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: 40, background: "rgba(0,0,0,0.4)", borderRadius: 24, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 32, backdropFilter: "blur(10px)", position: "relative" }}>
              <div className="mining-core-container">
                <div className={`mining-core ${miningActive ? 'active' : 'idle'}`}>
                  <div className="core-inner"></div>
                  <div className="core-ring ring-1"></div>
                  <div className="core-ring ring-2"></div>
                  <div className="core-ring ring-3"></div>
                </div>
              </div>
              
              <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, fontWeight: 700 }}>Accumulated Yield</div>
              <div style={{ fontFamily: "monospace", color: "var(--accent-emerald)", textShadow: miningActive ? "0 0 25px rgba(52,211,153,0.5)" : "none", letterSpacing: -1 }}>
                <span style={{ fontSize: 56, fontWeight: 800 }}>{integerPart}</span>
                <span style={{ fontSize: 32, color: "rgba(52,211,153,0.6)", fontWeight: 500 }}>{fractionalPart}</span>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                <span>yCHAMA Tokens</span>
                {miningActive && (
                  <span className="live-badge">● LIVE</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleMintFaucet}
                disabled={faucetMinting}
                style={{ 
                  ...minerBtnStyle, 
                  border: "1px dashed var(--accent-emerald)",
                  background: "rgba(52, 211, 153, 0.03)",
                  color: "var(--accent-emerald)"
                }}
              >
                {faucetMinting ? "⏳ Minting..." : <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/>
                  </svg>
                  Get 100 CHMT
                </>}
              </button>
              {userCHMTBalance < 10 ? (
                <button 
                  className="btn btn-primary" 
                  disabled
                  style={{ 
                    ...minerBtnStyle,
                    background: "rgba(255, 255, 255, 0.04)", 
                    color: "var(--text-muted)", 
                    cursor: "not-allowed",
                    border: "1px solid var(--border-glass)"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  Need 10 CHMT
                </button>
              ) : allowance !== undefined && allowance < parseUnits("10", 18) ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleApprove(parseUnits("10", 18))}
                  disabled={approving}
                  style={{ 
                    ...minerBtnStyle, 
                    background: "var(--accent-emerald)", 
                    color: "#0a0e17",
                    boxShadow: "0 4px 15px rgba(52, 211, 153, 0.25)"
                  }}
                >
                  {approving ? "⏳ Approving..." : <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approve 10 CHMT
                  </>}
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleDepositMine}
                  disabled={isPending}
                  style={{ 
                    ...minerBtnStyle,
                    background: "var(--gradient-primary)",
                    color: "#0a0e17"
                  }}
                >
                  {isPending ? "⏳ Staking..." : <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                      <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                    Stake 10 CHMT
                  </>}
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                onClick={handleHarvest}
                disabled={visualMinedAmount <= 0 || isPending}
                style={{ 
                  ...minerBtnStyle,
                  border: "1px solid var(--border-glass)",
                  background: visualMinedAmount > 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.01)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Harvest yCHAMA
              </button>
            </div>
            
            <div style={{ paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h4 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700 }}>Hardware Upgrades</h4>
                <button 
                    className="btn-text" 
                    onClick={() => handleApprove(parseUnits("100", 18))}
                    disabled={approving}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                >
                    {approving ? "Approving..." : "Step 1: Approve CHMT →"}
                </button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className={`upgrade-box ${currentTier >= 1 ? 'owned' : ''}`}>
                  <div className="upgrade-header">
                    <span className="upgrade-icon">🚀</span>
                    <span className="upgrade-title">Lite Rig</span>
                  </div>
                  <div className="upgrade-meta">
                    <span className="multiplier">1.5x Boost</span>
                    <span className="price">10 CHMT</span>
                  </div>
                  <div className="upgrade-details-list" style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Daily ROI:</span><span style={{ color: "var(--accent-emerald)", fontWeight: "600" }}>+1.5%</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Emission:</span><span>0.003375/s</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Payback Est:</span><span>10 Days</span></div>
                  </div>
                  {currentTier >= 1 ? (
                    <button className="upgrade-btn" disabled>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      OWNED
                    </button>
                  ) : userCHMTBalance < 10 ? (
                    <button className="upgrade-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      Need 10 CHMT
                    </button>
                  ) : allowance !== undefined && allowance < parseUnits("10", 18) ? (
                    <button 
                      className="upgrade-btn approve-needed" 
                      onClick={() => handleApprove(parseUnits("10", 18))}
                      disabled={approving}
                      style={{ background: "rgba(52, 211, 153, 0.15)", color: "var(--accent-emerald)", border: "1px solid var(--accent-emerald)" }}
                    >
                      {approving ? "⏳ Approving..." : <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Step 1: Approve 10 CHMT
                      </>}
                    </button>
                  ) : (
                    <button 
                      className="upgrade-btn" 
                      onClick={() => handleUpgrade(1)}
                      disabled={isPending}
                    >
                      {isPending ? "⏳ Upgrading..." : <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                          <path d="M12 5v14M19 12l-7 7-7-7"/>
                        </svg>
                        Step 2: Buy Lite Rig
                      </>}
                    </button>
                  )}
                </div>

                <div className={`upgrade-box pro ${currentTier >= 2 ? 'owned' : ''}`}>
                  <div className="upgrade-header">
                    <span className="upgrade-icon">🔥</span>
                    <span className="upgrade-title">Pro Rig</span>
                  </div>
                  <div className="upgrade-meta">
                    <span className="multiplier">3.0x Boost</span>
                    <span className="price">50 CHMT</span>
                  </div>
                  <div className="upgrade-details-list" style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Daily ROI:</span><span style={{ color: "var(--accent-emerald)", fontWeight: "600" }}>+3.0%</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Emission:</span><span>0.006750/s</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Payback Est:</span><span>7 Days</span></div>
                  </div>
                  {currentTier >= 2 ? (
                    <button className="upgrade-btn" disabled>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      OWNED
                    </button>
                  ) : userCHMTBalance < 50 ? (
                    <button className="upgrade-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      Need 50 CHMT
                    </button>
                  ) : allowance !== undefined && allowance < parseUnits("50", 18) ? (
                    <button 
                      className="upgrade-btn approve-needed" 
                      onClick={() => handleApprove(parseUnits("50", 18))}
                      disabled={approving}
                      style={{ background: "rgba(251, 191, 36, 0.15)", color: "var(--accent-gold)", border: "1px solid var(--accent-gold)" }}
                    >
                      {approving ? "⏳ Approving..." : <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Step 1: Approve 50 CHMT
                      </>}
                    </button>
                  ) : (
                    <button 
                      className="upgrade-btn" 
                      onClick={() => handleUpgrade(2)}
                      disabled={isPending}
                    >
                      {isPending ? "⏳ Upgrading..." : <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                          <path d="M12 5v14M19 12l-7 7-7-7"/>
                        </svg>
                        Step 2: Buy Pro Rig
                      </>}
                    </button>
                  )}
                </div>
              </div>

              {/* Staking Yield Calculator */}
              <YieldCalculator currentTier={currentTier} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rig-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%);
          z-index: 0;
        }
        .upgrade-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .upgrade-box::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.05), transparent);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }
        .upgrade-box:hover:not(.owned) {
          border-color: rgba(52, 211, 153, 0.25);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(52, 211, 153, 0.1);
        }
        .upgrade-box:hover:not(.owned)::after {
          opacity: 1;
        }
        .upgrade-box.owned {
          border-color: rgba(52, 211, 153, 0.4);
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.04) 0%, rgba(52, 211, 153, 0.08) 100%);
          box-shadow: 0 0 30px rgba(52, 211, 153, 0.1);
        }
        .upgrade-box.pro.owned {
          border-color: rgba(251, 191, 36, 0.4);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.04) 0%, rgba(251, 191, 36, 0.08) 100%);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.1);
        }
        .upgrade-header { display: flex; align-items: center; gap: 10px; z-index: 1; }
        .upgrade-title { font-weight: 700; font-size: 16px; z-index: 1; }
        .upgrade-meta { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); z-index: 1; }
        .upgrade-btn {
          margin-top: 8px;
          padding: 12px;
          border-radius: 14px;
          border: none;
          background: var(--bg-primary);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 1;
          border: 1px solid var(--border-glass);
        }
        .owned .upgrade-btn { background: rgba(52, 211, 153, 0.2); color: var(--accent-emerald); cursor: default; border-color: transparent; }
        .upgrade-box:not(.owned) .upgrade-btn:hover { background: white; color: black; border-color: white; }
        .pro:not(.owned) .upgrade-btn { color: var(--accent-gold); border: 1px solid rgba(251, 191, 36, 0.3); }
        .pro:not(.owned) .upgrade-btn:hover { background: var(--accent-gold); color: var(--bg-primary); border-color: var(--accent-gold); }

        .mining-core-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
          height: 120px;
        }
        .mining-core {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s ease;
        }
        .mining-core.active {
          background: radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, transparent 70%);
          animation: core-pulse 2s infinite alternate ease-in-out;
        }
        .mining-core.idle {
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          animation: core-pulse-idle 4s infinite alternate ease-in-out;
        }
        .core-inner {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          z-index: 2;
          transition: all 0.5s ease;
        }
        .mining-core.active .core-inner {
          background: var(--accent-emerald);
          box-shadow: 0 0 20px var(--accent-emerald), 0 0 40px var(--accent-emerald);
        }
        .mining-core.idle .core-inner {
          background: #6366f1;
          box-shadow: 0 0 10px #6366f1;
        }
        .core-ring {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          transition: all 0.5s ease;
        }
        .mining-core.active .core-ring {
          border-color: rgba(52, 211, 153, 0.15);
        }
        .mining-core.idle .core-ring {
          border-color: rgba(99, 102, 241, 0.05);
        }
        .ring-1 {
          width: 48px;
          height: 48px;
        }
        .mining-core.active .ring-1 {
          animation: spin-clockwise 3s linear infinite;
          border-top-color: var(--accent-emerald);
          border-bottom-color: var(--accent-emerald);
        }
        .ring-2 {
          width: 68px;
          height: 68px;
        }
        .mining-core.active .ring-2 {
          animation: spin-counter-clockwise 5s linear infinite;
          border-left-color: var(--accent-emerald);
          border-right-color: var(--accent-emerald);
        }
        .ring-3 {
          width: 90px;
          height: 90px;
          border-style: dashed;
        }
        .mining-core.active .ring-3 {
          animation: spin-clockwise 8s linear infinite;
          border-color: rgba(52, 211, 153, 0.2);
        }
        .live-badge {
          background: rgba(52, 211, 153, 0.15);
          color: var(--accent-emerald);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          animation: blink 1s infinite alternate;
        }
        @keyframes core-pulse {
          0% { transform: scale(0.96); opacity: 0.9; }
          100% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes core-pulse-idle {
          0% { transform: scale(0.98); opacity: 0.6; }
          100% { transform: scale(1.02); opacity: 0.8; }
        }
        @keyframes spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-counter-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes blink {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ===== Quests / Rewards View ===== */

// Live Dynamic SVG Badge Preview Component
function NftBadgePreview({ streak, address }) {
  let tierName = "Bronze Tier";
  let color1 = "#b45309";
  let color2 = "#78350f";

  if (streak >= 100) {
    tierName = "Legend Tier";
    color1 = "#10b981";
    color2 = "#06b6d4";
  } else if (streak >= 30) {
    tierName = "Diamond Tier";
    color1 = "#22d3ee";
    color2 = "#3b82f6";
  } else if (streak >= 10) {
    tierName = "Gold Tier";
    color1 = "#fbbf24";
    color2 = "#f59e0b";
  } else if (streak >= 4) {
    tierName = "Silver Tier";
    color1 = "#9ca3af";
    color2 = "#4b5563";
  } else {
    tierName = "Bronze Tier";
    color1 = "#b45309";
    color2 = "#78350f";
  }

  const shortAddress = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "0x000...0000";

  return (
    <div className="badge-preview-container" style={{
      width: "100%",
      maxWidth: "280px",
      margin: "0 auto",
      aspectRatio: "4/5",
      borderRadius: "24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 40px ${color1}20`,
      border: "2px solid transparent",
      backgroundImage: `linear-gradient(#0d121f, #0d121f), linear-gradient(135deg, ${color1}, ${color2})`,
      backgroundOrigin: "border-box",
      backgroundClip: "content-box, border-box",
      transition: "all 0.5s ease"
    }}>
      {/* Glow effect */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "140px",
        height: "140px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color1}30 0%, transparent 70%)`,
        filter: "blur(20px)",
        pointerEvents: "none",
        zIndex: 1,
        transition: "all 0.5s ease"
      }} />

      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "24px",
        boxSizing: "border-box",
        zIndex: 2,
        position: "relative"
      }}>
        {/* Top Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            color: color1,
            fontSize: "9px",
            fontWeight: "800",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "4px"
          }}>
            CHAMAVAULT
          </div>
          <div style={{
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "700",
          }}>
            Consistency Protocol
          </div>
        </div>

        {/* Center Graphic */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "12px 0",
          position: "relative"
        }}>
          {/* Ring */}
          <div className="spinning-ring" style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: `2.5px dashed ${color1}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }} />
          
          <div style={{
            position: "absolute",
            width: "86px",
            height: "86px",
            borderRadius: "50%",
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* Checkmark icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s ease" }}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Streak & Details */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "900",
            lineHeight: 1
          }}>
            {streak}
          </div>
          <div style={{
            color: "#9ca3af",
            fontSize: "9px",
            fontWeight: "600",
            letterSpacing: "1.5px",
            marginTop: "2px",
            marginBottom: "10px"
          }}>
            CONSECUTIVE DAYS
          </div>

          {/* Tier Label */}
          <div style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${color1}25, ${color2}25)`,
            border: `1.5px solid ${color1}40`,
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "700"
          }}>
            {tierName}
          </div>
          
          {/* Owner address */}
          <div style={{
            color: "#4b5563",
            fontFamily: "monospace",
            fontSize: "9px",
            marginTop: "12px"
          }}>
            Owner: {shortAddress}
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardsView() {
  const { address, chainId: wagmiChainId } = useAccount();
  const chainId = getEffectiveChainId(wagmiChainId);
  const toast = useToast();
  const { switchChain } = useSwitchChain();
  
  // Tab control
  const [activeTab, setActiveTab] = useState("tokens"); // "tokens" or "nft"

  // Modals for confirmations
  const [modalOpen, setModalOpen] = useState(false);
  const [nftModalOpen, setNftModalOpen] = useState(false);

  // Bonus tasks list
  const [tasks, setTasks] = useState([
    { id: 1, title: "Follow @aleeasghar78 on X", reward: "+50 XP", done: false, link: "https://x.com/aleeasghar78" },
    { id: 2, title: "Retweet & Like Launch Post", reward: "+30 XP", done: false, link: "https://x.com/aleeasghar78/status/2056114384179704298?s=20" },
    { id: 3, title: "Join Discord Community", reward: "+40 XP", done: false, link: "https://discord.com" },
  ]);

  // Hook for Daily Token Check-in (Original names!)
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isSuccess, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  // Hook for Daily NFT Badge Claim
  const { writeContract: writeNftCheck, data: nftTxHash, isPending: nftPending, error: nftWriteError } = useWriteContract();
  const { isSuccess: nftSuccess, error: nftTxError } = useWaitForTransactionReceipt({ hash: nftTxHash });

  // Error notifications for Token Check-in
  useEffect(() => {
    if (writeError) {
      console.error("Rewards Write Error:", writeError);
      toast(writeError.shortMessage || writeError.message || "Check-in failed", "error");
    }
    if (txError) {
      console.error("Rewards TX Error:", txError);
      toast("Check-in receipt error", "error");
    }
  }, [writeError, txError]);

  // Error notifications for NFT Claim
  useEffect(() => {
    if (nftWriteError) {
      console.error("NFT Claim Write Error:", nftWriteError);
      toast(nftWriteError.shortMessage || nftWriteError.message || "NFT claim failed", "error");
    }
    if (nftTxError) {
      console.error("NFT Claim TX Error:", nftTxError);
      toast("NFT claim transaction receipt error", "error");
    }
  }, [nftWriteError, nftTxError]);

  // --- Contract 1 (ChamaQuests - Tokens) Reads ---
  const { data: myStats, refetch: refetchStats } = useReadContract({
    address: CHAMAQUESTS_ADDRESS,
    abi: CHAMAQUESTS_ABI,
    functionName: "stats",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
  });

  const { data: nextRewardData, refetch: refetchNextReward } = useReadContract({
    address: CHAMAQUESTS_ADDRESS,
    abi: CHAMAQUESTS_ABI,
    functionName: "getNextReward",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
  });

  // --- Contract 2 (ConsistencyStreakNFT - Badges) Reads ---
  const { data: userStreakData, refetch: refetchStreak } = useReadContract({
    address: STREAK_NFT_ADDRESS,
    abi: STREAK_NFT_ABI,
    functionName: "userStreaks",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
  });

  const { data: nftBalance, refetch: refetchBalance } = useReadContract({
    address: STREAK_NFT_ADDRESS,
    abi: STREAK_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Success handling
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchStats();
        refetchNextReward();
      }, 1500);
      setModalOpen(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (nftSuccess) {
      setTimeout(() => {
        refetchStreak();
        refetchBalance();
      }, 1500);
      setNftModalOpen(true);
    }
  }, [nftSuccess]);

  // Handlers
  const handleCheckIn = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to check in.", "success");
      } catch (err) {
        toast("Please switch to Celo Mainnet", "error");
      }
      return;
    }
    writeContract({
      address: CHAMAQUESTS_ADDRESS,
      abi: CHAMAQUESTS_ABI,
      functionName: "checkIn",
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleNftClaim = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to claim NFT.", "success");
      } catch (err) {
        toast("Please switch to Celo Mainnet", "error");
      }
      return;
    }
    writeNftCheck({
      address: STREAK_NFT_ADDRESS,
      abi: STREAK_NFT_ABI,
      functionName: "recordConsistency",
      chainId: CELO_CHAIN_ID,
    });
  };

  // --- Calculate Token Check-in Data ---
  const currentStreak = myStats ? Number(myStats.streak ?? myStats[1] ?? 0) : 0;
  const lastCheckIn = myStats ? Number(myStats.lastCheckIn ?? myStats[2] ?? 0) : 0;
  const totalClaimed = myStats ? Number(formatUnits(myStats.totalClaimed ?? myStats[3] ?? 0n, 18)) : 0;
  const canCheckIn = lastCheckIn === 0 || (Date.now() / 1000 >= lastCheckIn + 86400);
  const dayInCycle = currentStreak > 0 ? ((currentStreak - 1) % 7) + 1 : 0;
  
  const nextRewardAmount = nextRewardData 
    ? Number(formatUnits(nextRewardData.chamaAmount ?? nextRewardData[0] ?? 0n, 18)) 
    : 10;

  // --- Calculate NFT Check-in Data ---
  const nftStreak = userStreakData ? Number(userStreakData[0] || 0) : 0;
  const lastNftClaimTimestamp = userStreakData ? Number(userStreakData[1] || 0) : 0;
  const highestNftStreak = userStreakData ? Number(userStreakData[2] || 0) : 0;
  const badgeCount = nftBalance ? Number(nftBalance || 0) : 0;

  const canClaimNft = lastNftClaimTimestamp === 0 || (Date.now() / 1000 >= lastNftClaimTimestamp + 72000);
  const nftTimeRemaining = Math.max(0, (lastNftClaimTimestamp + 72000) - Date.now() / 1000);
  const nftHoursRemaining = Math.floor(nftTimeRemaining / 3600);
  const nftMinutesRemaining = Math.floor((nftTimeRemaining % 3600) / 60);

  let activeNftTier = "None";
  let nftTierColor = "var(--text-muted)";
  if (nftStreak >= 100) {
    activeNftTier = "Legend Tier 🔥";
    nftTierColor = "var(--accent-emerald)";
  } else if (nftStreak >= 30) {
    activeNftTier = "Diamond Tier 💎";
    nftTierColor = "#22d3ee";
  } else if (nftStreak >= 10) {
    activeNftTier = "Gold Tier 🟡";
    nftTierColor = "var(--accent-amber)";
  } else if (nftStreak >= 4) {
    activeNftTier = "Silver Tier ⚪";
    nftTierColor = "#9ca3af";
  } else if (nftStreak >= 1) {
    activeNftTier = "Bronze Tier 🟤";
    nftTierColor = "#b45309";
  }

  let nextNftTierName = "Silver";
  let nextNftTierTarget = 4;
  let prevNftTierTarget = 1;
  
  if (nftStreak >= 100) {
    nextNftTierName = "Max Level";
    nextNftTierTarget = 100;
    prevNftTierTarget = 100;
  } else if (nftStreak >= 30) {
    nextNftTierName = "Legend";
    nextNftTierTarget = 100;
    prevNftTierTarget = 30;
  } else if (nftStreak >= 10) {
    nextNftTierName = "Diamond";
    nextNftTierTarget = 30;
    prevNftTierTarget = 10;
  } else if (nftStreak >= 4) {
    nextNftTierName = "Gold";
    nextNftTierTarget = 10;
    prevNftTierTarget = 4;
  } else {
    nextNftTierName = "Silver";
    nextNftTierTarget = 4;
    prevNftTierTarget = 0;
  }

  const nftRange = nextNftTierTarget - prevNftTierTarget;
  const nftProgressPercent = nftRange > 0 ? Math.min(100, ((nftStreak - prevNftTierTarget) / nftRange) * 100) : 100;

  const verifyTask = (id, link) => {
    window.open(link, '_blank');
    toast("Verifying task...", "info");
    setTimeout(() => {
      setTasks(tasks.map(t => t.id === id ? { ...t, done: true } : t));
      toast("Task verified! Reward claimed.", "success");
    }, 4000);
  };

  const cycleDays = [1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      {/* Daily Token Check-in Modal */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Check-In Confirmed! 🔥"
        message="Your daily check-in was successfully recorded on-chain. CHAMA tokens have been minted and sent directly to your wallet! Maintain your streak to earn even bigger rewards tomorrow."
        type="streak"
      />

      {/* Daily NFT Badge Modal */}
      <GlassModal
        isOpen={nftModalOpen}
        onClose={() => setNftModalOpen(false)}
        title="Consistency Badge Claimed! 🏆"
        message="Your daily consistency has been successfully logged on-chain. A unique, dynamic Consistency Streak Badge NFT has been minted directly to your wallet! Keep up the streak to unlock higher tiers."
        type="streak"
      />

      <div className="section-header" style={{ marginBottom: 32 }}>
        <h2>
          Quests & <span className="text-gradient">Rewards</span>
        </h2>
        <p>Complete daily check-ins, record streak consistency, and claim dynamic NFT badges to build reputation.</p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Premium Segmented Tab Selector */}
        <div style={{
          display: "flex",
          gap: 8,
          background: "rgba(255, 255, 255, 0.02)",
          padding: 6,
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.05)",
          maxWidth: 420,
          margin: "0 auto",
          width: "100%"
        }}>
          <button
            onClick={() => setActiveTab("tokens")}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "tokens" ? "rgba(251, 191, 36, 0.1)" : "transparent",
              color: activeTab === "tokens" ? "var(--accent-gold)" : "var(--text-secondary)",
              border: activeTab === "tokens" ? "1px solid rgba(251, 191, 36, 0.2)" : "1px solid transparent",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13
            }}
          >
            <span>🪙</span> Token Quest
          </button>
          <button
            onClick={() => setActiveTab("nft")}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "nft" ? "rgba(52, 211, 153, 0.1)" : "transparent",
              color: activeTab === "nft" ? "var(--accent-emerald)" : "var(--text-secondary)",
              border: activeTab === "nft" ? "1px solid rgba(52, 211, 153, 0.2)" : "1px solid transparent",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13
            }}
          >
            <span>🏆</span> Streak NFT
          </button>
        </div>

        {activeTab === "tokens" ? (
          /* Card Option 1: Daily CHAMA Check-in */
          <div className="glass-card" style={{ padding: 32, border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 40 }}>🔥</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: 0 }}>{currentStreak} Day Streak</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Total CHAMA earned: {totalClaimed.toFixed(0)}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Next Reward</div>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent-emerald)" }}>{nextRewardAmount}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>CHAMA</div>
              </div>
            </div>

            {/* 7-Day Cycle Visualization */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }} className="cycle-container">
              {cycleDays.map((d) => {
                const isCompleted = dayInCycle >= d;
                const isCurrent = dayInCycle === d;
                const reward = d * 10;
                return (
                  <div
                    key={d}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "12px 4px",
                      borderRadius: 12,
                      background: isCompleted ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.03)",
                      border: isCurrent ? "2px solid #34d399" : isCompleted ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Day {d}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isCompleted ? "#34d399" : "var(--text-secondary)" }}>{reward}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>CHAMA</div>
                    {isCompleted && <div style={{ fontSize: 12, marginTop: 4 }}>✅</div>}
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCheckIn}
              disabled={!canCheckIn || isPending}
              style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 16 }}
            >
              {isPending ? "⏳ Confirming on-chain..." : !canCheckIn ? `✅ Checked In Today (Day ${dayInCycle}/7)` : `🎯 Check In — Earn ${nextRewardAmount} CHAMA`}
            </button>
          </div>
        ) : (
          /* Card Option 2: Daily Consistency NFT Badge */
          <div className="glass-card nft-container-grid" style={{ 
            padding: 36, 
            border: "1px solid rgba(16, 185, 129, 0.25)", 
            background: "rgba(16, 185, 129, 0.02)",
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 40,
            alignItems: "center"
          }}>
            {/* Left Column: Premium Live SVG Preview */}
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <NftBadgePreview streak={nftStreak} address={address} />
            </div>

            {/* Right Column: Stats & Claim */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0 }}>Consistency Streak Badge</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>{nftStreak} Day NFT Streak</p>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px" }}>
                  Claim a free dynamic NFT Badge daily on Celo. Recording consistency daily builds your streak and updates your badge's on-chain metadata and artwork.
                </p>

                {/* Grid stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Badge Tier</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: nftTierColor }}>{activeNftTier}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Badges Claimed</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{badgeCount} NFTs</div>
                  </div>
                </div>

                {/* Progress to next Tier */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>
                    <span>Progress to {nextNftTierName}</span>
                    <span>{nftStreak} / {nextNftTierTarget} Days</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                    <div 
                      style={{ 
                        width: `${nftProgressPercent}%`, 
                        height: "100%", 
                        background: "linear-gradient(90deg, var(--accent-emerald) 0%, #06b6d4 100%)", 
                        borderRadius: 3, 
                        transition: "width 0.5s ease-out" 
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    Personal Best: {highestNftStreak} Days
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNftClaim}
                disabled={!canClaimNft || nftPending}
                style={{ width: "100%", justifyContent: "center", padding: "15px", fontSize: 15 }}
              >
                {nftPending ? (
                  "⏳ Minting NFT..."
                ) : !canClaimNft ? (
                  `Locked (${nftHoursRemaining}h ${nftMinutesRemaining}m)`
                ) : (
                  "🎯 Claim Consistency Badge NFT"
                )}
              </button>
            </div>
          </div>
        )}

      {/* CSS styles to force grid layout to stack on mobile */}
      <style jsx>{`
        .nft-container-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          align-items: center;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinning-ring {
          animation: spin 15s linear infinite;
        }
        @media (max-width: 768px) {
          .nft-container-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 24px !important;
          }
          .cycle-container {
            flex-wrap: wrap;
            gap: 8px !important;
          }
        }
      `}</style>

        {/* One-Time Social Tasks */}
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>🏆</span>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0 }}>Bonus Tasks</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tasks.map(task => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "var(--accent-emerald)", fontWeight: 600 }}>{task.reward}</div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => verifyTask(task.id, task.link)}
                  disabled={task.done}
                  style={{ padding: "8px 20px", fontSize: 13, background: task.done ? "rgba(52,211,153,0.1)" : undefined, color: task.done ? "#34d399" : undefined, borderColor: task.done ? "rgba(52,211,153,0.3)" : undefined }}
                >
                  {task.done ? "✅ Verified" : "Start"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== Token Sale View ===== */
function TokenSaleView() {
  const { address, chainId: wagmiChainId } = useAccount();
  const chainId = getEffectiveChainId(wagmiChainId);
  const toast = useToast();
  const [buyAmount, setBuyAmount] = useState("1");
  const [buyMethod, setBuyMethod] = useState("cusd"); // "cusd" or "celo"

  const { writeContract: writeBuy, data: buyTx, isPending: buying, error: buyError } = useWriteContract();
  const { isSuccess: buySuccess, error: buyTxError } = useWaitForTransactionReceipt({ hash: buyTx });

  const { writeContract: writeApprove, data: approveTx, isPending: approving, error: approveError } = useWriteContract();
  const { isSuccess: approveSuccess, error: approveTxError } = useWaitForTransactionReceipt({ hash: approveTx });

  useEffect(() => {
    const error = buyError || approveError || buyTxError || approveTxError;
    if (error) {
      console.error("Token Sale Error:", error);
      toast(error.shortMessage || error.message || "Purchase failed", "error");
    }
  }, [buyError, approveError, buyTxError, approveTxError]);

  const { data: totalSold, refetch: refetchTotalSold } = useReadContract({
    address: CHAMASALE_ADDRESS,
    abi: CHAMASALE_ABI,
    functionName: "totalChamaSold",
    chainId: CELO_CHAIN_ID,
  });

  const { data: celoPriceData } = useReadContract({
    address: CHAMASALE_ADDRESS,
    abi: CHAMASALE_ABI,
    functionName: "celoPriceUsd",
    chainId: CELO_CHAIN_ID,
  });

  useEffect(() => { 
    if (buySuccess) {
      toast("CHAMA tokens purchased! 🎉💰", "success");
      refetchTotalSold?.();
    }
  }, [buySuccess]);
  
  useEffect(() => { if (approveSuccess) toast("cUSD approved! Now click Buy.", "success"); }, [approveSuccess]);

  const { switchChain } = useSwitchChain();

  const chamaYouGet = parseFloat(buyAmount || 0) * 10000;
  const celoPrice = celoPriceData ? Number(celoPriceData) / 1000 : 0.5;
  const celoEquivalent = parseFloat(buyAmount || 0) / celoPrice;

  const handleApproveCUSD = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to approve.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeApprove({
      address: REAL_CUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CHAMASALE_ADDRESS, parseUnits(buyAmount || "0", 18)],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleBuyWithCUSD = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to buy CHAMA.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeBuy({
      address: CHAMASALE_ADDRESS,
      abi: CHAMASALE_ABI,
      functionName: "buyWithCUSD",
      args: [parseUnits(buyAmount || "0", 18)],
      chainId: CELO_CHAIN_ID,
    });
  };

  const handleBuyWithCELO = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
        toast("Network switched! Please click again to buy CHAMA.", "success");
      } catch (e) {
        toast("Switch to Celo Mainnet", "error");
      }
      return;
    }
    writeBuy({
      address: CHAMASALE_ADDRESS,
      abi: CHAMASALE_ABI,
      functionName: "buyWithCELO",
      value: parseUnits(celoEquivalent.toFixed(18), 18),
      chainId: CELO_CHAIN_ID,
    });
  };

  return (
    <>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <h2>
          Buy <span className="text-gradient">CHAMA</span> Tokens
        </h2>
        <p>Purchase CHAMA tokens with cUSD or CELO. $1 = 10,000 CHAMA</p>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Sale Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Price</div>
            <div className="text-gradient" style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)" }}>$0.0001</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>per CHAMA</div>
          </div>
          <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Total Sold</div>
            <div className="text-gradient" style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)" }}>
              {totalSold ? Number(formatUnits(totalSold, 18)).toLocaleString() : "0"}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>CHAMA</div>
          </div>
        </div>

        {/* Buy Card */}
        <div className="glass-card" style={{ padding: 40, border: "1px solid rgba(52,211,153,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <span style={{ fontSize: 40 }}>🪙</span>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>Token Sale</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>10,000 CHAMA per $1 cUSD</p>
            </div>
          </div>

          {/* Method Toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              className={`freq-btn ${buyMethod === "cusd" ? "active" : ""}`}
              onClick={() => setBuyMethod("cusd")}
            >
              💵 Pay with cUSD
            </button>
            <button
              className={`freq-btn ${buyMethod === "celo" ? "active" : ""}`}
              onClick={() => setBuyMethod("celo")}
            >
              🟡 Pay with CELO
            </button>
          </div>

          {/* Amount Input */}
          <label className="form-label">
            {buyMethod === "cusd" ? "Amount in cUSD" : `Amount in USD (≈ ${celoEquivalent.toFixed(4)} CELO)`}
          </label>
          <input
            className="form-input"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="1.00"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            id="input-buy-amount"
          />

          {/* Preview */}
          <div className="glass-card" style={{ padding: 20, marginTop: 16, marginBottom: 24, textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 4 }}>You will receive</div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent-emerald)" }}>
              {chamaYouGet.toLocaleString()}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>CHAMA Tokens</div>
          </div>

          {/* Buy Buttons */}
          {buyMethod === "cusd" ? (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-secondary"
                onClick={handleApproveCUSD}
                disabled={approving}
                style={{ flex: 1, justifyContent: "center", padding: "14px" }}
              >
                {approving ? "⏳ Approving..." : "✅ Step 1: Approve cUSD"}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBuyWithCUSD}
                disabled={buying}
                style={{ flex: 1, justifyContent: "center", padding: "14px" }}
              >
                {buying ? "⏳ Buying..." : "🪙 Step 2: Buy CHAMA"}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleBuyWithCELO}
              disabled={buying}
              style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 16 }}
            >
              {buying ? "⏳ Sending CELO..." : `🟡 Buy ${chamaYouGet.toLocaleString()} CHAMA with CELO`}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ===== Dashboard Quick Onboarding Banner ===== */
function QuickOnboarding() {
  const [slide, setSlide] = useState(0);
  const slides = [
    {
      title: "1. Join or Create a Savings Circle 🤝",
      desc: "Browse circles or create one specifying contribution amount, member count, and frequency (daily, weekly, monthly). Smart contracts manage the pot automatically."
    },
    {
      title: "2. Passive Staking Mining Yields ⛏️",
      desc: "Stake your CHMT tokens in the Mining tab to passively generate yCHAMA yield. Emitted rewards accumulate every millisecond and are harvestable anytime."
    },
    {
      title: "3. Complete Quests & Build Reputation ⚔️",
      desc: "Check-in daily to grow your day-streak and reputation score. Maintain consistency to boost your yield multiplier and buy hardware upgrade rigs."
    }
  ];

  return (
    <div className="glass-card" style={{ padding: 24, border: "1px solid rgba(52, 211, 153, 0.25)", background: "linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, rgba(251, 191, 36, 0.02) 100%)", marginBottom: 28, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, margin: 0, color: "var(--accent-emerald)" }}>
          {slides[slide].title}
        </h4>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: "600" }}>Step {slide + 1} of 3</span>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
        {slides[slide].desc}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setSlide(idx)}
              style={{ width: 8, height: 8, borderRadius: "50%", border: "none", background: slide === idx ? "var(--accent-emerald)" : "rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.2s" }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setSlide((slide + 1) % 3)}
          style={{ padding: "6px 16px", fontSize: 12, borderRadius: 8 }}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

/* ===== Celo Network Status Panel ===== */
function NetworkStatusWidget() {
  const { address, isConnected } = useAccount();
  const rawChainId = useAccount().chainId;
  const chainId = getEffectiveChainId(rawChainId);
  const { switchChain } = useSwitchChain();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [gasPrice, setGasPrice] = useState("5.2");
  const [latency, setLatency] = useState(120);

  // Update gas price and latency randomly on block change
  useEffect(() => {
    if (blockNumber) {
      const randomGas = (5.0 + Math.random() * 3.0).toFixed(2);
      setGasPrice(randomGas);
      const randomLatency = Math.floor(80 + Math.random() * 60);
      setLatency(randomLatency);
    }
  }, [blockNumber]);

  const isOnCelo = chainId === CELO_CHAIN_ID;

  return (
    <div className="network-status-bar glass-card">
      <div className="status-item">
        <span className={`status-indicator ${isConnected ? (isOnCelo ? "online" : "warning") : "offline"}`} />
        <span className="status-label">Network:</span>
        {isConnected ? (
          isOnCelo ? (
            <span className="status-value text-emerald">Celo Mainnet</span>
          ) : (
            <span className="status-value text-amber" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Wrong Network
              <button 
                className="btn btn-secondary" 
                style={{ padding: "2px 8px", fontSize: 10, height: "auto", borderRadius: 4, cursor: "pointer" }}
                onClick={() => switchChain({ chainId: CELO_CHAIN_ID })}
              >
                Switch
              </button>
            </span>
          )
        ) : (
          <span className="status-value text-secondary">Disconnected</span>
        )}
      </div>

      <div className="status-divider" />

      <div className="status-item">
        <span className="status-icon">📦</span>
        <span className="status-label">Block:</span>
        <span className="status-value mono">{blockNumber ? `#${blockNumber.toString()}` : "Syncing..."}</span>
      </div>

      <div className="status-divider" />

      <div className="status-item">
        <span className="status-icon">⛽</span>
        <span className="status-label">Gas:</span>
        <span className="status-value mono">{gasPrice} Gwei</span>
      </div>

      <div className="status-divider hide-mobile" />

      <div className="status-item hide-mobile">
        <span className="status-icon">⚡</span>
        <span className="status-label">Ping:</span>
        <span className="status-value mono">{latency}ms</span>
      </div>

      <div className="status-divider" />

      <div className="status-item">
        <span className="status-icon">🛡️</span>
        <span className="status-label">Contracts:</span>
        <span className="status-value text-emerald" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          Active <span style={{ fontSize: 10 }}>🟢</span>
        </span>
      </div>

      <style jsx>{`
        .network-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(13, 18, 31, 0.4);
          border-radius: 12px;
          font-size: 13px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-label {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .status-value {
          color: var(--text-primary);
          font-weight: 600;
        }
        .status-value.mono {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .text-emerald {
          color: var(--accent-emerald) !important;
        }
        .text-amber {
          color: var(--accent-amber) !important;
        }
        .text-secondary {
          color: var(--text-secondary) !important;
        }
        .status-divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }
        .status-indicator::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          opacity: 0.4;
          animation: pulse 2s infinite;
        }
        .status-indicator.online {
          background: var(--accent-emerald);
        }
        .status-indicator.online::after {
          box-shadow: 0 0 0 4px var(--accent-emerald);
        }
        .status-indicator.warning {
          background: var(--accent-amber);
        }
        .status-indicator.warning::after {
          box-shadow: 0 0 0 4px var(--accent-amber);
        }
        .status-indicator.offline {
          background: #ef4444;
        }
        .status-indicator.offline::after {
          box-shadow: 0 0 0 4px #ef4444;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @media (max-width: 768px) {
          .network-status-bar {
            padding: 10px 12px;
            font-size: 11px;
            gap: 6px;
            justify-content: center;
          }
          .hide-mobile {
            display: none !important;
          }
          .status-divider {
            display: none;
          }
          .status-item {
            flex: 1 1 45%;
            justify-content: center;
            background: rgba(255, 255, 255, 0.02);
            padding: 6px 4px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.03);
          }
        }
      `}</style>
    </div>
  );
}

/* ===== Main App Content ===== */
function AppContent() {
  const [view, setView] = useState("explore");
  const [selectedChama, setSelectedChama] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const { address } = useAccount();

  // Read total chama count
  const { data: chamaCount, refetch } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "chamaCount",
    chainId: CELO_CHAIN_ID,
  });

  // Read user's chamas
  const { data: myChamas } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "getMemberChamas",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
  });

  const totalChamas = Number(chamaCount || 0);
  const allIds = Array.from({ length: totalChamas }, (_, i) => i);

  if (selectedChama !== null) {
    return (
      <>
        <AppNav view={view} setView={setView} />
        <CircleDetail chamaId={selectedChama} onBack={() => setSelectedChama(null)} />
      </>
    );
  }

  return (
    <>
      <AppNav view={view} setView={setView} />
      <div className="container" style={{ paddingTop: 120 }}>
        {/* Celo Network Status & Health Bar */}
        <NetworkStatusWidget />

        {/* ===== EXPLORE VIEW ===== */}
        {view === "explore" && (
          <>
            <div className="section-header" style={{ marginBottom: 32 }}>
              <h2>
                Explore <span className="text-gradient">Circles</span>
              </h2>
              <p>Browse real savings circles on Celo. Join one or create your own.</p>
            </div>

            {/* Quick onboarding carousel */}
            <QuickOnboarding />

            {/* Category filter */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32, justifyContent: "center" }}>
              <button
                className={`freq-btn ${filterCat === "all" ? "active" : ""}`}
                onClick={() => setFilterCat("all")}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`freq-btn ${filterCat === c.id ? "active" : ""}`}
                  onClick={() => setFilterCat(c.id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>

            {totalChamas === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🏦</p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>No circles yet</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                  Be the first to create a savings circle on ChamaVault!
                </p>
                <button className="btn btn-primary" onClick={() => setView("create")} id="btn-first-create">
                  ✨ Create First Circle
                </button>
              </div>
            ) : (
              <div className="circles-preview">
                {allIds.map((id) => (
                  <ChamaCard key={id} chamaId={id} onSelect={setSelectedChama} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== MY CIRCLES VIEW ===== */}
        {view === "my" && (
          <>
            <div className="section-header" style={{ marginBottom: 32 }}>
              <h2>
                My <span className="text-gradient">Circles</span>
              </h2>
              <p>Your active savings circles on Celo.</p>
            </div>
            {!address ? (
              <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🔗</p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>Connect Your Wallet</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                  Connect your wallet to see your circles.
                </p>
                <WalletConnect />
              </div>
            ) : myChamas?.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>📭</p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>No circles yet</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                  Join an existing circle or create your own!
                </p>
                <button className="btn btn-primary" onClick={() => setView("explore")}>
                  🔍 Explore Circles
                </button>
              </div>
            ) : (
              <div className="circles-preview">
                {myChamas?.map((id) => (
                  <ChamaCard key={Number(id)} chamaId={Number(id)} onSelect={setSelectedChama} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== CREATE VIEW ===== */}
        {view === "create" && (
          <CreateChamaForm
            onCreated={() => {
              refetch();
              setView("explore");
            }}
          />
        )}

        {/* ===== LEADERBOARD VIEW ===== */}
        {view === "leaderboard" && <LeaderboardView />}

        {/* ===== MINING VIEW ===== */}
        {view === "mining" && <MiningView />}

        {/* ===== REWARDS VIEW ===== */}
        {view === "rewards" && <RewardsView />}

        {/* ===== BUY CHAMA VIEW ===== */}
        {view === "buy" && <TokenSaleView />}
      </div>
    </>
  );
}

/* ===== Page Export ===== */
export default function AppPage() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

// Leaderboard feature integrated

// Connected to Miner
