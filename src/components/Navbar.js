"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`} id="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" id="nav-logo">
          <img src="/logo.png" alt="ChamaVault" style={{ width: 40, height: 40, borderRadius: 10 }} />
          ChamaVault
        </Link>
        
        <ul className={`navbar-links ${mobileMenuOpen ? "active" : ""}`}>
          <li><Link href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link></li>
          <li><Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link></li>
          <li><Link href="#circles" onClick={() => setMobileMenuOpen(false)}>Live Circles</Link></li>
          <li className="mobile-only"><Link href="/app" className="btn btn-primary">Launch App</Link></li>
        </ul>

        <div className="navbar-actions">
          <Link href="/app" className="btn btn-primary desktop-only" id="nav-launch-btn">Launch App</Link>
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
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          z-index: 1001;
        }
        .bar {
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          transition: 0.3s;
          border-radius: 2px;
        }
        .mobile-only { display: none; }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle { display: flex; }
          .desktop-only { display: none; }
          .mobile-only { display: block; width: 100%; margin-top: 20px; }
          
          .navbar-links {
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
          .navbar-links.active {
            right: 0;
          }
          .navbar-links li {
            width: 100%;
            border-bottom: 1px solid var(--border-glass);
            padding: 15px 0;
          }
          .navbar-links li a {
            font-size: 18px;
            display: block;
            width: 100%;
          }
          
          .mobile-open .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
          .mobile-open .bar:nth-child(2) { opacity: 0; }
          .mobile-open .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
        }
      `}</style>
    </nav>
  );
}
