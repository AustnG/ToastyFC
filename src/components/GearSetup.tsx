import React from 'react';
import { 
  Video, 
  Tv, 
  Compass, 
  Mic, 
  Cpu, 
  Layers, 
  Radio, 
  Info,
  Sliders,
  Settings
} from 'lucide-react';

interface EquipmentItem {
  name: string;
  category: 'Cameras' | 'Audio & Banter' | 'Tactical & Tracking' | 'Production';
  description: string;
  specs: string[];
  icon: React.ElementType;
  badge: string;
}

export const GearSetup: React.FC = () => {
  // Gear and filming equipment list
  const equipmentList: EquipmentItem[] = [
    {
      name: 'Sony FX3 Cinematic Rig',
      category: 'Cameras',
      description: 'The primary sideline workhorse camera. Handles overall game tracking with beautiful cinematic depth, active autofocus, and pristine low-light performance under stadium lights.',
      specs: ['70-200mm f/2.8 GM Lens', '4K 120FPS ultra-smooth tracking', 'Fluid-head heavy-duty tripod'],
      icon: Video,
      badge: 'Main Match'
    },
    {
      name: 'GoPro Hero 12 Black (Goalmouths)',
      category: 'Cameras',
      description: 'Rugged wide-angle action cameras mounted securely inside the rear goal frame. Captures heart-stopping reflex saves, woodwork-rattling strikes, and goalkeeper reactions.',
      specs: ['SuperView 4K 60FPS footage', 'Protective weather shells', 'High-speed magnetic mounts'],
      icon: Tv,
      badge: 'Behind Goals'
    },
    {
      name: 'DJI Mini 4 Pro Drone',
      category: 'Cameras',
      description: 'Deploys during pre-game workouts and half-time intervals. Offers a tactical birds-eye view of player positioning, team shape, and cinematic stadium flyovers.',
      specs: ['True vertical 4K capture', 'ActiveTrack automated tracking', 'Ultra-quiet propeller setup'],
      icon: Compass,
      badge: 'Aerial View'
    },
    {
      name: 'DJI Mic 2 Wireless System',
      category: 'Audio & Banter',
      description: 'Used to record clean field dialogue. Lapel microphones are securely fastened within custom captain and referee sports vests, preserving raw pitch communication.',
      specs: ['32-bit float internal backup', 'Intelligent environmental noise canceling', 'Direct field transmitter linking'],
      icon: Mic,
      badge: 'Raw Banter'
    },
    {
      name: 'STATSports Apex Tracker Vests',
      category: 'Tactical & Tracking',
      description: 'High-frequency GPS pods worn between shoulder blades under player jerseys. Feeds real-time physical performance data, positioning heatmaps, and sprint speeds directly to our telemetry dashboard.',
      specs: ['FIFA-approved sports science pod', 'Accurate 10Hz GPS capture', 'Heart-rate telemetry integration'],
      icon: Cpu,
      badge: 'Telemetry'
    },
    {
      name: 'DaVinci Resolve Studio & custom templates',
      category: 'Production',
      description: 'The hub where raw footage transforms into YouTube episodes. Handles color grading, multi-camera audio sync, and houses our proprietary telemetry graphic templates.',
      specs: ['Custom animated player HUD cards', '3D camera tracker replays', 'Bespoke match graphics overlays'],
      icon: Layers,
      badge: 'Post-Editing'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in" id="gear-setup-view-root">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 border border-slate-900 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-toasty-red/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-toasty-tan/10 blur-2xl rounded-full" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="bg-toasty-red/20 text-red-300 border border-toasty-red/40 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono">
            Tech & Filming
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-tight">
            GEAR & <span className="text-toasty-tan">SETUP</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Filming recreational futsal at broadcast quality is an athletic feat. Explore the multi-angle camera networks, raw banter microphones, and player GPS vests we use to track club logs.
          </p>
        </div>
      </div>

      {/* Production Philosophy */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-widest flex items-center gap-1.5">
            <Radio size={14} className="animate-pulse text-toasty-red" /> Broadcast Philosophy
          </span>
          <h3 className="text-2xl font-black text-slate-900 leading-tight">How We Capture The Action</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We coordinate a specialized system of static sideline tripods, goalmouth action cams, drone flyovers, wireless captain lapels, and body-worn player GPS trackers. Every perspective is synchronized perfectly post-match to ensure fans experience the thrill and comedy of our games.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold font-mono uppercase">
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg">Multi-Cam Sync</span>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg">Field Audio Rigs</span>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg">GPS Analytics Telemetry</span>
          </div>
        </div>

        {/* Telemetry Highlight box */}
        <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-900 space-y-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-toasty-red/10 blur-2xl rounded-full" />
          <h4 className="font-bold text-xs text-toasty-tan uppercase tracking-wider font-mono flex items-center gap-2">
            <Settings size={14} className="text-toasty-tan animate-spin-slow" /> Telemetry Workflow
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            Following each fixture, player GPS tracker logs are matched against our game timeline data, converting raw distances and speeds into dynamic visual cards, overlays, and color charts.
          </p>
          <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
            <span>Render Suite</span>
            <span className="text-emerald-400">DaVinci Resolve Studio</span>
          </div>
        </div>
      </div>

      {/* Grid of Equipment Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipmentList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 hover:border-toasty-tan hover:shadow-lg rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-300"
              id={`gear-item-${idx}`}
            >
              <div className="space-y-3">
                {/* Card Header: Category & Badge */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {item.category}
                  </span>
                  <span className="bg-slate-100 text-slate-800 text-[8px] font-bold uppercase px-2 py-0.5 rounded font-mono border border-slate-200">
                    {item.badge}
                  </span>
                </div>

                {/* Name and Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-toasty-red shrink-0 shadow-sm">
                    <Icon size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
                    {item.name}
                  </h4>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              {/* Specification Highlights List */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">Technical Specs</span>
                <ul className="text-[10px] text-slate-600 font-mono space-y-1">
                  {item.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-1">
                      <span className="text-toasty-red font-bold shrink-0">&bull;</span>
                      <span className="leading-tight">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Watch callout banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-toasty-red/10 blur-2xl rounded-full" />
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span className="text-3xl">📽️</span>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Want to see our setup in action?</h4>
            <p className="text-xs text-slate-400">Subscribe to @toastyfc on YouTube for full game videos and technical setup guides.</p>
          </div>
        </div>
        <a
          href="https://youtube.com/@toastyfc"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-toasty-red text-white border border-red-500/30 font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-toasty-red-hover transition shadow-md whitespace-nowrap shrink-0 cursor-pointer"
        >
          Watch Now
        </a>
      </div>
    </div>
  );
};
