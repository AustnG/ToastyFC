import React from 'react';
import { 
  Info, 
  Users, 
  Sparkles, 
  Shield, 
  Award, 
  Flame, 
  Calendar, 
  TrendingUp,
  Clock,
  Palette,
  Camera,
  Shirt,
  BarChart2,
  Smile,
  Heart
} from 'lucide-react';

export const About: React.FC = () => {
  const logoUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png";

  return (
    <div className="space-y-12 animate-fade-in" id="about-page-root">
      {/* Editorial Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 border border-slate-900 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-toasty-red/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-toasty-tan/10 blur-2xl rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <span className="bg-toasty-red/20 text-red-300 border border-toasty-red/40 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono inline-block">
              Bowling Green, KY • Established 2022
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-tight">
              ABOUT <span className="text-toasty-tan">TOASTY FC</span>
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              From local futsal roots to Bowling Green's favorite cult-classic team. Discover our history, unique bread-tan & founding red branding, tactical philosophy, and why experience beats pure running.
            </p>
          </div>

          {/* Club Badge Showcase */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-slate-900/90 border-2 border-toasty-tan/40 p-4 flex items-center justify-center shadow-2xl shadow-toasty-tan/10 relative group hover:scale-105 transition-transform duration-300">
              <img 
                src={logoUrl} 
                alt="Toasty FC Logo" 
                className="w-full h-full object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-toasty-tan uppercase tracking-widest mt-3">
              Official Crest
            </span>
          </div>
        </div>
      </div>

      {/* Main Backstory & Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The Journey Narrative */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-2xl shadow-sm text-toasty-red">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-widest">Origins & Evolution</span>
              <h3 className="text-2xl font-black text-slate-900">The Story of Toasty FC</h3>
            </div>
          </div>

          <div className="space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            <p>
              Toasty FC was co-founded in Bowling Green, KY by <strong className="text-slate-900 font-bold">Austin Greer</strong> and <strong className="text-slate-900 font-bold">Goran Omerdic</strong>. What started as a quest to assemble a fun, competitive squad in the <strong className="text-slate-900 font-bold">BG Futsal B-Division</strong> quickly grew into a local cult-classic club known across multiple leagues in the city.
            </p>
            <p>
              In <strong className="text-toasty-red font-extrabold">Spring 2023</strong>, Toasty FC achieved its crowning early glory by winning the <strong className="text-slate-900 font-bold">BG Futsal B-Division Spring Championship</strong>! Since then, the club has expanded beyond a single venue, taking on various indoor and outdoor leagues across Bowling Green with the same signature blend of tactical IQ, camaraderie, and good humor.
            </p>
            <p>
              Most of our roster consists of former high school and college players, now mostly in their 20s and 30s. As the squad often jokes: <em className="text-slate-800 font-medium">"Our minds move faster than our bodies do these days!"</em> But on smaller fields, tactical IQ, tight passing, and years of shared chemistry routinely triumph over younger, hyper-athletic opponents.
            </p>
            <p>
              We pride ourselves on being an inviting, welcoming squad that doesn't take itself too seriously — frequently playing co-ed lineups even against all-male competition.
            </p>
          </div>

          {/* Austin's Stat Audit Running Joke */}
          <div className="bg-gradient-to-r from-toasty-red/10 via-toasty-tan/10 to-transparent border-l-4 border-toasty-red rounded-r-2xl p-5 relative overflow-hidden">
            <div className="absolute right-3 bottom-1 text-6xl opacity-10 pointer-events-none">📊</div>
            <h4 className="font-mono text-xs font-black text-toasty-red uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <BarChart2 size={14} className="text-toasty-red" /> The Locker Room Inside Joke: "Austin's Stat Audit"
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              Co-founder <strong className="text-slate-900">Austin Greer</strong> consistently leads the team in goals and assists... but he is <em>also</em> the webmaster and stat keeper! The squad loves to tease: <span className="italic font-semibold text-toasty-red">"Is Austin really that clinical in front of goal, or does he just fluff his stats because he owns the spreadsheet?"</span>
            </p>
          </div>
        </div>

        {/* Right Column: Key Details Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-900 rounded-3xl p-6 text-white shadow-md flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-toasty-tan uppercase tracking-widest font-mono">Club At A Glance</h4>
              <p className="text-[11px] text-slate-400">Key facts representing Toasty FC.</p>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs font-medium space-y-1">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} className="text-toasty-tan" /> Established</span>
                <span className="font-bold text-slate-100 font-mono">Winter 2022</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Users size={13} className="text-toasty-tan" /> Co-Founders</span>
                <span className="font-bold text-slate-100">Austin G. & Goran O.</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><TrendingUp size={13} className="text-toasty-tan" /> Home City</span>
                <span className="font-bold text-toasty-tan font-mono text-[10px] uppercase tracking-wider bg-toasty-tan/10 border border-toasty-tan/20 px-2 py-0.5 rounded">Bowling Green, KY</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Award size={13} className="text-toasty-tan" /> Major Trophy</span>
                <span className="font-bold text-emerald-400">2023 Spring B-Champs</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock size={13} className="text-toasty-tan" /> Squad Age Profile</span>
                <span className="font-bold text-slate-100 font-mono">20s & 30s (Alumni)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
              <img src={logoUrl} alt="Toasty FC Logo" className="w-9 h-9 rounded-xl object-contain shrink-0" referrerPolicy="no-referrer" />
              <div className="min-w-0">
                <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest">League Circuit</span>
                <span className="text-xs text-slate-200 truncate block">BG Futsal & Local Leagues</span>
              </div>
            </div>
          </div>

          {/* Quick Quote */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="font-black text-xs text-slate-400 uppercase tracking-widest font-mono">Squad Motto</h5>
              <p className="text-xs text-slate-800 leading-normal italic font-medium">
                "Experience over extra running. Stay Toasty."
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              🍞
            </div>
          </div>
        </div>

      </div>

      {/* Official Colors & Kit Identity Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6" id="about-colors-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Kit & Visual Identity
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              The Bread Tan Palette
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Toasty FC chose a color palette unlike any other club in the league. Why look like everyone else when you can wear bread?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bread Tan */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Bread Tan</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#CABBA2</span>
            </div>
            <div className="h-16 rounded-xl shadow-inner border border-black/10 flex items-center justify-center text-slate-800 font-mono text-xs font-black" style={{ backgroundColor: '#cabba2' }}>
              PRIMARY KIT
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Chosen to mimic toasted bread. It's an unconventional color that ensures no opponent ever clashes with our kit.
            </p>
          </div>

          {/* Original Red */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Original Red</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#AA0000</span>
            </div>
            <div className="h-16 rounded-xl shadow-inner border border-black/10 flex items-center justify-center text-white font-mono text-xs font-black" style={{ backgroundColor: '#aa0000' }}>
              SECONDARY KIT
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              The original founding color of the 2022 squad. Now serves as our bold secondary/away kit color.
            </p>
          </div>

          {/* Crisp White */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Crisp White</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#FFFFFF</span>
            </div>
            <div className="h-16 rounded-xl shadow-inner border border-slate-300 flex items-center justify-center text-slate-800 font-mono text-xs font-black bg-white">
              TERTIARY & ACCENTS
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Provides crisp accents, numbers, and alternate kit trim across all club generations.
            </p>
          </div>

          {/* Deep Black */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Deep Black</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#000000</span>
            </div>
            <div className="h-16 rounded-xl shadow-inner border border-black flex items-center justify-center text-white font-mono text-xs font-black bg-black">
              OUTLINES & TRIM
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Gives structure, sharp contrast, and high visibility to numbers and logo borders.
            </p>
          </div>
        </div>
      </div>


      {/* Modern Interactive Timeline */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-900 relative overflow-hidden shadow-xl" id="about-timeline-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-red-500/5 blur-3xl rounded-full" />

        <div className="relative z-10 space-y-2 mb-12 text-center max-w-2xl mx-auto">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Club Timeline
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
            Milestones & <span className="text-amber-400">Kit Evolutions</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The key chapters in Toasty FC's history since our founding kickoff in 2022.
          </p>
        </div>

        {/* Timeline Path Tree */}
        <div className="relative max-w-4xl mx-auto z-10">
          {/* Vertical center track line */}
          <div className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-amber-400 to-red-500 opacity-20 transform -translate-x-1/2 hidden sm:block" />
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-amber-400 to-red-500 opacity-20 sm:hidden" />

          <div className="space-y-12 sm:space-y-16">
            
            {/* Timeline Node 2022 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-red-600 shadow-md transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:text-right space-y-2 order-2 sm:order-1">
                <span className="inline-block bg-red-600/15 text-red-400 border border-red-500/30 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2022 • The Kickoff
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">Founding & First Red Kit</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Austin Greer and Goran Omerdic founded Toasty FC in Bowling Green, KY. The squad took the pitch wearing the inaugural dark red (#aa0000) uniforms.
                </p>
              </div>
              <div className="hidden sm:block w-[45%] order-2" />
            </div>

            {/* Timeline Node 2023 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-amber-400 shadow-md transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              <div className="hidden sm:block w-[45%] text-right order-1" />
              <div className="w-full sm:w-[45%] pl-10 sm:pl-10 text-left space-y-2 order-2">
                <span className="inline-block bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2023 • Championship & Mevo Cams
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">Spring B-Division Champions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toasty FC claimed its first major silverware by winning the BG Futsal B-Division Spring Championship! Introduced Mevo goal cameras to capture match highlights.
                </p>
              </div>
            </div>

            {/* Timeline Node 2024 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-amber-500 shadow-md transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:text-right space-y-2 order-2 sm:order-1">
                <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2024 • Tan Kit Evolution
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">The Signature Bread Tan Kit</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Transitioned to our iconic Bread Tan (#cabba2) jerseys — an immediate hit that solidified Toasty FC as the most visually distinct team in Bowling Green.
                </p>
              </div>
              <div className="hidden sm:block w-[45%] order-2" />
            </div>

            {/* Timeline Node 2026 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-emerald-400 shadow-md transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              <div className="hidden sm:block w-[45%] text-right order-1" />
              <div className="w-full sm:w-[45%] pl-10 sm:pl-10 text-left space-y-2 order-2">
                <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2026 • Multi-League Expansion
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">Citywide Campaign & 3rd Gen Kit</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Expanded play into multiple leagues across Bowling Green, debuting our 3rd generation kit and modern team analytics platform.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Grid: Mission, Tactical Style & Behind the Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Card 1: Our Philosophy */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-toasty-red">
                <Info size={18} />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">Tactical Philosophy</h4>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-toasty-red mt-2 shrink-0" />
                <span><strong>Small Pitch Intelligence:</strong> Maximizing short passes, quick wall-plays, and positioning over long sprints.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-toasty-red mt-2 shrink-0" />
                <span><strong>Experience Beats Youth:</strong> Using years of soccer chemistry to outsmart younger, hyper-athletic teams.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-toasty-red mt-2 shrink-0" />
                <span><strong>Welcoming & Inclusive:</strong> Proudly co-ed friendly, creating an inviting environment for all skilled players.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: Club Pillars */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-toasty-red">
                <Users size={18} />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">Club Pillars</h4>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider block">Have Fun</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Enjoy every match, celebrate great plays, and keep locker room banter lighthearted.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider block">Play Forever</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Compete for as long as possible, keeping the passion for soccer alive through every stage of life.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider block">Tell Stories Through Stats</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Log every goal, assist, and match result to build a lasting archive for the team.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Behind The Name */}
        <div className="bg-slate-950 border border-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between h-full space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-toasty-red/10 blur-2xl rounded-full" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-toasty-red/20 border border-toasty-red/40 flex items-center justify-center text-red-300">
                <Flame size={18} />
              </div>
              <h4 className="font-extrabold text-lg text-toasty-tan tracking-tight">Behind The Name</h4>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              <p>
                People often ask: <em className="text-toasty-tan font-medium">"Where did the name 'Toasty FC' come from?"</em>
              </p>
              <p className="font-bold text-white text-base">
                The answer: Mortal Kombat!
              </p>
              <p>
                When registering the squad for the BG Futsal league, Austin needed a team name instantly. As a fan of the Mortal Kombat franchise and Dan Forden's iconic <strong className="text-toasty-tan">"TOASTY!"</strong> easter egg, it was the first thing that popped into his head.
              </p>
              <p className="text-slate-400">
                Today, the toast logo, bread tan & founding crimson red kits have made Toasty FC an unforgettable icon in Bowling Green! 🔥
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
