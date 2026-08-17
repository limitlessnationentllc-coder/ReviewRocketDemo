import { useState, useEffect, useRef, useCallback } from "react";

// ── Color tokens ──────────────────────────────────────────────
const T = {
  noir:    "#0A0608",
  cherry:  "#4A0D1A",
  lacquer: "#7A1828",
  glaze:   "#9B2335",
  ivory:   "#F0EBE1",
  cream:   "#D8D0C4",
  charcoal:"#2A2428",
  gold:    "#B8960C",
};

// ── Global styles injected once ───────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500&display=swap');

  .inge-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .inge-root {
    background: ${T.noir};
    color: ${T.ivory};
    font-family: 'Montserrat', system-ui, sans-serif;
    font-weight: 300;
    overflow-x: hidden;
    min-height: 100vh;
  }
  .inge-root a { color: inherit; text-decoration: none; cursor: pointer; }
  .inge-root button { border: none; background: none; font: inherit; color: inherit; cursor: pointer; }

  /* Nav */
  .inge-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    padding: 22px 48px;
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(to bottom, rgba(10,6,8,0.85) 0%, transparent 100%);
    transition: padding 0.4s;
  }
  .inge-nav.scrolled { padding: 14px 48px; background: rgba(10,6,8,0.95); }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem; font-weight: 500;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: ${T.ivory}; cursor: pointer;
  }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a {
    font-size: 0.6rem; font-weight: 400;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: ${T.cream}; opacity: 0.7;
    transition: opacity 0.2s;
  }
  .nav-links a:hover { opacity: 1; color: ${T.ivory}; }
  .nav-actions { display: flex; gap: 20px; align-items: center; }
  .nav-btn {
    font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: ${T.cream}; opacity: 0.7; transition: opacity 0.2s;
  }
  .nav-btn:hover { opacity: 1; }
  .bag-dot {
    display: inline-flex; align-items: center; justify-content: center;
    width: 15px; height: 15px; border-radius: 50%;
    background: ${T.glaze}; font-size: 0.45rem; color: ${T.ivory};
    margin-left: 6px; font-weight: 500;
  }
  @media(max-width:768px){
    .inge-nav { padding: 16px 20px; }
    .nav-links { display: none; }
  }

  /* Hero film */
  .hero-film {
    position: relative; height: 100vh; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    background: ${T.noir};
  }
  .hero-vignette {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, transparent 25%, rgba(10,6,8,0.7) 100%);
    z-index: 2; pointer-events: none;
  }
  .hero-cherry {
    position: absolute; z-index: 3;
    width: min(320px, 50vw);
    filter: drop-shadow(0 0 80px rgba(74,13,26,0.5));
    transition: transform 0.1s linear, opacity 0.1s linear;
  }
  .hero-lacquer {
    position: absolute; inset: 0; z-index: 4; pointer-events: none;
    background: radial-gradient(ellipse at 50% 40%, rgba(74,13,26,0) 0%, rgba(74,13,26,0.95) 55%, rgba(10,6,8,1) 100%);
    transition: opacity 0.1s linear;
  }
  .hero-beat {
    position: absolute; z-index: 10;
    text-align: center; width: 100%; padding: 0 24px;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  .beat-tagline { top: 50%; transform: translateY(-50%); }
  .beat-tagline h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(3.5rem, 10vw, 8rem); font-weight: 300;
    letter-spacing: 0.18em; text-transform: uppercase; line-height: 1;
    color: ${T.ivory};
  }
  .beat-tagline h1 em { font-style: italic; color: ${T.glaze}; }
  .beat-tagline p {
    margin-top: 16px; font-size: 0.6rem; letter-spacing: 0.4em;
    text-transform: uppercase; color: ${T.cream}; opacity: 0.6;
  }
  .beat-transform {
    top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .t-step { font-size: 0.55rem; letter-spacing: 0.4em; text-transform: uppercase; color: ${T.glaze}; }
  .t-arrow { font-size: 0.5rem; color: ${T.lacquer}; }
  .beat-couture { top: 50%; transform: translateY(-50%); }
  .beat-couture h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5.5vw, 4.5rem); font-weight: 300;
    letter-spacing: 0.2em; text-transform: uppercase; line-height: 1.1; color: ${T.ivory};
  }
  .couture-rule {
    width: 1px; height: 50px;
    background: ${T.glaze}; margin: 22px auto;
  }
  .beat-couture p { font-size: 0.58rem; letter-spacing: 0.35em; text-transform: uppercase; color: ${T.glaze}; }
  .beat-inge { top: 50%; transform: translateY(-50%); }
  .inge-wm {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(4rem, 16vw, 14rem); font-weight: 300;
    letter-spacing: 0.25em; text-transform: uppercase;
    color: ${T.ivory}; line-height: 1; display: inline-block;
    overflow: hidden;
  }
  .inge-wm .cherry-e { color: ${T.glaze}; }
  .inge-sub {
    font-size: 0.52rem; letter-spacing: 0.5em; text-transform: uppercase;
    color: ${T.cream}; margin-top: 14px;
    transition: opacity 0.4s;
  }
  .scroll-hint {
    position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
    z-index: 10; text-align: center;
    font-size: 0.48rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: ${T.cream}; opacity: 0.35;
    animation: pulse-hint 2s ease-in-out infinite;
  }
  @keyframes pulse-hint { 0%,100%{opacity:0.35} 50%{opacity:0.65} }

  /* Doors section */
  .doors-section {
    position: relative; height: 100vh; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    background: ${T.noir};
  }
  .door { position: absolute; top: 0; height: 100%; width: 50%; z-index: 5; overflow: hidden; }
  .door-l { left: 0; transform-origin: left; }
  .door-r { right: 0; transform-origin: right; }
  .door-panel {
    position: absolute; inset: 0;
    border: none;
  }
  .door-panel-l {
    background: linear-gradient(to right, #1a0609 0%, ${T.cherry} 40%, #3d0e18 100%);
  }
  .door-panel-r {
    background: linear-gradient(to left, #1a0609 0%, ${T.cherry} 40%, #3d0e18 100%);
  }
  .door-mold {
    position: absolute; inset: 16px;
    border: 1px solid rgba(184,150,12,0.13); pointer-events: none;
  }
  .door-mold::after {
    content: ''; position: absolute; inset: 10px;
    border: 1px solid rgba(184,150,12,0.06);
  }
  .door-knob {
    position: absolute; top: 50%; width: 12px; height: 12px;
    border-radius: 50%; background: ${T.gold};
    box-shadow: 0 0 16px rgba(184,150,12,0.35);
    transform: translateY(-50%);
  }
  .door-l .door-knob { right: 16px; }
  .door-r .door-knob { left: 16px; }
  .door-interior {
    position: absolute; inset: 0; z-index: 3;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px;
  }
  .door-interior-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, rgba(74,13,26,0.12) 0%, ${T.noir} 65%);
  }
  .enter-head { position: relative; z-index:1; text-align: center; }
  .enter-head h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.6rem, 4vw, 3.2rem); font-weight: 300;
    letter-spacing: 0.28em; text-transform: uppercase; line-height: 1.25; color: ${T.ivory};
  }
  .enter-head h2 em { font-style: italic; color: ${T.glaze}; }
  .enter-head p { margin-top: 12px; font-size: 0.58rem; letter-spacing: 0.38em; text-transform: uppercase; color: ${T.cream}; opacity: 0.55; }
  .btn-enter {
    position: relative; z-index:1;
    display: inline-flex; align-items: center; gap: 14px;
    padding: 16px 44px;
    border: 1px solid rgba(184,150,12,0.32);
    font-size: 0.58rem; font-weight: 400;
    letter-spacing: 0.42em; text-transform: uppercase; color: ${T.ivory};
    background: transparent;
    transition: border-color 0.4s, background 0.4s;
  }
  .btn-enter:hover { border-color: ${T.gold}; background: rgba(184,150,12,0.07); }
  .btn-enter-arrow { color: ${T.glaze}; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; }

  /* Marquee */
  .marquee-wrap {
    overflow: hidden; padding: 48px 0;
    background: ${T.charcoal};
    border-top: 1px solid rgba(240,235,225,0.04);
    border-bottom: 1px solid rgba(240,235,225,0.04);
  }
  .marquee-track {
    display: flex; white-space: nowrap; will-change: transform;
  }
  .marquee-item {
    display: inline-flex; align-items: center; gap: 32px; padding: 0 32px;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1rem, 2vw, 1.6rem); font-weight: 300;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(240,235,225,0.18); flex-shrink: 0;
  }
  .marquee-sep {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: ${T.glaze}; opacity: 0.4;
  }

  /* Section: house intro */
  .house-intro {
    text-align: center; padding: 120px 24px 80px;
    position: relative;
  }
  .eyebrow {
    font-size: 0.5rem; letter-spacing: 0.55em; text-transform: uppercase;
    color: ${T.glaze}; margin-bottom: 20px;
  }
  .section-h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 4rem); font-weight: 300;
    letter-spacing: 0.1em; color: ${T.ivory}; line-height: 1.2; margin-bottom: 24px;
  }
  .section-h2 em { font-style: italic; color: ${T.glaze}; }
  .section-p {
    font-size: 0.7rem; letter-spacing: 0.12em; color: ${T.cream};
    opacity: 0.55; max-width: 480px; margin: 0 auto; line-height: 2.2;
  }

  /* Departments grid */
  .dept-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px; margin: 0;
  }
  @media(max-width:900px){ .dept-grid { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:580px){ .dept-grid { grid-template-columns: 1fr; } }

  .dept-card {
    position: relative; height: clamp(220px, 28vw, 360px);
    overflow: hidden; cursor: pointer;
    display: flex; align-items: flex-end;
  }
  .dept-card.tall {
    grid-row: span 2; height: auto; min-height: clamp(440px, 56vw, 720px);
  }
  .dept-bg {
    position: absolute; inset: 0;
    transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .dept-card:hover .dept-bg { transform: scale(1.05); }
  .dept-motif {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(5rem, 11vw, 12rem); font-weight: 300;
    color: rgba(240,235,225,0.035); transition: opacity 0.4s;
    pointer-events: none;
  }
  .dept-card:hover .dept-motif { opacity: 2; }
  .dept-gold-line {
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, ${T.gold}, transparent);
    opacity: 0; transition: opacity 0.4s; z-index: 5;
  }
  .dept-card:hover .dept-gold-line { opacity: 0.45; }
  .dept-info {
    position: relative; z-index: 3; padding: 24px 28px; width: 100%;
    background: linear-gradient(to top, rgba(10,6,8,0.92) 0%, transparent 100%);
    transform: translateY(6px); transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  .dept-card:hover .dept-info { transform: translateY(0); }
  .dept-num { font-size: 0.42rem; letter-spacing: 0.38em; text-transform: uppercase; color: ${T.glaze}; margin-bottom: 6px; }
  .dept-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1rem, 2vw, 1.5rem); font-weight: 300;
    letter-spacing: 0.1em; text-transform: uppercase; color: ${T.ivory}; margin-bottom: 4px;
  }
  .dept-sub {
    font-size: 0.5rem; letter-spacing: 0.22em; text-transform: uppercase;
    color: ${T.cream}; opacity: 0; transition: opacity 0.4s;
  }
  .dept-card:hover .dept-sub { opacity: 0.5; }
  .dept-arrow {
    position: absolute; top: 24px; right: 28px; z-index: 4;
    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
    color: ${T.glaze}; opacity: 0;
    transform: translateX(-8px);
    transition: opacity 0.35s, transform 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .dept-card:hover .dept-arrow { opacity: 1; transform: translateX(0); }

  /* Statement */
  .statement-sec {
    padding: 120px 48px; text-align: center; background: ${T.noir};
    display: flex; flex-direction: column; align-items: center;
  }
  .statement-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.8rem, 5vw, 4.5rem); font-weight: 300;
    letter-spacing: 0.08em; color: ${T.ivory}; line-height: 1.3;
    max-width: 860px;
  }
  .statement-text em { font-style: italic; color: ${T.glaze}; }
  .statement-rule {
    width: 1px; height: 70px;
    background: linear-gradient(to bottom, ${T.glaze}, transparent);
    margin: 40px auto 0;
  }

  /* Private Collection */
  .private-sec {
    padding: 140px 48px; text-align: center; background: ${T.noir};
    display: flex; flex-direction: column; align-items: center;
    position: relative; overflow: hidden;
  }
  .private-sec::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at center top, rgba(74,13,26,0.22) 0%, transparent 55%);
    pointer-events: none;
  }
  .private-label-text {
    font-size: 0.5rem; letter-spacing: 0.58em; text-transform: uppercase;
    color: ${T.glaze}; margin-bottom: 28px; position: relative; z-index:1;
  }
  .private-label-text::before, .private-label-text::after { content: '—'; margin: 0 12px; opacity: 0.4; }
  .private-h {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.2rem, 6.5vw, 5.5rem); font-weight: 300;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: ${T.ivory}; line-height: 1.05; margin-bottom: 18px; position: relative; z-index:1;
  }
  .private-h em { font-style: italic; color: ${T.glaze}; display: block; }
  .private-copy { font-size: 0.68rem; letter-spacing: 0.13em; color: ${T.cream}; opacity: 0.52; max-width: 420px; line-height: 2.2; margin-bottom: 48px; position: relative; z-index:1; }
  .private-cta-link {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 0.52rem; letter-spacing: 0.42em; text-transform: uppercase;
    color: ${T.gold}; border-bottom: 1px solid rgba(184,150,12,0.28);
    padding-bottom: 6px; transition: gap 0.3s, border-color 0.3s;
    position: relative; z-index:1;
  }
  .private-cta-link:hover { gap: 18px; border-color: ${T.gold}; }

  /* Wax seal */
  .wax-seal { margin-bottom: 40px; position: relative; z-index:1; }

  /* Concierge */
  .concierge-sec {
    padding: 110px 48px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
    background: ${T.charcoal};
  }
  @media(max-width:768px){ .concierge-sec { grid-template-columns: 1fr; gap: 40px; padding: 80px 24px; } }
  .conc-h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.8rem, 3.8vw, 3.2rem); font-weight: 300;
    letter-spacing: 0.07em; color: ${T.ivory}; line-height: 1.25; margin-bottom: 20px;
  }
  .conc-h2 em { font-style: italic; color: ${T.glaze}; }
  .conc-p { font-size: 0.68rem; letter-spacing: 0.1em; color: ${T.cream}; opacity: 0.52; line-height: 2.2; margin-bottom: 36px; }
  .conc-services {
    list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; margin-bottom: 40px;
  }
  .conc-services li {
    font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: ${T.cream}; opacity: 0.48; display: flex; align-items: center; gap: 8px;
  }
  .conc-services li::before { content: ''; display: inline-block; width: 4px; height: 1px; background: ${T.glaze}; }
  .btn-conc {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 15px 36px; border: 1px solid rgba(155,35,53,0.38);
    font-size: 0.52rem; letter-spacing: 0.38em; text-transform: uppercase;
    color: ${T.ivory}; transition: border-color 0.4s, background 0.4s;
  }
  .btn-conc:hover { border-color: ${T.glaze}; background: rgba(155,35,53,0.06); }
  .conc-visual {
    height: clamp(300px, 45vw, 500px);
    background: linear-gradient(135deg, #0a0608 0%, ${T.cherry} 50%, #1a0609 100%);
    position: relative; overflow: hidden;
    display: flex; align-items: flex-end; padding: 28px;
  }
  .conc-visual::after {
    content: 'INGÉ'; position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(3rem, 8vw, 8rem); font-weight: 300;
    letter-spacing: 0.3em; color: rgba(240,235,225,0.04); pointer-events: none;
  }
  .conc-tag {
    position: relative; z-index: 1; width: 100%;
    padding: 18px 20px; border: 1px solid rgba(184,150,12,0.18);
    background: rgba(10,6,8,0.82); backdrop-filter: blur(6px);
  }
  .conc-tag-label { font-size: 0.42rem; letter-spacing: 0.38em; text-transform: uppercase; color: ${T.gold}; margin-bottom: 6px; }
  .conc-tag-text { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 300; letter-spacing: 0.07em; color: ${T.ivory}; }

  /* Originals */
  .originals-sec {
    padding: 140px 48px; text-align: center; background: ${T.noir};
    position: relative; overflow: hidden;
  }
  .originals-sec::before {
    content: 'INGÉ'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(8rem, 22vw, 26rem); font-weight: 300; letter-spacing: 0.2em;
    color: transparent; -webkit-text-stroke: 1px rgba(74,13,26,0.18);
    pointer-events: none; white-space: nowrap;
  }
  .orig-content { position: relative; z-index:1; }
  .orig-h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.2rem, 5.5vw, 4.5rem); font-weight: 300;
    letter-spacing: 0.11em; text-transform: uppercase; color: ${T.ivory}; line-height: 1.1; margin-bottom: 18px;
  }
  .orig-h2 em { font-style: italic; color: ${T.glaze}; display: block; }
  .orig-p { font-size: 0.68rem; letter-spacing: 0.13em; color: ${T.cream}; opacity: 0.48; max-width: 380px; margin: 0 auto 40px; line-height: 2.2; }
  .orig-status {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 0.48rem; letter-spacing: 0.38em; text-transform: uppercase; color: ${T.glaze};
  }
  .orig-status::before, .orig-status::after { content: ''; display: inline-block; width: 36px; height: 1px; background: ${T.glaze}; opacity: 0.4; }

  /* Story */
  .story-sec {
    padding: 110px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
    background: ${T.cherry}; position: relative; overflow: hidden;
  }
  .story-sec::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(10,6,8,0.88) 0%, rgba(74,13,26,0.55) 50%, rgba(10,6,8,0.82) 100%);
  }
  @media(max-width:768px){ .story-sec { grid-template-columns: 1fr; gap: 40px; padding: 80px 24px; } }
  .story-visual-box {
    position: relative; z-index:1;
    aspect-ratio: 3/4; border: 1px solid rgba(184,150,12,0.1);
    background: linear-gradient(to bottom, rgba(10,6,8,0.25), rgba(10,6,8,0.65));
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .story-mark {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(3rem, 10vw, 9rem); font-weight: 300; letter-spacing: 0.2em;
    color: rgba(155,35,53,0.32); text-transform: uppercase;
  }
  .story-caption { margin-top: 12px; font-size: 0.47rem; letter-spacing: 0.38em; text-transform: uppercase; color: ${T.gold}; opacity: 0.55; text-align: center; position: relative; z-index:1; }
  .story-text { position: relative; z-index:1; }
  .story-h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.8rem, 3.8vw, 3.2rem); font-weight: 300;
    letter-spacing: 0.07em; color: ${T.ivory}; line-height: 1.3; margin-bottom: 22px;
  }
  .story-h2 em { font-style: italic; color: ${T.glaze}; }
  .story-p { font-size: 0.68rem; letter-spacing: 0.1em; color: ${T.cream}; opacity: 0.55; line-height: 2.2; margin-bottom: 14px; }
  .story-link {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 28px;
    font-size: 0.52rem; letter-spacing: 0.38em; text-transform: uppercase;
    color: ${T.gold}; border-bottom: 1px solid rgba(184,150,12,0.22);
    padding-bottom: 6px; transition: gap 0.3s, border-color 0.3s;
  }
  .story-link:hover { gap: 16px; border-color: ${T.gold}; }

  /* Invite */
  .invite-sec {
    padding: 140px 48px; text-align: center; background: ${T.noir};
    position: relative;
  }
  .invite-sec::before {
    content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 1px; height: 100px;
    background: linear-gradient(to bottom, ${T.glaze}, transparent);
  }
  .invite-h { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem, 4.5vw, 3.5rem); font-weight: 300; letter-spacing: 0.13em; text-transform: uppercase; color: ${T.ivory}; margin-bottom: 16px; line-height: 1.2; }
  .invite-h em { font-style: italic; color: ${T.glaze}; }
  .invite-copy { font-size: 0.68rem; letter-spacing: 0.12em; color: ${T.cream}; opacity: 0.48; max-width: 360px; margin: 0 auto 48px; line-height: 2.2; }
  .invite-form { display: flex; flex-direction: column; max-width: 420px; margin: 0 auto 32px; }
  .invite-field {
    width: 100%; padding: 16px 20px;
    background: transparent; color: ${T.ivory};
    border: 1px solid rgba(240,235,225,0.1); border-bottom: none;
    font-family: 'Montserrat', sans-serif; font-size: 0.62rem; letter-spacing: 0.1em;
    outline: none; transition: border-color 0.3s;
  }
  .invite-field:last-of-type { border-bottom: 1px solid rgba(240,235,225,0.1); }
  .invite-field::placeholder { color: ${T.cream}; opacity: 0.28; letter-spacing: 0.18em; text-transform: uppercase; font-size: 0.52rem; }
  .invite-field:focus { border-color: rgba(155,35,53,0.45); }
  .btn-apply {
    margin-top: 20px; padding: 16px 52px;
    background: ${T.glaze}; border: 1px solid ${T.glaze};
    font-size: 0.52rem; letter-spacing: 0.42em; text-transform: uppercase; color: ${T.ivory};
    transition: background 0.4s, border-color 0.4s;
  }
  .btn-apply:hover { background: ${T.lacquer}; border-color: ${T.lacquer}; }
  .invite-disc { font-size: 0.47rem; letter-spacing: 0.16em; color: ${T.cream}; opacity: 0.22; }

  /* Footer */
  .inge-footer { background: ${T.charcoal}; padding: 72px 48px 40px; position: relative; }
  .inge-footer::before {
    content: ''; position: absolute; top: 0; left: 48px; right: 48px; height: 1px;
    background: linear-gradient(to right, transparent, rgba(184,150,12,0.18), transparent);
  }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 52px; margin-bottom: 64px; }
  @media(max-width:900px){ .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; } }
  @media(max-width:580px){ .footer-grid { grid-template-columns: 1fr; } }
  .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 300; letter-spacing: 0.32em; text-transform: uppercase; color: ${T.ivory}; margin-bottom: 16px; }
  .footer-brand-p { font-size: 0.58rem; letter-spacing: 0.1em; color: ${T.cream}; opacity: 0.38; line-height: 2; max-width: 240px; }
  .footer-social { display: flex; gap: 18px; margin-top: 24px; }
  .footer-social a { font-size: 0.47rem; letter-spacing: 0.28em; text-transform: uppercase; color: ${T.cream}; opacity: 0.32; transition: opacity 0.3s, color 0.3s; }
  .footer-social a:hover { opacity: 0.8; color: ${T.glaze}; }
  .footer-col-h { font-size: 0.47rem; letter-spacing: 0.42em; text-transform: uppercase; color: ${T.glaze}; margin-bottom: 18px; }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a { font-size: 0.58rem; letter-spacing: 0.13em; color: ${T.cream}; opacity: 0.37; transition: opacity 0.3s, color 0.3s; }
  .footer-col a:hover { opacity: 0.75; color: ${T.ivory}; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 28px; border-top: 1px solid rgba(240,235,225,0.045); }
  .footer-bottom p { font-size: 0.47rem; letter-spacing: 0.15em; color: ${T.cream}; opacity: 0.22; }
  .footer-cherry { font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: ${T.glaze}; opacity: 0.38; }

  /* Inner page */
  .inner-page { min-height: 100vh; background: ${T.noir}; padding-top: 80px; }
  .inner-hero {
    height: 55vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; background: ${T.charcoal}; position: relative; overflow: hidden;
  }
  .inner-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, rgba(74,13,26,0.2) 0%, transparent 60%);
  }
  .inner-hero-num { font-size: 0.45rem; letter-spacing: 0.5em; text-transform: uppercase; color: ${T.glaze}; margin-bottom: 16px; position: relative; z-index:1; }
  .inner-hero-h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.5rem, 7vw, 6rem); font-weight: 300;
    letter-spacing: 0.2em; text-transform: uppercase; color: ${T.ivory}; position: relative; z-index:1;
  }
  .inner-hero-sub { font-size: 0.55rem; letter-spacing: 0.35em; text-transform: uppercase; color: ${T.cream}; opacity: 0.5; margin-top: 14px; position: relative; z-index:1; }
  .inner-gold-rule {
    width: 1px; height: 60px; background: ${T.glaze}; margin: 32px auto 0; position: relative; z-index:1;
  }
  .product-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 2px;
  }
  @media(max-width:768px){ .product-grid { grid-template-columns: repeat(2,1fr); } }
  .product-card {
    position: relative; aspect-ratio: 3/4; background: ${T.charcoal};
    overflow: hidden; cursor: pointer; display: flex; align-items: flex-end;
  }
  .product-bg { position: absolute; inset: 0; transition: transform 0.6s cubic-bezier(0.16,1,0.3,1); }
  .product-card:hover .product-bg { transform: scale(1.04); }
  .product-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,6,8,0.88) 0%, transparent 50%);
  }
  .product-info {
    position: relative; z-index:2; padding: 20px 22px; width: 100%;
    transform: translateY(4px); transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .product-card:hover .product-info { transform: translateY(0); }
  .product-tag { font-size: 0.4rem; letter-spacing: 0.35em; text-transform: uppercase; color: ${T.glaze}; margin-bottom: 5px; }
  .product-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(0.9rem, 1.8vw, 1.25rem); font-weight: 300;
    letter-spacing: 0.08em; color: ${T.ivory}; margin-bottom: 4px;
  }
  .product-price { font-size: 0.52rem; letter-spacing: 0.2em; color: ${T.cream}; opacity: 0.65; }
  .product-add {
    font-size: 0.42rem; letter-spacing: 0.32em; text-transform: uppercase;
    color: ${T.ivory}; opacity: 0; transition: opacity 0.35s;
    background: rgba(155,35,53,0.7); padding: 8px 14px; margin-top: 8px; display: inline-block;
  }
  .product-card:hover .product-add { opacity: 1; }

  /* Scroll-reveal */
  .reveal {
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
`;

// ── Cherry SVG (from original brand mark) ────────────────────
function CherrySVG({ style }) {
  return (
    <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" fill="none" style={style}>
      <path d="M160 30 C120 20 90 50 100 80 C130 60 155 35 160 30Z" fill="#1a2e1a" stroke="#2a3e2a" strokeWidth="0.5"/>
      <path d="M160 30 C200 22 225 55 215 82 C185 65 162 38 160 30Z" fill="#142614" stroke="#2a3e2a" strokeWidth="0.5"/>
      <path d="M160 30 C145 50 105 72 100 80" stroke="#0d1a0d" strokeWidth="0.8" opacity="0.6"/>
      <path d="M160 30 C175 52 210 74 215 82" stroke="#0d1a0d" strokeWidth="0.8" opacity="0.6"/>
      <path d="M100 85 C95 140 80 185 75 230" stroke="#1a1a0a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M160 38 C158 80 155 140 155 200" stroke="#1a1a0a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M215 87 C220 140 235 185 240 230" stroke="#1a1a0a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M75 230 C100 200 155 200 155 200 C155 200 200 200 240 230" stroke="#1a1a0a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="75" cy="265" rx="52" ry="54" fill="url(#cg-l)"/>
      <ellipse cx="62" cy="250" rx="18" ry="16" fill="rgba(155,35,53,0.2)" opacity="0.5"/>
      <ellipse cx="68" cy="248" rx="8" ry="6" fill="rgba(240,235,225,0.08)"/>
      <ellipse cx="160" cy="258" rx="56" ry="58" fill="url(#cg-c)"/>
      <ellipse cx="145" cy="242" rx="20" ry="17" fill="rgba(155,35,53,0.2)" opacity="0.5"/>
      <ellipse cx="152" cy="240" rx="9" ry="7" fill="rgba(240,235,225,0.08)"/>
      <ellipse cx="240" cy="265" rx="52" ry="54" fill="url(#cg-r)"/>
      <ellipse cx="227" cy="250" rx="18" ry="16" fill="rgba(155,35,53,0.2)" opacity="0.5"/>
      <ellipse cx="233" cy="248" rx="8" ry="6" fill="rgba(240,235,225,0.08)"/>
      <path d="M58 318 Q56 338 54 352 Q53 360 56 364 Q60 370 65 364 Q68 360 67 352 Q65 338 63 318Z" fill="url(#dg)" opacity="0.9"/>
      <ellipse cx="60" cy="365" rx="5" ry="3" fill="url(#dg)" opacity="0.6"/>
      <path d="M153 316 Q151 342 149 360 Q148 370 152 375 Q157 382 163 375 Q167 370 166 360 Q164 342 162 316Z" fill="url(#dg)" opacity="0.95"/>
      <ellipse cx="157" cy="376" rx="6" ry="3.5" fill="url(#dg)" opacity="0.55"/>
      <path d="M228 318 Q226 340 224 355 Q223 364 227 368 Q231 374 236 368 Q240 364 239 355 Q237 340 235 318Z" fill="url(#dg)" opacity="0.9"/>
      <ellipse cx="232" cy="369" rx="5" ry="3" fill="url(#dg)" opacity="0.6"/>
      <defs>
        <radialGradient id="cg-l" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#7A1828"/>
          <stop offset="45%" stopColor="#4A0D1A"/>
          <stop offset="100%" stopColor="#1a0508"/>
        </radialGradient>
        <radialGradient id="cg-c" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#9B2335"/>
          <stop offset="45%" stopColor="#5A1020"/>
          <stop offset="100%" stopColor="#1a0508"/>
        </radialGradient>
        <radialGradient id="cg-r" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#7A1828"/>
          <stop offset="45%" stopColor="#4A0D1A"/>
          <stop offset="100%" stopColor="#1a0508"/>
        </radialGradient>
        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B2335"/>
          <stop offset="50%" stopColor="#5A1020"/>
          <stop offset="100%" stopColor="#2a0810" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Wax Seal SVG ──────────────────────────────────────────────
function WaxSeal() {
  return (
    <svg width="80" height="80" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="seal-g" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#9B2335"/>
          <stop offset="55%" stopColor="#4A0D1A"/>
          <stop offset="100%" stopColor="#1a0508"/>
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="43" fill="url(#seal-g)" stroke="rgba(184,150,12,0.22)" strokeWidth="0.5"/>
      <circle cx="45" cy="45" r="37" fill="none" stroke="rgba(184,150,12,0.12)" strokeWidth="0.5"/>
      <text x="45" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="300" fill="rgba(240,235,225,0.82)" letterSpacing="1">I</text>
      <circle cx="20" cy="45" r="1" fill="rgba(184,150,12,0.28)"/>
      <circle cx="70" cy="45" r="1" fill="rgba(184,150,12,0.28)"/>
      <circle cx="45" cy="20" r="1" fill="rgba(184,150,12,0.28)"/>
      <circle cx="45" cy="70" r="1" fill="rgba(184,150,12,0.28)"/>
    </svg>
  );
}

// ── Scroll reveal hook ────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

// ── Hero film — scroll-driven ─────────────────────────────────
function HeroFilm() {
  const [scrollP, setScrollP] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const h = window.innerHeight;
      const p = Math.max(0, Math.min(1, window.scrollY / (h * 3)));
      setScrollP(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const p = scrollP;

  // Cherry: fades in 0→0.1, stays 0.1→0.35, fades+scales out 0.35→0.5
  const cherryOpacity = p < 0.10 ? p / 0.10 : p < 0.35 ? 1 : Math.max(0, 1 - (p - 0.35) / 0.15);
  const cherryScale = p < 0.10 ? 0.7 + 0.3 * (p / 0.10) : p < 0.35 ? 1 : 1 + ((p - 0.35) / 0.15) * 0.3;

  // Lacquer flood: 0.40→0.60
  const lacquerOpacity = p > 0.40 ? Math.min(0.92, (p - 0.40) / 0.20 * 0.92) : 0;
  const lacquerFade = p > 0.60 ? lacquerOpacity - ((p - 0.60) / 0.12) * 0.65 : lacquerOpacity;

  // Beats
  const beat = (p0, p1, p2, p3) => {
    if (p < p0 || p > p3) return 0;
    if (p < p1) return (p - p0) / Math.max(1e-4, p1 - p0);
    if (p3 > 1.5) return 1;
    if (p < p2) return 1;
    return 1 - (p - p2) / Math.max(1e-4, p3 - p2);
  };

  const tagAlpha   = beat(-0.02, 0.04, 0.09, 0.14);
  const transAlpha = beat(0.20, 0.27, 0.37, 0.42);
  const coutAlpha  = beat(0.44, 0.50, 0.59, 0.65);
  const ingeAlpha  = p > 0.68 ? Math.min(1, (p - 0.68) / 0.09) : 0;

  const ingeReveal = p > 0.70 ? Math.min(1, (p - 0.70) / 0.12) : 0;
  const subAlpha   = p > 0.80 ? Math.min(1, (p - 0.80) / 0.1) : 0;

  return (
    <div ref={heroRef} style={{ position: 'relative', height: '400vh' }}>
      <div className="hero-film" style={{ position: 'sticky', top: 0 }}>
        <div className="hero-vignette"/>

        {/* Cherry emblem */}
        <CherrySVG className="hero-cherry" style={{
          opacity: cherryOpacity,
          transform: `scale(${cherryScale})`,
          position: 'absolute',
          width: 'min(320px, 50vw)',
          zIndex: 3,
          filter: 'drop-shadow(0 0 80px rgba(74,13,26,0.5))',
          transition: 'none',
        }}/>

        {/* Lacquer */}
        <div className="hero-lacquer" style={{ opacity: Math.max(0, lacquerFade) }}/>

        {/* Beat 1: INGÉ tagline */}
        <div className="hero-beat beat-tagline" style={{ opacity: tagAlpha }}>
          <h1>ING<em>É</em></h1>
          <p>François</p>
        </div>

        {/* Beat 2: transform chain */}
        <div className="hero-beat beat-transform" style={{ opacity: transAlpha }}>
          {['Cherry','Leather','Couture','The House'].map((s, i) => (
            <span key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span className="t-step" style={{ opacity: transAlpha > i * 0.25 ? 1 : 0 }}>{s}</span>
              {i < 3 && <span className="t-arrow" style={{ opacity: transAlpha > i * 0.25 ? 0.6 : 0 }}>↓</span>}
            </span>
          ))}
        </div>

        {/* Beat 3: From Cherry to Couture */}
        <div className="hero-beat beat-couture" style={{ opacity: coutAlpha }}>
          <h2>From Cherry<br/>to Couture</h2>
          <div className="couture-rule" style={{ transform: `scaleY(${coutAlpha})`, transformOrigin: 'top' }}/>
          <p>Command the room. Before you say a word.</p>
        </div>

        {/* Beat 4: INGÉ wordmark */}
        <div className="hero-beat beat-inge" style={{ opacity: ingeAlpha }}>
          <div className="inge-wm" style={{ clipPath: `inset(0 ${Math.max(0, 100 - ingeReveal * 100)}% 0 0)` }}>
            ING<span className="cherry-e">É</span>
          </div>
          <div className="inge-sub" style={{ opacity: subAlpha }}>A new expression of modern luxury</div>
        </div>

        {/* Scroll hint (only at top) */}
        {p < 0.05 && (
          <div className="scroll-hint">Scroll to enter</div>
        )}
      </div>
    </div>
  );
}

// ── Doors section ─────────────────────────────────────────────
function DoorsSection({ onEnter }) {
  const [scrollP, setScrollP] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const total = ref.current.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      setScrollP(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const p = scrollP;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const openT = p < 0.5 ? ease(p / 0.5) : 1;
  const scaleX = Math.max(0, 1 - openT);
  const headAlpha = p > 0.45 ? Math.min(1, (p - 0.45) / 0.25) : 0;
  const ctaAlpha  = p > 0.58 ? Math.min(1, (p - 0.58) / 0.2) : 0;

  return (
    <div ref={ref} style={{ position: 'relative', height: '250vh' }}>
      <div className="doors-section" style={{ position: 'sticky', top: 0 }}>
        <div className="door door-l" style={{ transform: `scaleX(${scaleX})`, opacity: 1 - openT * 0.4 }}>
          <div className="door-panel door-panel-l"/><div className="door-mold"/><div className="door-knob"/>
        </div>
        <div className="door door-r" style={{ transform: `scaleX(${scaleX})`, opacity: 1 - openT * 0.4 }}>
          <div className="door-panel door-panel-r"/><div className="door-mold"/><div className="door-knob"/>
        </div>
        <div className="door-interior">
          <div className="door-interior-bg"/>
          <div className="enter-head" style={{ opacity: headAlpha, transform: `translateY(${(1 - headAlpha) * 18}px)` }}>
            <h2>The House of<br/><em>Ingé François</em></h2>
            <p>Curated. Intentional. Exclusively INGÉ.</p>
          </div>
          <div style={{ opacity: ctaAlpha, transform: `translateY(${(1 - ctaAlpha) * 10}px)` }}>
            <button className="btn-enter" onClick={onEnter}>
              Enter the House <span className="btn-enter-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────
function Marquee() {
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      xRef.current -= 0.55;
      const track = trackRef.current;
      if (track) {
        const hw = track.scrollWidth / 2;
        if (Math.abs(xRef.current) >= hw) xRef.current = 0;
        track.style.transform = `translateX(${xRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const items = ['La Femme','L\'Homme','Les Sacs','Les Souliers','Les Bijoux','Ingé Originals','Maison','Private Collection','Concierge'];
  const doubled = [...items, ...items];

  return (
    <div className="marquee-wrap">
      <div className="marquee-track" ref={trackRef}>
        {doubled.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item} <span className="marquee-sep"/>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Departments ───────────────────────────────────────────────
const DEPTS = [
  { num:'01', name:'La Femme',          sub:'Professional Womenswear', motif:'F', bg:'linear-gradient(135deg,#1a0609 0%,#3d0e18 40%,#2a0810 100%)', tall:true, id:'la-femme' },
  { num:'02', name:"L'Homme",           sub:'Curated Menswear',        motif:'H', bg:'linear-gradient(135deg,#0d1520 0%,#1a2535 50%,#0a0f1a 100%)', tall:false, id:'lhomme' },
  { num:'03', name:'Les Sacs',          sub:'Handbags & Pocketbooks',  motif:'S', bg:'linear-gradient(135deg,#1a0d00 0%,#3d2000 50%,#1a0d00 100%)', tall:false, id:'les-sacs' },
  { num:'04', name:'Les Souliers',      sub:'Designer Shoes',          motif:'S', bg:'linear-gradient(135deg,#0d0d0d 0%,#2a1a1a 50%,#0d0d0d 100%)', tall:false, id:'les-souliers' },
  { num:'05', name:'Les Bijoux',        sub:'Jewelry & Accessories',   motif:'B', bg:'linear-gradient(135deg,#1a1500 0%,#3d3000 50%,#1a1500 100%)', tall:false, id:'les-bijoux' },
  { num:'06', name:'INGÉ Originals',    sub:'Proprietary Designs',     motif:'I', bg:'linear-gradient(135deg,#0a0608 0%,#4A0D1A 50%,#0a0608 100%)', tall:false, id:'originals' },
  { num:'07', name:'Maison',            sub:'Beauty · Home · Lifestyle',motif:'M', bg:'linear-gradient(135deg,#0d1a0d 0%,#1a2e1a 50%,#0d1a0d 100%)', tall:false, id:'maison' },
  { num:'08', name:'Private Collection',sub:'One of One · By Request', motif:'P', bg:'linear-gradient(135deg,#0a0608 0%,#1e0c10 40%,#4A0D1A 100%)', tall:false, id:'private' },
  { num:'09', name:'Concierge',         sub:'Private Client Services', motif:'C', bg:'linear-gradient(135deg,#1a1500 0%,#3d3000 40%,#1a1500 100%)', tall:false, id:'concierge' },
];

function Departments({ onNav }) {
  return (
    <div className="dept-grid" id="departments">
      {DEPTS.map(d => (
        <div key={d.id} className={`dept-card${d.tall?' tall':''} reveal`}
             onClick={() => onNav(d.id)}
             tabIndex={0} onKeyDown={e => e.key==='Enter' && onNav(d.id)}>
          <div className="dept-bg" style={{ background: d.bg }}/>
          <div className="dept-motif">{d.motif}</div>
          <div className="dept-gold-line"/>
          <div className="dept-info">
            <div className="dept-num">{d.num}</div>
            <div className="dept-name">{d.name}</div>
            <div className="dept-sub">{d.sub}</div>
          </div>
          <div className="dept-arrow">→</div>
        </div>
      ))}
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────
const PRODUCTS = {
  'la-femme': [
    { tag:'La Femme', name:'The Director Blazer', price:'$1,240', bg:'linear-gradient(135deg,#1a0609,#3d0e18)' },
    { tag:'La Femme', name:'Executive Power Suit', price:'$2,180', bg:'linear-gradient(160deg,#2a0810,#4a0d1a)' },
    { tag:'La Femme', name:'Noir Pencil Skirt', price:'$680', bg:'linear-gradient(135deg,#0a0608,#2a1018)' },
    { tag:'La Femme', name:'Silk Charcoal Dress', price:'$1,560', bg:'linear-gradient(160deg,#1a1010,#3a0e16)' },
    { tag:'La Femme', name:'The Counsel Coat', price:'$3,200', bg:'linear-gradient(135deg,#0d0508,#2a0810)' },
    { tag:'Private Collection', name:'Oxblood Tailored Set', price:'By Request', bg:'linear-gradient(135deg,#2a0608,#4a0d1a)' },
  ],
  'lhomme': [
    { tag:"L'Homme", name:'The Architect Suit', price:'$2,800', bg:'linear-gradient(135deg,#0d1520,#1a2535)' },
    { tag:"L'Homme", name:'Italian Wool Blazer', price:'$1,640', bg:'linear-gradient(160deg,#0a1020,#152235)' },
    { tag:"L'Homme", name:'Midnight Slim Trouser', price:'$480', bg:'linear-gradient(135deg,#080d18,#101a2a)' },
    { tag:"L'Homme", name:'Silk Evening Shirt', price:'$620', bg:'linear-gradient(160deg,#0a1220,#162640)' },
    { tag:"L'Homme", name:'The Executive Oxford', price:'$880', bg:'linear-gradient(135deg,#0d1525,#1a2840)' },
    { tag:'Private Collection', name:'Bespoke Three-Piece', price:'By Request', bg:'linear-gradient(135deg,#0a1018,#152030)' },
  ],
  'les-sacs': [
    { tag:'Les Sacs', name:'Noir Patent Tote', price:'$2,400', bg:'linear-gradient(135deg,#1a0d00,#3d2000)' },
    { tag:'Les Sacs', name:'Black Cherry Clutch', price:'$980', bg:'linear-gradient(160deg,#1a0a00,#2e1800)' },
    { tag:'Les Sacs', name:'Structured Day Bag', price:'$1,780', bg:'linear-gradient(135deg,#0d0800,#281400)' },
    { tag:'Les Sacs', name:'INGÉ Chain Minaudière', price:'$1,240', bg:'linear-gradient(160deg,#1a0d05,#3a2008)' },
    { tag:'Les Sacs', name:'Oxblood Envelope', price:'$760', bg:'linear-gradient(135deg,#0a0800,#221200)' },
    { tag:'Private Collection', name:'Lacquer Box Bag', price:'By Request', bg:'linear-gradient(135deg,#1a0a00,#301800)' },
  ],
};

function InnerPage({ dept, onBack, onNav }) {
  const info = DEPTS.find(d => d.id === dept) || DEPTS[0];
  const products = PRODUCTS[dept] || PRODUCTS['la-femme'];
  useReveal();

  return (
    <div className="inner-page">
      <div className="inner-hero">
        <div className="inner-hero-num">{info.num} — The House of Ingé François</div>
        <h1 className="inner-hero-h1">{info.name}</h1>
        <div className="inner-hero-sub">{info.sub}</div>
        <div className="inner-gold-rule"/>
      </div>

      {/* Back + nav strip */}
      <div style={{ padding:'32px 48px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onBack} style={{
          fontSize:'0.52rem', letterSpacing:'0.38em', textTransform:'uppercase',
          color: T.glaze, opacity:0.8, display:'flex', alignItems:'center', gap:8
        }}>← The House</button>
        <div style={{ display:'flex', gap:20 }}>
          {DEPTS.slice(0,5).map(d => (
            <button key={d.id} onClick={() => onNav(d.id)} style={{
              fontSize:'0.48rem', letterSpacing:'0.22em', textTransform:'uppercase',
              color: dept===d.id ? T.ivory : T.cream, opacity: dept===d.id ? 1 : 0.45,
              borderBottom: dept===d.id ? `1px solid ${T.glaze}` : 'none',
              paddingBottom:4, transition:'opacity 0.3s'
            }}>{d.name}</button>
          ))}
        </div>
      </div>

      {/* Statement */}
      <div style={{ padding:'60px 48px 40px', maxWidth:700 }}>
        <p className="reveal" style={{
          fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.4rem,2.5vw,2rem)',
          fontWeight:300, letterSpacing:'0.08em', color: T.ivory, lineHeight:1.4
        }}>
          {info.id==='la-femme' && 'Dressed for authority. Styled for the room before you enter it.'}
          {info.id==='lhomme' && 'Curated for men who understand the language of quality.'}
          {info.id==='les-sacs' && 'The bag is the first thing they notice. The last thing they forget.'}
          {!['la-femme','lhomme','les-sacs'].includes(info.id) && 'Curated. Intentional. Exclusively INGÉ.'}
        </p>
      </div>

      {/* Product grid */}
      <div className="product-grid" style={{ padding:'0 2px 2px' }}>
        {products.map((p, i) => (
          <div key={i} className="product-card reveal" style={{ transitionDelay: `${i*0.06}s` }}>
            <div className="product-bg" style={{ background: p.bg }}/>
            <div className="product-overlay"/>
            <div className="product-info">
              <div className="product-tag">{p.tag}</div>
              <div className="product-name">{p.name}</div>
              <div className="product-price">{p.price}</div>
              <div className="product-add">
                {p.price==='By Request' ? 'Request This Piece' : 'Add to Bag'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Concierge strip */}
      <div style={{
        padding:'80px 48px', textAlign:'center', background: T.charcoal,
        marginTop: 2, display:'flex', flexDirection:'column', alignItems:'center', gap:20
      }}>
        <p className="eyebrow">INGÉ Concierge</p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.2rem,2.5vw,2rem)', fontWeight:300, letterSpacing:'0.1em', color: T.ivory }}>
          Can't find what you're looking for?
        </p>
        <p style={{ fontSize:'0.65rem', letterSpacing:'0.12em', color: T.cream, opacity:0.5, maxWidth:380, lineHeight:2.1 }}>
          The INGÉ Concierge sources, styles, and curates on your behalf. No piece is beyond reach.
        </p>
        <button className="btn-conc" onClick={() => onNav('concierge')}>Speak with Concierge</button>
      </div>
    </div>
  );
}

// ── Concierge page ────────────────────────────────────────────
function ConciergePage({ onBack }) {
  useReveal();
  return (
    <div className="inner-page">
      <div className="inner-hero">
        <div className="inner-hero-num">09 — Private Services</div>
        <h1 className="inner-hero-h1">Concierge</h1>
        <div className="inner-hero-sub">Luxury, personally considered.</div>
        <div className="inner-gold-rule"/>
      </div>
      <button onClick={onBack} style={{ margin:'32px 48px', display:'block', fontSize:'0.52rem', letterSpacing:'0.38em', textTransform:'uppercase', color: T.glaze }}>← The House</button>
      <div className="concierge-sec">
        <div className="concierge-text">
          <p className="eyebrow">INGÉ Concierge</p>
          <h2 className="conc-h2">Luxury,<br/><em>personally considered.</em></h2>
          <p className="conc-p">For clients who require more than a transaction. One point of contact. Unlimited access.</p>
          <ul className="conc-services">
            {['Personal Shopping','Executive Wardrobe','Designer Sourcing','Private Appointments','Event Styling','Gift Sourcing','Wardrobe Curation','Special Requests'].map(s => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <button className="btn-conc">Request a Private Appointment</button>
        </div>
        <div className="conc-visual">
          <div className="conc-tag">
            <div className="conc-tag-label">Private Appointment</div>
            <div className="conc-tag-text">Available by Request</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full homepage (below the film) ────────────────────────────
function HomeContent({ onNav }) {
  useReveal();
  return (
    <>
      <Marquee/>

      {/* House intro */}
      <section style={{ background: T.noir }}>
        <div className="house-intro">
          <p className="eyebrow reveal">The House of Ingé François</p>
          <h2 className="section-h2 reveal reveal-delay-1">Enter <em>Every Room</em></h2>
          <p className="section-p reveal reveal-delay-2">Each department a world unto itself. Each piece chosen with intention. Not a store — a point of view.</p>
        </div>
        <Departments onNav={onNav}/>
      </section>

      {/* Statement */}
      <section className="statement-sec">
        <p className="statement-text reveal">
          <em>INGÉ</em> begins by curating extraordinary brands.<br/>
          It ends by becoming the brand they seek.
        </p>
        <div className="statement-rule reveal reveal-delay-1"/>
      </section>

      {/* Private Collection */}
      <section className="private-sec">
        <div className="wax-seal reveal"><WaxSeal/></div>
        <p className="private-label-text reveal">Private Collection</p>
        <h2 className="private-h reveal reveal-delay-1">The Rare.<br/><em>The Unrepeatable.</em></h2>
        <p className="private-copy reveal reveal-delay-2">Sourced by INGÉ. Available by request. Each piece a conversation between maker and moment.</p>
        <button className="private-cta-link reveal reveal-delay-3" onClick={() => onNav('private')}>Request a Piece</button>
      </section>

      {/* Concierge */}
      <section className="concierge-sec">
        <div className="concierge-text">
          <p className="eyebrow reveal">Ingé Concierge</p>
          <h2 className="conc-h2 reveal reveal-delay-1">Luxury,<br/><em>personally considered.</em></h2>
          <p className="conc-p reveal reveal-delay-2">For clients who require more than a transaction. One point of contact. Unlimited access.</p>
          <ul className="conc-services reveal reveal-delay-3">
            {['Personal Shopping','Executive Wardrobe','Designer Sourcing','Private Appointments','Event Styling','Gift Sourcing','Wardrobe Curation','Special Requests'].map(s => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <button className="btn-conc reveal reveal-delay-4" onClick={() => onNav('concierge')}>Request a Private Appointment</button>
        </div>
        <div className="conc-visual reveal">
          <div className="conc-tag">
            <div className="conc-tag-label">Private Appointment</div>
            <div className="conc-tag-text">Available by Request</div>
          </div>
        </div>
      </section>

      {/* Originals */}
      <section className="originals-sec">
        <div className="orig-content">
          <p className="eyebrow reveal">Ingé Originals</p>
          <h2 className="orig-h2 reveal reveal-delay-1"><span>The Label</span><em>Becomes the House.</em></h2>
          <p className="orig-p reveal reveal-delay-2">What begins as a boutique becomes a point of view. The first expression of an independent vision.</p>
          <div className="orig-status reveal reveal-delay-3">Forthcoming Collection</div>
        </div>
      </section>

      {/* Story */}
      <section className="story-sec">
        <div>
          <div className="story-visual-box reveal">
            <div className="story-mark">INGÉ</div>
          </div>
          <p className="story-caption reveal">Ingé François · Est. The House</p>
        </div>
        <div className="story-text">
          <p className="eyebrow reveal">The House</p>
          <h2 className="story-h2 reveal reveal-delay-1">Not merely<br/>a boutique.<br/><em>A beginning.</em></h2>
          <p className="story-p reveal reveal-delay-2">Conceived with a singular intention: to build something that endures. Curated from extraordinary sources. Evolving toward an original vision.</p>
          <p className="story-p reveal reveal-delay-3">The cherry is not decoration. It is the mark of what transforms — richness becoming form, desire becoming something wearable.</p>
          <a className="story-link reveal reveal-delay-4" href="#">The Full Story</a>
        </div>
      </section>

      {/* Invite */}
      <section className="invite-sec">
        <p className="eyebrow reveal">INGÉ Private Clientele</p>
        <h2 className="invite-h reveal reveal-delay-1">By Invitation.<br/><em>Or Application.</em></h2>
        <p className="invite-copy reveal reveal-delay-2">Early access. Private drops. Appointment-only pieces. For those who understand that the best things are rarely on the shelf.</p>
        <div className="invite-form reveal reveal-delay-3">
          <input className="invite-field" type="text" placeholder="Full Name"/>
          <input className="invite-field" type="email" placeholder="Email Address"/>
          <input className="invite-field" type="text" placeholder="How did you discover INGÉ?"/>
          <button className="btn-apply">Apply for Access</button>
        </div>
        <p className="invite-disc reveal">Applications are reviewed personally. Access is selective.</p>
      </section>

      {/* Footer */}
      <footer className="inge-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">INGÉ FRANÇOIS</div>
            <p className="footer-brand-p">A new expression of modern luxury. Curated. Intentional. The beginning of a house.</p>
            <nav className="footer-social">
              {['IG','TK','PT','YT','FB'].map(s => <a key={s} href="#">{s}</a>)}
            </nav>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-h">The House</h4>
            <ul>
              {['La Femme',"L'Homme",'Les Sacs','Les Souliers','Les Bijoux','Maison'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-h">Private</h4>
            <ul>
              {['Private Collection','INGÉ Originals','Concierge','Private Clientele','The House'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-h">Client Services</h4>
            <ul>
              {['Contact','Appointments','Shipping','Returns','Authentication'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Ingé François. All rights reserved.</p>
          <span className="footer-cherry">✦</span>
          <p><a href="#" style={{ color:'inherit', opacity:0.5 }}>Privacy</a> · <a href="#" style={{ color:'inherit', opacity:0.5 }}>Terms</a></p>
        </div>
      </footer>
    </>
  );
}

// ── Nav component ─────────────────────────────────────────────
function Nav({ scrolled, onHome, onNav, page }) {
  return (
    <nav className={`inge-nav${scrolled?' scrolled':''}`}>
      <div className="nav-logo" onClick={onHome}>INGÉ FRANÇOIS</div>
      <ul className="nav-links">
        {[['La Femme','la-femme'],["L'Homme",'lhomme'],['Les Sacs','les-sacs'],['Private','private'],['Concierge','concierge'],['The House','house']].map(([label, id]) => (
          <li key={id}><a onClick={e => { e.preventDefault(); onNav(id); }}>{label}</a></li>
        ))}
      </ul>
      <div className="nav-actions">
        <button className="nav-btn">Search</button>
        <button className="nav-btn">Bag <span className="bag-dot">0</span></button>
      </div>
    </nav>
  );
}

// ── Root ──────────────────────────────────────────────────────
export default function IngeApp() {
  const [page, setPage] = useState('home'); // 'home' | dept id | 'concierge'
  const [navScrolled, setNavScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Inject CSS once
  useEffect(() => {
    if (document.getElementById('inge-css')) return;
    const tag = document.createElement('style');
    tag.id = 'inge-css';
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    setTimeout(() => setLoaded(true), 1200);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goHome = useCallback(() => {
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goPage = useCallback((id) => {
    setPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!loaded) {
    return (
      <div className="inge-root" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:24 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', fontWeight:300, letterSpacing:'0.5em', textTransform:'uppercase', color: T.ivory }}>INGÉ</div>
        <div style={{ width:80, height:1, background: T.charcoal, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background: T.glaze, animation:'ingeLd 1.4s cubic-bezier(0.16,1,0.3,1) forwards' }}/>
        </div>
        <style>{`@keyframes ingeLd{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
        <div style={{ fontSize:'0.45rem', letterSpacing:'0.5em', textTransform:'uppercase', color: T.cream, opacity:0.3 }}>The House of Ingé François</div>
      </div>
    );
  }

  return (
    <div className="inge-root">
      <Nav scrolled={navScrolled} onHome={goHome} onNav={goPage} page={page}/>

      {page === 'home' && (
        <>
          <HeroFilm/>
          <DoorsSection onEnter={() => {
            const el = document.getElementById('departments');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}/>
          <HomeContent onNav={goPage}/>
        </>
      )}

      {page === 'concierge' && (
        <ConciergePage onBack={goHome}/>
      )}

      {page !== 'home' && page !== 'concierge' && (
        <InnerPage dept={page} onBack={goHome} onNav={goPage}/>
      )}
    </div>
  );
}
