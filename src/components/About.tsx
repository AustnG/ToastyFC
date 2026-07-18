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
  Clock
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in" id="about-page-root">
      {/* Editorial Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 border border-slate-900 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 blur-2xl rounded-full" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono">
            Our Story
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-tight">
            ABOUT <span className="text-amber-400">TOASTY FC</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            From back-to-back last-place finishes to league champions. Explore the journey, mission, and unique identity of Bowling Green's most entertaining futsal club.
          </p>
        </div>
      </div>

      {/* Main Backstory & Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The Journey Narrative */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-sm text-amber-600">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest">History & Rise</span>
              <h3 className="text-2xl font-black text-slate-900">The Journey of Toasty FC</h3>
            </div>
          </div>

          <div className="space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            <p>
              Toasty FC's journey began with <strong className="text-slate-900 font-bold">Austin Greer</strong> - a seasoned player in the Bowling Green Futsal league. After years of bouncing between various teams, he decided it was time to forge his own path. While his initial foray with "Rocky's FC" faced back-to-back last-place finishes in the B-Division, the desire for a fresh start was strong.
            </p>
            <p>
              Enter <strong className="text-slate-900 font-bold">Goran Omerdic</strong>. Together, they envisioned a new, more competitive squad. By recruiting old friends and talented soccer players from around Bowling Green, Toasty FC was born. This new roster quickly proved its mettle, and within their very first year, Toasty FC achieved a significant milestone by winning the <strong className="text-amber-600 font-extrabold">2023 Spring Season B-Division Championship</strong> at Bowling Green Futsal!
            </p>
            <p>
              From the 2022 Winter season until the 2024 Spring season, Toasty FC competed fiercely in the B-Division. Our consistent performance and dedication paid off, earning us a well-deserved promotion to the prestigious <strong className="text-slate-900 font-bold">A-Division in Winter 2024</strong>, where we continue to compete today.
            </p>
            <p>
              We're proud to be one of the league's more experienced teams, boasting an average age of <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-900 font-bold font-mono">33</span>.
            </p>
          </div>

          {/* Fun Fact Callout Card */}
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-l-4 border-amber-500 rounded-r-2xl p-5 relative overflow-hidden">
            <div className="absolute right-3 bottom-0 text-7xl opacity-5 pointer-events-none font-black">🔥</div>
            <h4 className="font-mono text-xs font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-600" /> Fun Fact!
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
              Toasty FC has advanced to the Bowling Green Futsal playoffs every single year since our establishment!
            </p>
          </div>
        </div>

        {/* Right Column: Key Details Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-900 rounded-3xl p-6 text-white shadow-md flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Club Overview</h4>
              <p className="text-[11px] text-slate-400">Core metrics that represent our identity.</p>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs font-medium space-y-1">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} className="text-amber-500" /> Founded</span>
                <span className="font-bold text-slate-100 font-mono">Winter 2022</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><TrendingUp size={13} className="text-amber-500" /> Current Flight</span>
                <span className="font-bold text-amber-400 font-mono text-[10px] uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">A-Division</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock size={13} className="text-amber-500" /> Average Age</span>
                <span className="font-bold text-slate-100 font-mono">33 Years Old</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Award size={13} className="text-amber-500" /> Major Honors</span>
                <span className="font-bold text-emerald-400">2023 Spring Champs</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-lg font-black shrink-0">⚽</div>
              <div className="min-w-0">
                <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest">Base Arena</span>
                <span className="text-xs text-slate-200 truncate block">Bowling Green Futsal</span>
              </div>
            </div>
          </div>

          {/* Quick Quote */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="font-black text-xs text-slate-400 uppercase tracking-widest font-mono">Squad Creed</h5>
              <p className="text-xs text-slate-800 leading-normal italic font-medium">
                "We don't get older, we just get toastier."
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-sm animate-pulse">
              🥪
            </div>
          </div>
        </div>

      </div>

      {/* Modern Interactive Timeline */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-900 relative overflow-hidden shadow-xl" id="about-timeline-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full" />

        <div className="relative z-10 space-y-2 mb-12 text-center max-w-2xl mx-auto">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Our Legacy
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
            Club <span className="text-amber-400">Milestones</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            How a casual weekend pickup game evolved into a high-production media-driven soccer club.
          </p>
        </div>

        {/* Timeline Path Tree */}
        <div className="relative max-w-4xl mx-auto z-10">
          {/* Vertical center track line */}
          <div className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-amber-400 to-indigo-500 opacity-20 transform -translate-x-1/2 hidden sm:block" />
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-amber-400 to-indigo-500 opacity-20 sm:hidden" />

          <div className="space-y-12 sm:space-y-16">
            {/* Timeline Node 2022 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              {/* Timeline Center Dot Indicator */}
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-amber-500 shadow-md shadow-amber-500/20 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              {/* Left Column Box (Odd: 2022 on Left) */}
              <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:text-right space-y-2 order-2 sm:order-1">
                <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2022 Season
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">The Kickoff</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toasty FC was founded in Bowling Green, KY by soccer enthusiasts seeking to elevate the weekend recreational game with visual storytelling.
                </p>
              </div>
              <div className="hidden sm:block w-[45%] order-2" />
            </div>

            {/* Timeline Node 2023 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              {/* Timeline Center Dot Indicator */}
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-amber-400 shadow-md shadow-amber-400/20 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              {/* Right Column Box (Even: 2023 on Right) */}
              <div className="hidden sm:block w-[45%] text-right order-1" />
              <div className="w-full sm:w-[45%] pl-10 sm:pl-10 text-left space-y-2 order-2">
                <span className="inline-block bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2023 Season
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">GoPro Evolution</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Introduced goal-mouth GoPro cameras and referee perspective rigs, capturing intense, high-framerate goal line scrambles and raw field-level audio.
                </p>
              </div>
            </div>

            {/* Timeline Node 2024 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              {/* Timeline Center Dot Indicator */}
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-amber-400 shadow-md shadow-amber-400/20 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              {/* Left Column Box (Odd: 2024 on Left) */}
              <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:text-right space-y-2 order-2 sm:order-1">
                <span className="inline-block bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2024 Season
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">GPS Stats Integration</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Acquired professional GPS trackers for players to synchronize dynamic top speed, high-intensity sprints, and distance metrics into on-screen graphics.
                </p>
              </div>
              <div className="hidden sm:block w-[45%] order-2" />
            </div>

            {/* Timeline Node 2025 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              {/* Timeline Center Dot Indicator */}
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-amber-500 shadow-md shadow-amber-500/20 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              {/* Right Column Box (Even: 2025 on Right) */}
              <div className="hidden sm:block w-[45%] text-right order-1" />
              <div className="w-full sm:w-[45%] pl-10 sm:pl-10 text-left space-y-2 order-2">
                <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2025 Season
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">The Pitch Burner Era</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Launched full YouTube multi-angle match broadcasts, gaining thousands of subscribers who tune in for both competitive soccer and hilarious banter.
                </p>
              </div>
            </div>

            {/* Timeline Node 2026 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              {/* Timeline Center Dot Indicator */}
              <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-indigo-500 shadow-md shadow-indigo-500/20 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-125" />
              
              {/* Left Column Box (Odd: 2026 on Left) */}
              <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:text-right space-y-2 order-2 sm:order-1">
                <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                  2026 Season
                </span>
                <h4 className="font-extrabold text-base text-slate-100 tracking-tight leading-snug">Modern Club Status</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Competing at high levels in regional soccer tournaments and local leagues with fully realized sports analysis, telemetry, and community integrations.
                </p>
              </div>
              <div className="hidden sm:block w-[45%] order-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Mission, Values & Behind the Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Card 1: Our Mission */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Info size={18} />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">Our Mission</h4>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>Play entertaining indoor soccer.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>Deliver quality highlights for our fans via YouTube and other social platforms.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>Foster a strong sense of camaraderie and teamwork within our squad.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>Embrace the challenge of competition, even when occasionally reminded of our age against younger opponents!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: Club Values */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Users size={18} />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">Club Values</h4>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block">Fun</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">We believe futsal should be enjoyable, both on and off the court.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block">Win</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">We strive for success and put in the effort to achieve victories.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block">Competitive</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">We push ourselves and our opponents to be the best we can be.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block">Professionalism</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">We conduct ourselves with respect for our teammates, opponents, and the league.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Behind The Name */}
        <div className="bg-slate-950 border border-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between h-full space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame size={18} />
              </div>
              <h4 className="font-extrabold text-lg text-amber-400 tracking-tight">Behind The Name</h4>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              <p>
                Many often ask, <em className="text-amber-300">"Where did the name 'Toasty FC' come from?"</em>
              </p>
              <p className="font-bold text-white text-base">
                The simple answer: Mortal Kombat!
              </p>
              <p>
                The longer story is that when Austin was registering the team for the BGF, he didn't have a name ready. As a big fan of the Mortal Kombat franchise and its iconic <strong className="text-amber-400">"Toasty!"</strong> Easter egg, it was the first thing that came to mind.
              </p>
              <p>
                The rest, as they say, is history! 🔥
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
