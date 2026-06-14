"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });
const Logo3D = dynamic(() => import("@/components/Logo3D"), { ssr: false });
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

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

  return (
    <>
      <Navbar />
      <ScrollToTop />

      {/* ===== HERO ===== */}
      <section className="hero" id="hero">
        <HeroScene />
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
            <Logo3D size={380} showText={true} interactive={true} />
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

      {/* ===== LIVE CIRCLES ===== */}
      <section className="section" id="circles">
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
              <Logo3D size={420} showText={true} interactive={true} />
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
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://t.me/proofofship" target="_blank" rel="noopener noreferrer">Telegram</a></li>
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
