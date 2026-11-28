import React from 'react';
import { Video, Tv, HardDrive, Cpu, Layers, Database, ArrowUpRight } from 'lucide-react';

interface EquipmentItem {
  name: string;
  category: 'Cameras' | 'Storage & Archive' | 'Workstation' | 'Post-Production' | 'Data & Web';
  description: string;
  specs: string[];
  icon: React.ElementType;
  role: string;
}

export const GearSetup: React.FC = () => {
  const equipmentList: EquipmentItem[] = [
    {
      name: 'Mevo Start 3-Pack',
      category: 'Cameras',
      description:
        'Our workhorse multi-angle camera kit deployed on floor and table stands along the midfield line, opposite ends of the court, and behind the goal when running a 3-camera match setup.',
      specs: [
        '3x 1080p HD wireless cameras',
        'Sideline, end-line & goal-cam angles',
        'Portable floor & table stand rigs'
      ],
      icon: Video,
      role: 'Multi-Angle'
    },
    {
      name: 'Veo Cam 3 (Gen 3)',
      category: 'Cameras',
      description:
        'Single static midfield camera with dual wide-angle lenses stitched together into one panoramic match timeline—capturing full-court and full-field action without manual panning.',
      specs: [
        '4K dual-lens stitched capture',
        'Single midfield tripod position',
        'Full-court continuous timeline'
      ],
      icon: Tv,
      role: 'Single Timeline'
    },
    {
      name: 'Synology DS720+ NAS',
      category: 'Storage & Archive',
      description:
        'Dedicated home NAS server archiving every season of raw Mevo multi-angle files, 4K Veo exports, and finished 1080p YouTube highlight reels in structured per-match folders.',
      specs: [
        'Multi-TB centralized media vault',
        'Mapped network drive workflow',
        'Raw footage + final edit archive'
      ],
      icon: HardDrive,
      role: 'Media Vault'
    },
    {
      name: 'MAINGEAR TURBO Rig',
      category: 'Workstation',
      description:
        'Compact desktop workstation powering fast NVENC hardware video rendering, proxy generation, and overnight batch processing directly against our NAS archive.',
      specs: [
        'AMD Ryzen 5 5600X (6-Core)',
        'NVIDIA GeForce RTX 3070 (NVENC)',
        '1TB Samsung 980 PRO NVMe SSD'
      ],
      icon: Cpu,
      role: 'Edit & Batch'
    },
    {
      name: 'DaVinci Resolve',
      category: 'Post-Production',
      description:
        'Post-production editing suite used to trim dead air into tight 5–8 minute match highlights with pure raw court audio, intro/halftime stingers, top-corner scoreboard bugs, and full-time stat cards.',
      specs: [
        '1080p YouTube highlight exports',
        'Live scorebug + jersey colors',
        'Custom intro, halftime & stat outro'
      ],
      icon: Layers,
      role: 'Post-Production'
    },
    {
      name: 'Sheets → GitHub Pages Pipeline',
      category: 'Data & Web',
      description:
        'Zero-cost publishing stack turning our private Google Sheet match ledger into a validated static dataset powering ToastyFC.com with automatic nightly syncs and one-click publishing.',
      specs: [
        'Private Google Sheets CMS',
        'GitHub Actions validated JSON build',
        'Static CDN hosting on ToastyFC.com'
      ],
      icon: Database,
      role: 'Stats & Site'
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
            Filming amateur futsal and small-sided soccer like a real club starts with dependable,
            repeatable hardware. Here is the actual camera kit, NAS archive, editing rig, and
            data pipeline behind Toasty FC highlights and stats.
          </p>
        </div>
      </section>

      {/* Production Workflow */}
      <section className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-toasty-border">
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
              Production Philosophy
            </span>
            <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-zinc-900 leading-none">
              How We Capture The Action
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Depending on camera availability each week, matches are filmed either across 2–3
              static Mevo Start angles (including an occasional behind-the-goal cam) or a single
              midfield Veo Gen 3 stitched timeline. We keep pure gym and field audio—cutting out
              dead air to deliver crisp 5–8 minute traditional soccer highlight reels.
            </p>
            <p className="text-xs font-mono text-zinc-500 pt-2">
              Mevo Start 3-Pack · Veo Gen 3 · Synology DS720+ · 1080p YouTube Highlights
            </p>
          </div>

          <div className="lg:col-span-5 bg-toasty-obsidian text-white p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
                Matchday to YouTube Pipeline
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed">
                After the final whistle, raw footage is archived to our Synology DS720+ NAS,
                reviewed for team and player box-score stats, cut in 1080p with scoreboard and
                full-time stat graphics, and published to YouTube and ToastyFC.com.
              </p>
            </div>
            <div className="pt-4 border-t border-toasty-obsidian-border flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 uppercase tracking-wider">Edit Suite</span>
              <span className="text-toasty-tan font-semibold">DaVinci Resolve + RTX 3070</span>
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
            Subscribe to @toastyfc for 1080p match highlights, goal-cam angles, and full-time stat
            breakdowns.
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
