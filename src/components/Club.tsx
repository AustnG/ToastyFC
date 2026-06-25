/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Shield, Sparkles, Trophy, Heart, Flame, Camera, Check, AlertCircle, Info, Zap, Smile, Swords, Award } from 'lucide-react';

interface ClubProps {
  subTab: 'about' | 'gear';
  setCurrentTab: (tab: string) => void;
}

export default function Club({ subTab, setCurrentTab }: ClubProps) {
  return (
    <div className="space-y-8 pb-16 animate-fade-in" id="club-view">
      {/* Subpage Tabs */}
      <div className="flex justify-center border-b border-club-border pb-px" id="club-tabs-container">
        <div className="flex space-x-6" id="club-sub-tabs">
          <button
            onClick={() => setCurrentTab('about')}
            className={`py-3 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
              subTab === 'about'
                ? 'border-jersey-red text-jersey-red'
                : 'border-transparent text-club-text-muted hover:text-club-text'
            }`}
            id="sub-tab-about"
          >
            About Toasty FC
          </button>
          <button
            onClick={() => setCurrentTab('gear')}
            className={`py-3 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
              subTab === 'gear'
                ? 'border-jersey-red text-jersey-red'
                : 'border-transparent text-club-text-muted hover:text-club-text'
            }`}
            id="sub-tab-gear"
          >
            Gear & Setup
          </button>
        </div>
      </div>

      {subTab === 'about' ? (
        <div className="space-y-12" id="about-subpage">
          {/* Main Hero Story */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="about-hero-grid">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-jersey-red/10 border border-jersey-red/20 text-jersey-red rounded-full text-xs font-mono font-bold uppercase">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>Our Origin Story</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-club-text tracking-tight leading-tight">
                Forged by Austin & Goran, <br />
                <span className="text-jersey-red">Sustained by Passion</span>
              </h2>
              <div className="text-club-text-muted text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  Toasty FC's journey began with Austin Greer — a seasoned player in the Bowling Green Futsal league. After years of bouncing between various teams, he decided it was time to forge his own path. While his initial foray with "Rocky's FC" faced back-to-back last-place finishes in the B-Division, the desire for a fresh start was strong.
                </p>
                <p>
                  Enter Goran Omerdic. Together, they envisioned a new, more competitive squad. By recruiting old friends and talented soccer players from around Bowling Green, Toasty FC was born. This new roster quickly proved its mettle, and within their very first year, Toasty FC achieved a significant milestone by winning the <strong>2023 Spring Season B-Division Championship</strong> at Bowling Green Futsal!
                </p>
                <p>
                  From the 2022 Winter season until the 2024 Spring season, Toasty FC competed fiercely in the B-Division. Our consistent performance and dedication paid off, earning us a well-deserved promotion to the A-Division in Winter 2024, where we continue to compete today. We're proud to be one of the league's more experienced teams, boasting an average age of 33.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5" id="champs-image-container">
              <div className="relative group overflow-hidden rounded-3xl border border-club-border bg-club-card p-2 shadow-xl hover:border-jersey-gold/30 transition-all duration-300">
                <img
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNulLIXzDFooO2VARBxTqku4WLCCBNTX16n-zy82MTU_U1hGZ21eJb0tamhj0IvekOUNNZnZOkT-Oy0-4GryT0JhdULDk4h8LPAV5PG-lliNEjetLs8XdcDi_sisznxDuzopsISgOtvrRZhLVTo8pmFJQ10MnRQ8NQNcueFVaKSLlUEI4g5hAh0RLXiCw/s576/2023%20Spring%20Season%20Champs.jpg"
                  alt="Toasty FC - 2023 Spring Season Champions"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6">
                  <span className="text-[10px] font-mono text-jersey-gold font-bold uppercase tracking-wider">CHAMPIONSHIP SQUAD</span>
                  <h4 className="text-white text-base sm:text-lg font-bold mt-1">2023 Spring Season Champions</h4>
                  <p className="text-white/70 text-xs font-mono mt-1">Bowling Green Futsal B-Division Winners</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Fact Callout & Mission Statement */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="mission-funfact-section">
            <div className="md:col-span-4 bg-jersey-gold/5 border border-jersey-gold/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between" id="fun-fact-card">
              <div className="absolute top-0 right-0 h-16 w-16 bg-jersey-gold/5 rounded-bl-full"></div>
              <div>
                <Award className="h-8 w-8 text-jersey-gold mb-4" />
                <h4 className="text-xs font-mono text-jersey-gold font-bold uppercase tracking-widest">Fun Fact</h4>
                <p className="text-club-text font-bold text-lg mt-2 leading-snug">
                  Toasty FC has advanced to the Bowling Green Futsal playoffs every year since our establishment!
                </p>
              </div>
              <p className="text-club-text-dim text-[11px] font-mono mt-4">Playoffs Streak: 100% Active</p>
            </div>

            <div className="md:col-span-8 bg-club-card border border-club-border rounded-2xl p-6 sm:p-8 space-y-6" id="mission-card">
              <h4 className="text-lg font-bold text-club-text flex items-center gap-2">
                <Flame className="h-5 w-5 text-jersey-red" />
                <span>Our Core Mission</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-mono text-club-text-muted">
                <li className="flex items-start space-x-2.5">
                  <span className="text-jersey-red mt-0.5 font-bold">⚽</span>
                  <span>Play entertaining, high-tempo indoor soccer/futsal.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-jersey-red mt-0.5 font-bold">🎥</span>
                  <span>Deliver top quality match highlights for our fans on YouTube.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-jersey-red mt-0.5 font-bold">🤝</span>
                  <span>Foster a strong sense of camaraderie and teamwork in our squad.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-jersey-red mt-0.5 font-bold">🔥</span>
                  <span>Embrace competition, even when reminded of our age (avg. 33) against speedy youngsters!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Club Values */}
          <div className="space-y-6" id="club-values-section">
            <h3 className="text-xl font-bold text-club-text text-center">Club Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="values-grid">
              {[
                { icon: <Smile className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Fun', desc: 'We believe futsal should be enjoyable, both on and off the court.' },
                { icon: <Trophy className="h-5 w-5 text-jersey-gold" />, bg: 'bg-jersey-gold/10 border-jersey-gold/20', title: 'Win', desc: 'We strive for success and put in the absolute effort to achieve victories.' },
                { icon: <Swords className="h-5 w-5 text-jersey-red" />, bg: 'bg-jersey-red/10 border-jersey-red/20', title: 'Competitive', desc: 'We push ourselves and our opponents to be the absolute best we can be.' },
                { icon: <Shield className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10 border-blue-500/20', title: 'Professionalism', desc: 'We conduct ourselves with absolute respect for teammates, opponents, and the league.' }
              ].map((val, idx) => (
                <div key={idx} className="bg-club-card border border-club-border rounded-xl p-5 hover:bg-club-card-hover transition duration-150 space-y-3">
                  <div className={`p-2 w-fit rounded-lg ${val.bg} border`}>{val.icon}</div>
                  <h5 className="font-bold text-club-text text-base">{val.title}</h5>
                  <p className="text-xs text-club-text-dim leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Behind The Name */}
          <div className="bg-club-card border border-club-border rounded-2xl p-6 sm:p-8 relative overflow-hidden" id="behind-the-name-section">
            <div className="absolute top-0 right-0 h-24 w-24 bg-jersey-red/5 rounded-bl-full"></div>
            <div className="max-w-2xl space-y-3">
              <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-wider block">NAME STORY</span>
              <h4 className="text-lg font-bold text-club-text">Where did the name "Toasty FC" come from?</h4>
              <p className="text-xs sm:text-sm text-club-text-muted leading-relaxed">
                The simple answer: <strong>Mortal Kombat!</strong>
              </p>
              <p className="text-xs sm:text-sm text-club-text-dim leading-relaxed">
                The longer story is that when Austin was registering the team for the Bowling Green Futsal league, he didn't have a team name ready. As a massive fan of the Mortal Kombat franchise and its iconic "Toasty!" Easter egg (shouted when players perform a fiery uppercut), it was the very first thing that popped into his head. The rest, as they say, is history!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Gear & Setup Tab */
        <div className="space-y-12" id="gear-subpage">
          {/* Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="gear-main-grid">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-jersey-red/10 border border-jersey-red/20 text-jersey-red rounded-full text-xs font-mono font-bold uppercase">
                <Camera className="h-3.5 w-3.5" />
                <span>Our Broadcast Rig</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-club-text tracking-tight leading-tight">
                Mevo Start Cameras <br />
                <span className="text-jersey-red">Wireless 3-Cam Setup</span>
              </h2>
              <div className="text-club-text-muted text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  We often get asked about how we film our matches. Here's a look at the gear we use to capture all the high-energy action.
                </p>
                <p>
                  Currently, we are using the <strong>Mevo Start Cameras</strong> to record our matches. This wireless and highly scalable camera system has allowed us to capture all our games with relative ease.
                </p>
                <p>
                  Seeing as most of our games are on small courts and fields, we've been able to get excellent, high-definition coverage and minimal blind spots using a <strong>three-camera configuration</strong>. While we've only used them in static setups so far, they have worked great for capturing our games!
                </p>
              </div>
            </div>

            {/* Main setup image showcase */}
            <div className="lg:col-span-5" id="setup-primary-image">
              <div className="relative group overflow-hidden rounded-3xl border border-club-border bg-club-card p-2 shadow-xl hover:border-jersey-red/30 transition-all duration-300">
                <img
                  src="https://blogger.googleusercontent.com/img/a/AVvXsEjtd_qEPjn65ks627sRkp-crkNgfvnoHpUIBRJujYK5urhdw2zrIg8cR6wRLeMQ6P7YLhcZF-9ukGnxRo3DnJ6nsjvPe6yLtseTBC3UUQPmWokI4sT1gBeLzqP3j9f9b-Y4ztBBB6eXaG-5vZ04jMMEvPyVs4L7ARKb4zo_YP9BhVnuC-9druhyX2JedRY"
                  alt="Mevo Broadcast Setup 1"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-xs border border-white/10 p-3 rounded-xl">
                  <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-wider block">CAMERA RIG 1</span>
                  <span className="text-xs text-white font-sans font-semibold mt-0.5 block">High tripod overview placement at half-court</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pros and Cons Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="pros-cons-grid">
            {/* Pros */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 space-y-4" id="gear-pros-card">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/15 rounded-lg border border-emerald-500/20 text-emerald-500">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-club-text">Setup Advantages (Pros)</h4>
              </div>
              <ul className="space-y-3 font-mono text-xs text-club-text-muted">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5 font-bold">✔</span>
                  <span><strong>100% Wireless:</strong> Incredibly easy to mount and set up almost anywhere.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5 font-bold">✔</span>
                  <span><strong>Battery Powered:</strong> Long battery life, no trailing extension cords on courts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5 font-bold">✔</span>
                  <span><strong>Highly Scalable:</strong> Easily connect and sync multiple cameras at once.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5 font-bold">✔</span>
                  <span><strong>Direct Streaming:</strong> Can stream live directly to YouTube or Facebook.</span>
                </li>
              </ul>
            </div>

            {/* Cons */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 sm:p-8 space-y-4" id="gear-cons-card">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/15 rounded-lg border border-rose-500/20 text-rose-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-club-text">Setup Trade-offs (Cons)</h4>
              </div>
              <ul className="space-y-3 font-mono text-xs text-club-text-muted">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5 font-bold">✘</span>
                  <span><strong>Expensive:</strong> High initial entry cost for multiple camera modules.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5 font-bold">✘</span>
                  <span><strong>Networking:</strong> Complicated setup without local Wi-Fi or cellular hotspots.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5 font-bold">✘</span>
                  <span><strong>Controller Device:</strong> Requires an iPad/phone/computer active to manage feeds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5 font-bold">✘</span>
                  <span><strong>Fragility:</strong> Has already taken some court ball damage from sports impacts.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Three Camera Setup Images Gallery Grid */}
          <div className="space-y-6" id="camera-setup-gallery">
            <h3 className="text-xl font-bold text-club-text text-center">Rig Positions & Angles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="angles-grid">
              {/* Photo 1 */}
              <div className="bg-club-card border border-club-border rounded-2xl p-3 flex flex-col justify-between space-y-3">
                <div className="relative overflow-hidden rounded-xl h-48 bg-club-secondary">
                  <img
                    src="https://blogger.googleusercontent.com/img/a/AVvXsEjtd_qEPjn65ks627sRkp-crkNgfvnoHpUIBRJujYK5urhdw2zrIg8cR6wRLeMQ6P7YLhcZF-9ukGnxRo3DnJ6nsjvPe6yLtseTBC3UUQPmWokI4sT1gBeLzqP3j9f9b-Y4ztBBB6eXaG-5vZ04jMMEvPyVs4L7ARKb4zo_YP9BhVnuC-9druhyX2JedRY"
                    alt="Setup 1 Overview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-jersey-red text-white text-[9px] font-mono rounded-md font-black">
                    ANGLE 1
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-club-text text-sm font-sans">Full Court Overview</h5>
                  <p className="text-[11px] text-club-text-dim mt-1">Wide central placement capturing tactical movements across both halves.</p>
                </div>
              </div>

              {/* Photo 2 */}
              <div className="bg-club-card border border-club-border rounded-2xl p-3 flex flex-col justify-between space-y-3">
                <div className="relative overflow-hidden rounded-xl h-48 bg-club-secondary">
                  <img
                    src="https://blogger.googleusercontent.com/img/a/AVvXsEhnI8J4qx6ZiSKZD2GfXQMemaGAGPT8zS7M6GRurJ30fbyYDHGSy4DCqydYqZgVMK9mS-ibhHkj-uhlXLz5i91pnQSeLHZWPsH2lPQ5zjQwGXeNE097PZkARoKkyxSW5jPZAZ0KsnSMjXmER87m9C3seFphicR99Omkx-OTzFuLRm_nSX3sivuCgBm7aRo"
                    alt="Setup 2 Close-up Goal Post"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-jersey-red text-white text-[9px] font-mono rounded-md font-black">
                    ANGLE 2
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-club-text text-sm font-sans">Corner Post Close-up</h5>
                  <p className="text-[11px] text-club-text-dim mt-1">Goal-mouth camera focused on saves, rebounds, and fine defensive line-ups.</p>
                </div>
              </div>

              {/* Photo 3 */}
              <div className="bg-club-card border border-club-border rounded-2xl p-3 flex flex-col justify-between space-y-3">
                <div className="relative overflow-hidden rounded-xl h-48 bg-club-secondary">
                  <img
                    src="https://blogger.googleusercontent.com/img/a/AVvXsEjCt9oOwX_awXGQkPXNvWmUlqIO5EJz4xSF3MgQwO2Lv8xl_hUwPafMCRsMMTThCuB1t3IJqjPP9mHgWVqhVpaNEnFFt4GkKft7EwGkQd4c_zdRi2zG5u-BG0BnAax3nuqivev0JvqYZ71Bu1wBnouuV1n1FF4MRDoFihkZUMjc9bFqLUSBHpzRVjRb4Sk"
                    alt="Setup 3 Back Court View"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-jersey-red text-white text-[9px] font-mono rounded-md font-black">
                    ANGLE 3
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-club-text text-sm font-sans">Opponent End Capture</h5>
                  <p className="text-[11px] text-club-text-dim mt-1">Opponent-side dynamic capturing our attack rushes and strikers finishing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
