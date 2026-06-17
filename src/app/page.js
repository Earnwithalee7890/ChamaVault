"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });
const Logo3D = dynamic(() => import("@/components/Logo3D"), { ssr: false });
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
import SocialConnect from "@/components/SocialConnect";

/* ---- Intersection Observer Hook ---- */
function useAnimateIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ---- Animated Counter ---- */
function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(timer); }
          else setVal(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ---- Sample Chama Data ---- */
const sampleCircles = [
  {
    name: "Nairobi Savers",
    status: "active",
    members: ["🇰🇪", "🇰🇪", "🇳🇬", "🇬🇭", "🇹🇿"],
    pot: "50 cUSD",
    frequency: "Weekly",
    round: "3 of 5",
    progress: 60,
  },
  {
    name: "Lagos Builders",
    status: "active",
    members: ["🇳🇬", "🇳🇬", "🇰🇪", "🇨🇲", "🇿🇦", "🇬🇭"],
    pot: "120 cUSD",
    frequency: "Bi-weekly",
    round: "2 of 6",
    progress: 33,
  },
  {
    name: "Accra Growth Club",
    status: "filling",
    members: ["🇬🇭", "🇬🇭", "🇬🇭"],
    pot: "30 cUSD",
    frequency: "Weekly",
    round: "Forming",
    progress: 15,
  },
];

const features = [
  { icon: "🔒", title: "Trustless Smart Contracts", desc: "No more broken promises. Smart contracts enforce contributions and payouts automatically — no middleman, no excuses." },
  { icon: "💸", title: "Stablecoin Powered", desc: "Save and receive in cUSD — no volatility, no exchange rate headaches. Your savings maintain their value." },
  { icon: "🌍", title: "Global Circles", desc: "Join savings circles with trusted members across borders. Chama, Susu, Tontine, Stokvel — one platform for all traditions." },
  { icon: "⚡", title: "Instant Payouts", desc: "When it's your turn, funds are released instantly to your MiniPay wallet. No delays, no bank processing." },
  { icon: "📊", title: "On-Chain Reputation", desc: "Build your savings reputation on-chain. Never miss a contribution? Your trust score grows with every cycle." },
  { icon: "🤖", title: "AI Insights", desc: "Smart recommendations for group sizes, contribution amounts, and savings strategies based on your patterns." },
];

const steps = [
  { num: "1", title: "Create a Circle", desc: "Set your contribution amount, frequency, and number of members. The smart contract handles the rest." },
  { num: "2", title: "Invite Members", desc: "Share your invite link. Members join by connecting their MiniPay wallet — simple and instant." },
  { num: "3", title: "Contribute Weekly", desc: "Each member contributes on schedule. The smart contract tracks everything transparently on-chain." },
  { num: "4", title: "Receive Your Pot", desc: "When it's your turn, the full pot is released to your wallet instantly. Then the cycle continues!" },
];

/* ---- Scroll To Top ---- */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);
  const scroll = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <button 
      className={`scroll-to-top ${visible ? "visible" : ""}`} 
      onClick={scroll}
      aria-label="Scroll to top"
    >
      ↑
      <style jsx>{`
        .scroll-to-top {
          position: fixed;
          bottom: 32px;
          left: 32px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          color: var(--accent-emerald);
          font-size: 20px;
          cursor: pointer;
          z-index: 1000;
          opacity: 0;
          transform: translateY(20px);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        .scroll-to-top.visible { opacity: 1; transform: translateY(0); }
        .scroll-to-top:hover { background: var(--accent-emerald); color: var(--bg-primary); transform: translateY(-5px); }
      `}</style>
    </button>
  );
}

