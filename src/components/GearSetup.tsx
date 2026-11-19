import React from 'react';
import { Video, Tv, Compass, Mic, Cpu, Layers, ArrowUpRight } from 'lucide-react';

interface EquipmentItem {
  name: string;
  category: 'Cameras' | 'Audio & Banter' | 'Tactical & Tracking' | 'Production';
  description: string;
  specs: string[];
  icon: React.ElementType;
  role: string;
}

export const GearSetup: React.FC = () => {
  const equipmentList: EquipmentItem[] = [
    {
      name: 'Sony FX3 Cinematic Rig',
      category: 'Cameras',
      description:
        'Primary sideline workhorse camera handling full-court match tracking with crisp autofocus and strong low-light performance under indoor arena lighting.',
      specs: [
        '70-200mm f/2.8 GM Lens',
        '4K 120FPS smooth tracking',
        'Fluid-head heavy-duty tripod'
      ],
      icon: Video,
      role: 'Main Match'
    },
    {
      name: 'GoPro Hero 12 Black (Goalmouths)',
      category: 'Cameras',
      description:
        'Wide-angle action cameras mounted inside the rear goal frame to capture reflex saves, woodwork strikes, and point-blank finishes.',
      specs: ['SuperView 4K 60FPS', 'Protective impact shells', 'High-strength magnetic mounts'],
      icon: Tv,
      role: 'Behind Goals'
    },
    {
      name: 'DJI Mini 4 Pro Drone',
      category: 'Cameras',
      description:
        'Deployed for outdoor pre-match warmups and tactical reviews, offering an elevated view of team shape and movement.',
      specs: ['True 4K capture', 'ActiveTrack automated framing', 'Low-noise propeller profile'],
      icon: Compass,
      role: 'Aerial View'
    },
    {
      name: 'DJI Mic 2 Wireless System',
      category: 'Audio & Banter',
      description:
        'Captures live pitch communication via lightweight wireless transmitters secured inside captain and referee vests.',
      specs: [
        '32-bit float internal backup',
        'Intelligent noise cancellation',
        'Direct wireless receiver sync'
      ],
      icon: Mic,
      role: 'Field Audio'
    },
    {
      name: 'STATSports Apex Tracker Vests',
      category: 'Tactical & Tracking',
      description:
        'High-frequency GPS pods worn under match jerseys to capture distance covered, sprint velocity, and court heatmaps.',
      specs: ['FIFA-approved sports pod', '10Hz GPS sampling', 'Heart-rate telemetry integration'],
      icon: Cpu,
      role: 'Telemetry'
    },
    {
      name: 'DaVinci Resolve Studio Suite',
      category: 'Production',
      description:
        'Post-production workstation for multi-cam synchronization, color grading, and custom animated matchday HUD overlays.',
      specs: [
        'Custom player HUD cards',
        '3D camera-tracked replays',
        'Scoreboard graphic templates'
      ],
      icon: Layers,
      role: 'Post-Production'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in" id="gear-setup-view-root">
      {/* Obsidian Broadcast Banner */}
      <section className="bg-toasty-obsidian text-white rounded-xl p-8 md:p-10 border border-toasty-obsidian-border">
        <div className="space-y-3 max-w-3xl">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-toasty-tan block">
            Matchday Production · Tech &amp; Filming
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tight leading-[0.95]">
            Gear &amp; <span className="text-toasty-tan">Setup</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Filming recreational futsal at broadcast quality takes real hardware. Explore the
            multi-angle camera network, wireless field audio, and GPS telemetry powering Toasty FC
            matchday coverage.
          </p>
        </div>
      </section>

      {/* Broadcast Philosophy & Telemetry Workflow */}
      <section className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-toasty-border">
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
              Broadcast Philosophy
            </span>
            <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-zinc-900 leading-none">
              How We Capture The Action
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              We coordinate sideline cinema cameras, rear-net action cams, wireless captain lapels,
              and player GPS pods into one synchronized workflow. Every angle is aligned post-match
              so every goal, save, and sideline reaction makes the final cut.
            </p>
            <p className="text-xs font-mono text-zinc-500 pt-2">
              Multi-Cam Sync · Wireless Field Audio · GPS Telemetry Overlays
            </p>
          </div>

          <div className="lg:col-span-5 bg-toasty-obsidian text-white p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
                Telemetry Workflow
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed">
                After each fixture, GPS tracker logs are paired with our match timeline so sprint
                peaks, distance totals, and goal sequences render directly into episode graphics.
              </p>
            </div>
            <div className="pt-4 border-t border-toasty-obsidian-border flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 uppercase tracking-wider">Render Suite</span>
              <span className="text-toasty-tan font-semibold">DaVinci Resolve Studio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Specification Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipmentList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              id={`gear-item-${idx}`}
              className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <span>{item.category}</span>
                  <span className="text-toasty-red font-semibold">{item.role}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-toasty-subtle border border-toasty-border flex items-center justify-center text-toasty-red shrink-0">
                    <Icon size={17} />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-wide text-zinc-900 leading-tight">
                    {item.name}
                  </h3>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3.5 border-t border-toasty-border space-y-1.5">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Technical Specs
                </span>
                <ul className="text-xs text-zinc-700 font-mono space-y-1">
                  {item.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-toasty-tan-dark shrink-0">&middot;</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* YouTube Channel Callout */}
      <section className="bg-toasty-obsidian text-white rounded-xl p-6 sm:p-8 border border-toasty-obsidian-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
            Toasty FC Film Room
          </span>
          <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white leading-none">
            See the setup in action on YouTube
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Subscribe to @toastyfc for full match episodes, goalmouth cams, and mic&apos;d-up clips.
          </p>
        </div>
        <a
          href="https://youtube.com/@toastyfc"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-toasty-red hover:bg-toasty-red-hover text-white font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          Watch Channel <ArrowUpRight size={14} />
        </a>
      </section>
    </div>
  );
};
