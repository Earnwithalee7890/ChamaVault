"use client";
import "./app.css";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
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
} from "@/config/contracts";

const TOKEN = CUSD_ADDRESS; // Switch to CUSD_ADDRESS for mainnet
const STATES = ["Forming", "Active", "Completed"];

/* ===== Navbar ===== */
function AppNav({ view, setView }) {
  return (
    <nav className="navbar scrolled" id="app-navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo" id="app-logo">
          <img src="/logo.png" alt="ChamaVault" style={{ width: 40, height: 40, borderRadius: 10 }} />
          ChamaVault
        </a>
        <ul className="navbar-links">
          <li>
            <a href="#" onClick={() => setView("explore")} style={{ color: view === "explore" ? "#34d399" : undefined }} id="nav-explore">
              Explore
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setView("my")} style={{ color: view === "my" ? "#34d399" : undefined }} id="nav-my">
              My Circles
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setView("leaderboard")} style={{ color: view === "leaderboard" ? "#34d399" : undefined }} id="nav-leaderboard">
              Leaderboard
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setView("rewards")} style={{ color: view === "rewards" ? "#34d399" : undefined }} id="nav-rewards">
              Rewards
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setView("mining")} style={{ color: view === "mining" ? "#34d399" : undefined }} id="nav-mining">
              Mining
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setView("buy")} style={{ color: view === "buy" ? "#34d399" : undefined }} id="nav-buy">
              Buy CHAMA
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setView("create")} style={{ color: view === "create" ? "#34d399" : undefined }} id="nav-create">
              Create
            </a>
          </li>
        </ul>
        <div className="navbar-actions">
          <WalletConnect />
        </div>
      </div>
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

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      toast("Chama created on-chain! 🎉", "success");
      if (onCreated) onCreated();
    }
  }, [isSuccess]);

  const handleCreate = () => {
    if (!address) return toast("Connect your wallet first", "error");
    if (!form.name.trim()) return toast("Enter a circle name", "error");

    const fullName = `[${form.category}] ${form.name}`;
    writeContract({
      address: CHAMAVAULT_ADDRESS,
      abi: CHAMAVAULT_ABI,
      functionName: "createChama",
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
  });

  const { data: members } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "getChamaMembers",
    args: [BigInt(chamaId)],
  });

  // Join
  const { writeContract: writeJoin, data: joinTx, isPending: joining } = useWriteContract();
  const { isSuccess: joinSuccess } = useWaitForTransactionReceipt({ hash: joinTx });

  // Approve cUSD
  const { writeContract: writeApprove, data: approveTx, isPending: approving } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });

  // Contribute
  const { writeContract: writeContribute, data: contributeTx, isPending: contributing } = useWriteContract();
  const { isSuccess: contributeSuccess } = useWaitForTransactionReceipt({ hash: contributeTx });

  useEffect(() => { if (joinSuccess) toast("Joined circle! 🎉", "success"); }, [joinSuccess]);
  useEffect(() => { if (approveSuccess) toast("cUSD approved! Now contribute.", "success"); }, [approveSuccess]);
  useEffect(() => { if (contributeSuccess) toast("Contribution made! 💸", "success"); }, [contributeSuccess]);

  if (!info) return <div className="container" style={{ paddingTop: 120 }}>Loading...</div>;

  const [name, creator, contribution, maxMembers, currentRound, totalRounds, memberCount, state] = info;
  const displayName = (name || "").replace(/\[.*?\]\s*/, "");
  const category = CATEGORIES.find((c) => (name || "").includes(`[${c.id}]`));
  const isMember = members?.some((m) => m.toLowerCase() === address?.toLowerCase());
  const potSize = Number(formatUnits(contribution, 18)) * Number(maxMembers);

  const handleJoin = () => {
    if (!address) return toast("Connect wallet first", "error");
    writeJoin({
      address: CHAMAVAULT_ADDRESS,
      abi: CHAMAVAULT_ABI,
      functionName: "joinChama",
      args: [BigInt(chamaId)],
    });
  };

  const handleApprove = () => {
    writeApprove({
      address: TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CHAMAVAULT_ADDRESS, contribution],
    });
  };

  const handleContribute = () => {
    writeContribute({
      address: CHAMAVAULT_ADDRESS,
      abi: CHAMAVAULT_ABI,
      functionName: "contribute",
      args: [BigInt(chamaId)],
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
    query: { enabled: !!address },
  });

  const { data: stakedBalance, refetch: refetchBalance } = useReadContract({
    address: CHAMAMINER_ADDRESS,
    abi: CHAMAMINER_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: pendingRewardsData, refetch: refetchRewards } = useReadContract({
    address: CHAMAMINER_ADDRESS,
    abi: CHAMAMINER_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      toast("Transaction successful! 🎉", "success");
      refetchTier();
      refetchBalance();
      refetchRewards();
    }
  }, [isSuccess]);

  const { writeContract: writeApprove, data: approveTx, isPending: approving } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });
  useEffect(() => { if (approveSuccess) toast("cUSD approved! Now confirm your action.", "success"); }, [approveSuccess]);

  const handleApprove = (amount) => {
    writeApprove({
      address: TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CHAMAMINER_ADDRESS, amount],
    });
  };

  const handleDepositMine = () => {
    if (!address) return toast("Connect wallet first", "error");
    const depositAmount = parseUnits("10", 18); 
    writeContract({
      address: CHAMAMINER_ADDRESS,
      abi: CHAMAMINER_ABI,
      functionName: "deposit",
      args: [depositAmount],
    });
  };

  const handleHarvest = () => {
    if (!address) return toast("Connect wallet first", "error");
    writeContract({
      address: CHAMAMINER_ADDRESS,
      abi: CHAMAMINER_ABI,
      functionName: "harvest",
    });
  };

  const handleUpgrade = (tier) => {
    if (!address) return toast("Connect wallet first", "error");
    writeContract({
      address: CHAMAMINER_ADDRESS,
      abi: CHAMAMINER_ABI,
      functionName: "upgradeTier",
      args: [tier],
    });
  };

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

      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="glass-card" style={{ padding: 40, border: "1px solid rgba(52, 211, 153, 0.3)", boxShadow: "0 10px 40px rgba(52, 211, 153, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 40 }}>⛏️</span>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: 0 }}>yCHAMA Mining Rig</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Active Subscription</p>
              </div>
            </div>
            <div style={{ background: "rgba(52, 211, 153, 0.15)", border: "1px solid #34d399", color: "#34d399", padding: "8px 16px", borderRadius: 12, fontWeight: 800, letterSpacing: 1 }}>
              {tierName} TIER ({multiplier})
            </div>
          </div>
          
          <div style={{ padding: 32, background: "rgba(0,0,0,0.3)", borderRadius: 16, textAlign: "center", border: "1px inset rgba(255,255,255,0.05)", marginBottom: 24 }}>
            <div style={{ color: "var(--text-muted)", fontSize: 14, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Pending yCHAMA Yield</div>
            <div style={{ fontFamily: "monospace", fontSize: 48, color: "var(--accent-emerald)", fontWeight: 800, textShadow: miningActive ? "0 0 20px rgba(52,211,153,0.6)" : "none" }}>
              {visualMinedAmount.toFixed(6)}
            </div>
            {miningActive ? (
              <div style={{ fontSize: 14, color: "var(--accent-emerald)", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="pulse-dot"></span>
                Mining in progress (Staked: {formatUnits(stakedBalance || 0n, 18)} CHMT)
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 12 }}>
                Not mining. Stake CHMT to start.
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            <button 
              className="btn btn-primary" 
              onClick={handleDepositMine}
              disabled={isPending}
              style={{ flex: 1, justifyContent: "center", padding: "16px", fontSize: 16 }}
            >
              💰 Stake 10 CHMT
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleHarvest}
              disabled={!miningActive || isPending}
              style={{ flex: 1, justifyContent: "center", padding: "16px", fontSize: 16 }}
            >
              🌾 Harvest Yield
            </button>
          </div>
          
          <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h4 style={{ fontSize: 18, fontFamily: "var(--font-display)", marginBottom: 16 }}>Rig Upgrades</h4>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>Boost your mining speed by permanently upgrading your machine tier using CHMT.</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
               <button 
                className="btn" 
                onClick={() => handleUpgrade(1)}
                disabled={currentTier >= 1 || isPending}
                style={{ flex: 1, padding: "12px", background: currentTier >= 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white", cursor: currentTier >= 1 ? "not-allowed" : "pointer", opacity: currentTier >= 1 ? 0.5 : 1 }}
              >
                🚀 LITE TIER (1.5x) - 10 CHMT
              </button>
              <button 
                className="btn" 
                onClick={() => handleUpgrade(2)}
                disabled={currentTier >= 2 || isPending}
                style={{ flex: 1, padding: "12px", background: currentTier >= 2 ? "rgba(251, 191, 36, 0.1)" : "rgba(251, 191, 36, 0.2)", border: "1px solid rgba(251, 191, 36, 0.4)", color: "#fbbf24", cursor: currentTier >= 2 ? "not-allowed" : "pointer", opacity: currentTier >= 2 ? 0.5 : 1 }}
              >
                🔥 PRO TIER (3x) - 50 CHMT
              </button>
            </div>
            <button 
                className="btn btn-secondary" 
                onClick={() => handleApprove(parseUnits("100", 18))}
                disabled={approving}
                style={{ width: "100%", padding: "12px", fontSize: 14 }}
            >
                {approving ? "⏳ Approving CHMT..." : "✅ Step 1: Approve CHMT for Staking/Upgrades"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== Quests / Rewards View ===== */
function RewardsView() {
  const { address } = useAccount();
  const toast = useToast();
  const [tasks, setTasks] = useState([
    { id: 1, title: "Follow @ChamaVault on X", reward: "+50 XP", done: false, link: "https://twitter.com" },
    { id: 2, title: "Retweet Launch Post", reward: "+30 XP", done: false, link: "https://twitter.com" },
    { id: 3, title: "Join Discord Community", reward: "+40 XP", done: false, link: "https://discord.com" },
  ]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: myStats, refetch: refetchStats } = useReadContract({
    address: CHAMAQUESTS_ADDRESS,
    abi: CHAMAQUESTS_ABI,
    functionName: "stats",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: nextRewardData } = useReadContract({
    address: CHAMAQUESTS_ADDRESS,
    abi: CHAMAQUESTS_ABI,
    functionName: "getNextReward",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (isSuccess) {
      refetchStats();
      toast("Check-in confirmed! CHAMA tokens minted to your wallet! 🔥💰", "success");
    }
  }, [isSuccess]);

  const handleCheckIn = () => {
    if (!address) return toast("Connect wallet first", "error");
    writeContract({
      address: CHAMAQUESTS_ADDRESS,
      abi: CHAMAQUESTS_ABI,
      functionName: "checkIn",
    });
  };

  const currentStreak = myStats ? Number(myStats[1]) : 0;
  const lastCheckIn = myStats ? Number(myStats[2]) : 0;
  const totalClaimed = myStats ? Number(formatUnits(myStats[3] || 0n, 18)) : 0;
  const canCheckIn = lastCheckIn === 0 || (Date.now() / 1000 >= lastCheckIn + 86400);
  const dayInCycle = currentStreak > 0 ? ((currentStreak - 1) % 7) + 1 : 0;
  const nextRewardAmount = nextRewardData ? Number(formatUnits(nextRewardData[0], 18)) : 10;
  const nextDay = nextRewardData ? Number(nextRewardData[1]) : 1;

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

  const { writeContract: writeBuy, data: buyTx, isPending: buying } = useWriteContract();
  const { isSuccess: buySuccess } = useWaitForTransactionReceipt({ hash: buyTx });

  const { writeContract: writeApprove, data: approveTx, isPending: approving } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });

  const { sendTransaction, data: celoTx, isPending: sendingCelo } = useSendTransaction();
  const { isSuccess: celoSuccess } = useWaitForTransactionReceipt({ hash: celoTx });

  const { data: totalSold } = useReadContract({
    address: CHAMASALE_ADDRESS,
    abi: CHAMASALE_ABI,
    functionName: "totalChamaSold",
  });

  const { data: celoPriceData } = useReadContract({
    address: CHAMASALE_ADDRESS,
    abi: CHAMASALE_ABI,
    functionName: "celoPriceUsd",
  });

  useEffect(() => { if (buySuccess) toast("CHAMA tokens purchased! 🎉💰", "success"); }, [buySuccess]);
  useEffect(() => { if (approveSuccess) toast("cUSD approved! Now click Buy.", "success"); }, [approveSuccess]);
  useEffect(() => { if (celoSuccess) toast("CHAMA tokens purchased with CELO! 🎉", "success"); }, [celoSuccess]);

  const chamaYouGet = parseFloat(buyAmount || 0) * 10000;
  const celoPrice = celoPriceData ? Number(celoPriceData) / 1000 : 0.5;
  const celoEquivalent = parseFloat(buyAmount || 0) / celoPrice;

  const handleApproveCUSD = () => {
    if (!address) return toast("Connect wallet first", "error");
    writeApprove({
      address: REAL_CUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CHAMASALE_ADDRESS, parseUnits(buyAmount || "0", 18)],
    });
  };

  const handleBuyWithCUSD = () => {
    if (!address) return toast("Connect wallet first", "error");
    writeBuy({
      address: CHAMASALE_ADDRESS,
      abi: CHAMASALE_ABI,
      functionName: "buyWithCUSD",
      args: [parseUnits(buyAmount || "0", 18)],
    });
  };

  const handleBuyWithCELO = () => {
    if (!address) return toast("Connect wallet first", "error");
    sendTransaction({
      to: CHAMASALE_ADDRESS,
      value: parseUnits(celoEquivalent.toFixed(18), 18),
      data: "0xd96a094a", // buyWithCELO() function selector
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
              disabled={sendingCelo}
              style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 16 }}
            >
              {sendingCelo ? "⏳ Sending CELO..." : `🟡 Buy ${chamaYouGet.toLocaleString()} CHAMA with CELO`}
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
  });

  // Read user's chamas
  const { data: myChamas } = useReadContract({
    address: CHAMAVAULT_ADDRESS,
    abi: CHAMAVAULT_ABI,
    functionName: "getMemberChamas",
    args: address ? [address] : undefined,
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