export default function Home() {
  const featuresRef = useAnimateIn();
  const stepsRef = useAnimateIn();
  const circlesRef = useAnimateIn();
  const trustRef = useAnimateIn();
  const ctaRef = useAnimateIn();

  const [isMiniPay, setIsMiniPay] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
    }
  }, []);

  return (
    <>
      <Navbar />
      <ScrollToTop />

      {/* ===== HERO ===== */}
      <section className="hero" id="hero">
        {!isMiniPay && <HeroScene />}
        <div className="container hero-content hero-split">
          <div className="hero-text-side">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Built on Celo · Powered by MiniPay
            </div>
            <h1>
              Save Together,<br />
              <span className="animated-gradient-text" style={{ fontWeight: 900 }}>Grow Together.</span>
            </h1>
            <p>
              Africa&apos;s centuries-old rotating savings tradition — now trustless, transparent,
              and powered by stablecoins. Create or join a Chama circle and let smart contracts
              handle the trust.
            </p>
            <div className="hero-actions">
              <a href="/app" className="btn btn-primary shimmer-btn" id="hero-create-btn">
                ✨ Create a Circle
              </a>
              <a href="/app" className="btn btn-secondary" id="hero-join-btn">
                🔍 Join a Circle
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <h3 className="text-gradient"><Counter end={1240} suffix="+" /></h3>
                <p>Active Members</p>
              </div>
              <div className="hero-stat">
                <h3 className="text-gradient"><Counter end={85000} suffix="" /></h3>
                <p>cUSD Circulated</p>
              </div>
              <div className="hero-stat">
                <h3 className="text-gradient"><Counter end={320} suffix="" /></h3>
                <p>Circles Completed</p>
              </div>
            </div>
          </div>
          <div className="hero-logo-side">
            {isMiniPay ? (
              <img src="/icon.png" alt="ChamaVault Logo" style={{ width: 200, height: 200, borderRadius: 20 }} />
            ) : (
              <Logo3D size={380} showText={true} interactive={true} />
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Why <span className="text-gradient">ChamaVault</span>?</h2>
            <p>Traditional savings circles rely on trust. We replace trust with code — transparent, automatic, and unstoppable.</p>
          </div>
          <div className="features-grid animate-in" ref={featuresRef}>
            {features.map((f, i) => (
              <div className="glass-card feature-card" key={i} id={`feature-${i}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section" id="how-it-works" style={{ background: "rgba(17,24,39,0.4)" }}>
        <div className="container">
          <div className="section-header">
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Four simple steps. No middlemen. No broken promises.</p>
          </div>
          <div className="steps-container animate-in" ref={stepsRef}>
            {steps.map((s, i) => (
              <div className="glass-card step-card" key={i} id={`step-${i}`}>
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL CONNECT BOOSTER ===== */}
      <section className="section" id="social-connect">
        <div className="container">
          <div className="section-header">
            <h2><span className="text-gradient">No Wallets?</span> No Problem.</h2>
            <p>Built for the real world. Invite friends to your circle using just their phone number via Celo SocialConnect.</p>
          </div>
          <div className="animate-in" ref={circlesRef}>
            <SocialConnect />
          </div>
        </div>
      </section>

      {/* ===== LIVE CIRCLES ===== */}
      <section className="section" id="circles" style={{ background: "rgba(17,24,39,0.4)" }}>
        <div className="container">
          <div className="section-header">
            <h2>Live <span className="text-gradient">Circles</span></h2>
            <p>Real savings circles running right now on Celo. Join one or start your own.</p>
          </div>
          <div className="circles-preview animate-in" ref={circlesRef}>
            {sampleCircles.map((c, i) => (
              <div className="glass-card circle-card" key={i} id={`circle-${i}`}>
                <div className="circle-header">
                  <h4>{c.name}</h4>
                  <span className={`circle-status ${c.status}`}>{c.status === "active" ? "🟢 Active" : "🟡 Forming"}</span>
                </div>
                <div className="circle-members">
                  {c.members.map((m, j) => (
                    <div
                      className="circle-avatar"
                      key={j}
                      style={{ background: `hsl(${j * 50 + 140}, 60%, 25%)` }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                </div>
                <div className="circle-details" style={{ marginTop: 16 }}>
                  <div className="circle-detail">
                    <label>Pot Size</label>
                    <span className="text-gradient">{c.pot}</span>
                  </div>
                  <div className="circle-detail">
                    <label>Frequency</label>
                    <span>{c.frequency}</span>
                  </div>
                  <div className="circle-detail">
                    <label>Round</label>
                    <span>{c.round}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST METRICS ===== */}
      <section className="section" id="trust" style={{ background: "rgba(17,24,39,0.4)" }}>
        <div className="container">
          <div className="section-header">
            <h2>Trusted by <span className="text-gradient">Builders</span></h2>
            <p>Transparent, verifiable, and running on Celo mainnet.</p>
          </div>
          <div className="trust-grid animate-in" ref={trustRef}>
            <div className="glass-card trust-item">
              <div className="trust-value text-gradient"><Counter end={99} suffix="%" /></div>
              <div className="trust-label">On-Time Contribution Rate</div>
            </div>
            <div className="glass-card trust-item">
              <div className="trust-value text-gradient"><Counter end={0} suffix="" /></div>
              <div className="trust-label">Missed Payouts</div>
            </div>
            <div className="glass-card trust-item">
              <div className="trust-value text-gradient"><Counter end={14} suffix="M+" /></div>
              <div className="trust-label">MiniPay Wallets Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOGO SHOWCASE ===== */}
      <section className="section logo-showcase-section" id="brand">
        <div className="container">
          <div className="section-header">
            <h2>The <span className="text-gradient">ChamaVault</span> Symbol</h2>
            <p>A vault of trust, surrounded by a community of savers — our 3D animated logo represents the fusion of security and togetherness.</p>
          </div>
          <div className="logo-showcase animate-in" ref={ctaRef}>
            <div className="logo-showcase-3d">
              {isMiniPay ? (
                 <img src="/icon.png" alt="ChamaVault Logo" style={{ width: 200, height: 200, borderRadius: 20 }} />
              ) : (
                 <Logo3D size={420} showText={true} interactive={true} />
              )}
            </div>
            <div className="logo-showcase-details">
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>🔐 The Vault Door</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>The central metallic vault represents the security of smart contracts — your funds are locked and managed by immutable code, not promises.</p>
              </div>
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>🟢 Orbiting Members</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>Eight colorful nodes orbit the vault, each representing a member of the savings circle. Connected by energy arcs, they symbolize trust and community.</p>
              </div>
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>✨ Living Design</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>The logo breathes, pulses, and responds to your mouse — representing that ChamaVault is alive, always running, always protecting your savings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section animate-in" ref={ctaRef} id="cta">
        <div className="container">
          <h2>
            Ready to <span className="animated-gradient-text">Save Smarter</span>?
          </h2>
          <p>
            Join thousands of members across Africa building wealth together — one circle at a time.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <a href="/app" className="btn btn-primary shimmer-btn" id="cta-create-btn">
              🚀 Create Your Circle Now
            </a>
            <a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" id="cta-learn-btn">
              📖 Read the Docs
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-inner">
            <a href="#" className="navbar-logo">
              <img src="/logo.png" alt="ChamaVault" style={{ width: 40, height: 40, borderRadius: 10 }} />
              ChamaVault
            </a>
            
            <div className="footer-socials">
              <a href="https://x.com/aleeasghar78" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X (formerly Twitter)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://t.me/proofofship" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </a>
              <a href="https://discord.gg/chama" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Discord">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>
              </a>
              <a href="https://github.com/Earnwithalee7890/ChamaVault" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="https://medium.com/chamavault" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 1 1-6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42s-3.38-2.88-3.38-6.42 1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.39 5.75-.86 5.75s-.86-2.58-.86-5.75.39-5.75.86-5.75S24 8.83 24 12z"/></svg>
              </a>
            </div>

            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
            
            <p className="footer-copy">
              &copy; 2026 ChamaVault. Built with ❤️ on Celo.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
