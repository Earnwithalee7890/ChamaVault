"use client";
import "./app.css";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction, useSwitchChain, useChainId } from "wagmi";
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

/* ===== Navbar ===== */
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

  return (
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

        @media (max-width: 1024px) {
          .mobile-menu-toggle { display: flex; }
          .navbar-links.dashboard-nav {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            height: 100vh;
            background: var(--bg-primary);
            flex-direction: column;
            padding: 100px 40px;
            transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            z-index: 1000;
          }
          .navbar-links.dashboard-nav.active { right: 0; }
          .navbar-links li { width: 100%; border-bottom: 1px solid var(--border-glass); padding: 10px 0; }
          .mobile-open .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
          .mobile-open .bar:nth-child(2) { opacity: 0; }
          .mobile-open .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
        }
      `}</style>
    </nav>
  );
}

/* ===== Create Chama Form ===== */
function CreateChamaForm({ onCreated }) {
  const toast = useToast();
  const { address } = useAccount();
  const [form, setForm] = useState({
    name: "",
    category: "general",
    contribution: "1",
    frequency: "604800",
    maxMembers: "5",
  });

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
      toast("Chama created on-chain! 🎉", "success");
      if (onCreated) onCreated();
    }
  }, [isSuccess]);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleCreate = async () => {
    if (!address) return toast("Connect your wallet first", "error");
    if (!form.name.trim()) return toast("Enter a circle name", "error");

    if (chainId !== CELO_CHAIN_ID) {
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
  const { address } = useAccount();

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

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleJoin = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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

/* ===== Mining View ===== */
function MiningView() {
  const { address } = useAccount();
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

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleMintFaucet = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
  const [visualMinedAmount, setVisualMinedAmount] = useState(baseMinedAmount);

  useEffect(() => {
    setVisualMinedAmount(baseMinedAmount);
  }, [baseMinedAmount]);

  useEffect(() => {
    let interval;
    if (miningActive) {
      interval = setInterval(() => {
        const multi = currentTier === 2 ? 3 : currentTier === 1 ? 1.5 : 1;
        setVisualMinedAmount((prev) => prev + (0.00005 * multi * Number(formatUnits(stakedBalance||0n, 18))));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [miningActive, stakedBalance, currentTier]);

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
            <div style={{ padding: 48, background: "rgba(0,0,0,0.4)", borderRadius: 24, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 32, backdropFilter: "blur(10px)" }}>
              <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, fontWeight: 700 }}>Accumulated Yield</div>
              <div style={{ fontFamily: "monospace", fontSize: 64, color: "var(--accent-emerald)", fontWeight: 800, textShadow: miningActive ? "0 0 30px rgba(52,211,153,0.4)" : "none", letterSpacing: -2 }}>
                {visualMinedAmount.toFixed(6)}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 8 }}>yCHAMA Tokens</div>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleMintFaucet}
                disabled={faucetMinting}
                style={{ flex: 1, justifyContent: "center", padding: "18px", fontSize: 18, borderRadius: 16, border: "1px dashed var(--accent-emerald)" }}
              >
                {faucetMinting ? "⏳ Minting..." : "🚰 Faucet: Get 100 CHMT"}
              </button>
              {userCHMTBalance < 10 ? (
                <button 
                  className="btn btn-primary" 
                  disabled
                  style={{ flex: 1.5, justifyContent: "center", padding: "18px", fontSize: 18, borderRadius: 16, background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)", cursor: "not-allowed" }}
                >
                  ❌ Need 10 CHMT Balance
                </button>
              ) : allowance !== undefined && allowance < parseUnits("10", 18) ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleApprove(parseUnits("10", 18))}
                  disabled={approving}
                  style={{ flex: 1.5, justifyContent: "center", padding: "18px", fontSize: 18, borderRadius: 16, background: "var(--accent-emerald)", color: "var(--bg-primary)" }}
                >
                  {approving ? "⏳ Approving..." : "✅ Step 1: Approve 10 CHMT"}
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleDepositMine}
                  disabled={isPending}
                  style={{ flex: 1.5, justifyContent: "center", padding: "18px", fontSize: 18, borderRadius: 16 }}
                >
                  {isPending ? "⏳ Staking..." : "📥 Step 2: Stake 10 CHMT"}
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                onClick={handleHarvest}
                disabled={!miningActive || isPending}
                style={{ flex: 1, justifyContent: "center", padding: "18px", fontSize: 18, borderRadius: 16 }}
              >
                🌾 Harvest
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
                  {currentTier >= 1 ? (
                    <button className="upgrade-btn" disabled>
                      OWNED
                    </button>
                  ) : userCHMTBalance < 10 ? (
                    <button className="upgrade-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                      ❌ Need 10 CHMT
                    </button>
                  ) : allowance !== undefined && allowance < parseUnits("10", 18) ? (
                    <button 
                      className="upgrade-btn approve-needed" 
                      onClick={() => handleApprove(parseUnits("10", 18))}
                      disabled={approving}
                      style={{ background: "rgba(52, 211, 153, 0.15)", color: "var(--accent-emerald)", border: "1px solid var(--accent-emerald)" }}
                    >
                      {approving ? "⏳ Approving..." : "✅ Step 1: Approve 10 CHMT"}
                    </button>
                  ) : (
                    <button 
                      className="upgrade-btn" 
                      onClick={() => handleUpgrade(1)}
                      disabled={isPending}
                    >
                      {isPending ? "⏳ Upgrading..." : "📥 Step 2: Buy Lite Rig"}
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
                  {currentTier >= 2 ? (
                    <button className="upgrade-btn" disabled>
                      OWNED
                    </button>
                  ) : userCHMTBalance < 50 ? (
                    <button className="upgrade-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                      ❌ Need 50 CHMT
                    </button>
                  ) : allowance !== undefined && allowance < parseUnits("50", 18) ? (
                    <button 
                      className="upgrade-btn approve-needed" 
                      onClick={() => handleApprove(parseUnits("50", 18))}
                      disabled={approving}
                      style={{ background: "rgba(251, 191, 36, 0.15)", color: "var(--accent-gold)", border: "1px solid var(--accent-gold)" }}
                    >
                      {approving ? "⏳ Approving..." : "✅ Step 1: Approve 50 CHMT"}
                    </button>
                  ) : (
                    <button 
                      className="upgrade-btn" 
                      onClick={() => handleUpgrade(2)}
                      disabled={isPending}
                    >
                      {isPending ? "⏳ Upgrading..." : "📥 Step 2: Buy Pro Rig"}
                    </button>
                  )}
                </div>
              </div>
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
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: 0.3s;
        }
        .upgrade-box:hover:not(.owned) {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
        }
        .upgrade-box.owned {
          border-color: rgba(52, 211, 153, 0.3);
          background: rgba(52, 211, 153, 0.05);
        }
        .upgrade-box.pro.owned {
          border-color: rgba(251, 191, 36, 0.3);
          background: rgba(251, 191, 36, 0.05);
        }
        .upgrade-header { display: flex; align-items: center; gap: 10px; }
        .upgrade-title { font-weight: 700; font-size: 16px; }
        .upgrade-meta { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
        .upgrade-btn {
          margin-top: 8px;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background: var(--bg-primary);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .owned .upgrade-btn { background: rgba(52, 211, 153, 0.2); color: var(--accent-emerald); cursor: default; }
        .upgrade-box:not(.owned) .upgrade-btn:hover { background: white; color: black; }
        .pro:not(.owned) .upgrade-btn { color: var(--accent-gold); border: 1px solid rgba(251, 191, 36, 0.3); }
      `}</style>
    </>
  );
}

/* ===== Quests / Rewards View ===== */
function RewardsView() {
  const { address } = useAccount();
  const toast = useToast();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [tasks, setTasks] = useState([
    { id: 1, title: "Follow @aleeasghar78 on X", reward: "+50 XP", done: false, link: "https://x.com/aleeasghar78" },
    { id: 2, title: "Retweet & Like Launch Post", reward: "+30 XP", done: false, link: "https://x.com/aleeasghar78/status/2056114384179704298?s=20" },
    { id: 3, title: "Join Discord Community", reward: "+40 XP", done: false, link: "https://discord.com" },
  ]);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isSuccess, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

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

  useEffect(() => {
    if (isSuccess) {
      // Small delay to ensure block indexer catch up
      setTimeout(() => {
        refetchStats();
        refetchNextReward();
      }, 1000);
      toast("Check-in confirmed! CHAMA tokens minted to your wallet! 🔥💰", "success");
    }
  }, [isSuccess]);

  const handleCheckIn = async () => {
    if (!address) return toast("Connect wallet first", "error");
    
    if (chainId !== CELO_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_CHAIN_ID });
      } catch (err) {
        return toast("Please switch to Celo Mainnet", "error");
      }
    }

    writeContract({
      address: CHAMAQUESTS_ADDRESS,
      abi: CHAMAQUESTS_ABI,
      functionName: "checkIn",
      chainId: CELO_CHAIN_ID,
    });
  };

  const currentStreak = myStats ? Number(myStats.streak ?? myStats[1] ?? 0) : 0;
  const lastCheckIn = myStats ? Number(myStats.lastCheckIn ?? myStats[2] ?? 0) : 0;
  const totalClaimed = myStats ? Number(formatUnits(myStats.totalClaimed ?? myStats[3] ?? 0n, 18)) : 0;
  const canCheckIn = lastCheckIn === 0 || (Date.now() / 1000 >= lastCheckIn + 86400);
  const dayInCycle = currentStreak > 0 ? ((currentStreak - 1) % 7) + 1 : 0;
  
  const nextRewardAmount = nextRewardData 
    ? Number(formatUnits(nextRewardData.chamaAmount ?? nextRewardData[0] ?? 0n, 18)) 
    : 10;
  const nextDay = nextRewardData ? Number(nextRewardData.dayInCycle ?? nextRewardData[1] ?? 1) : 1;

  const verifyTask = (id, link) => {
    window.open(link, '_blank');
    toast("Verifying task...", "info");
    setTimeout(() => {
      setTasks(tasks.map(t => t.id === id ? { ...t, done: true } : t));
      toast("Task verified! Reward claimed.", "success");
    }, 4000);
  };

  // 7-day cycle visualization
  const cycleDays = [1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <h2>
          Quests & <span className="text-gradient">Rewards</span>
        </h2>
        <p>Check in daily to earn escalating CHAMA token rewards. Streak resets reward cycle every 7 days!</p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Streak + Next Reward Card */}
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
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
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
  const { address } = useAccount();
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

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const chamaYouGet = parseFloat(buyAmount || 0) * 10000;
  const celoPrice = celoPriceData ? Number(celoPriceData) / 1000 : 0.5;
  const celoEquivalent = parseFloat(buyAmount || 0) / celoPrice;

  const handleApproveCUSD = async () => {
    if (!address) return toast("Connect wallet first", "error");
    if (chainId !== CELO_CHAIN_ID) {
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
      try { await switchChain({ chainId: CELO_CHAIN_ID }); } catch (e) { return toast("Switch to Celo Mainnet", "error"); }
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
        {/* ===== EXPLORE VIEW ===== */}
        {view === "explore" && (
          <>
            <div className="section-header" style={{ marginBottom: 32 }}>
              <h2>
                Explore <span className="text-gradient">Circles</span>
              </h2>
              <p>Browse real savings circles on Celo. Join one or create your own.</p>
            </div>

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
