import React from 'react';
import { Award, BarChart2, Flame, Users, Shield } from 'lucide-react';

const CLUB_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png';

const PALETTE_SWATCHES = [
  {
    name: 'Bread Tan',
    hex: '#CABBA2',
    role: 'Primary Kit',
    description:
      'Inspired by toasted bread. An unmistakable kit tone that ensures zero color clashes across every league.',
    bgStyle: '#CABBA2',
    textClass: 'text-zinc-900',
    borderClass: 'border-black/10'
  },
  {
    name: 'Founding Crimson',
    hex: '#AA0000',
    role: 'Secondary Kit',
    description:
      'The inaugural color of the 2022 squad. Serves today as our away kit and matchday accent.',
    bgStyle: '#AA0000',
    textClass: 'text-white',
    borderClass: 'border-black/10'
  },
  {
    name: 'Crisp White',
    hex: '#FFFFFF',
    role: 'Tertiary & Trim',
    description: 'Clean jersey numbering, collar trim, and alternate detailing across kit generations.',
    bgStyle: '#FFFFFF',
    textClass: 'text-zinc-900',
    borderClass: 'border-zinc-300'
  },
  {
    name: 'Obsidian Black',
    hex: '#0D0D0F',
    role: 'Outlines & Contrast',
    description: 'Provides structural contrast, crest framing, and legibility under court lighting.',
    bgStyle: '#0D0D0F',
    textClass: 'text-white',
    borderClass: 'border-zinc-800'
  }
];

const MILESTONES = [
  {
    year: '2022',
    tag: 'The Kickoff',
    title: 'Founding & Inaugural Crimson Kit',
    description:
      'Austin Greer and Goran Omerdic founded Toasty FC in Bowling Green, KY. The squad debuted in dark crimson (#AA0000) uniforms.',
    dotClass: 'border-toasty-red'
  },
  {
    year: '2023',
    tag: 'Silverware & Film',
    title: 'Spring B-Division Champions',
    description:
      'Toasty FC lifted its first major trophy in the BG Futsal B-Division Spring Championship and introduced Mevo goal cameras for match highlights.',
    dotClass: 'border-toasty-tan'
  },
  {
    year: '2024',
    tag: 'Kit Evolution',
    title: 'The Signature Bread Tan Kit',
    description:
      'Transitioned to the iconic Bread Tan (#CABBA2) home jerseys, establishing Toasty FC as the most recognizable club in Bowling Green.',
    dotClass: 'border-toasty-tan'
  },
  {
    year: '2026',
    tag: 'Multi-League Era',
    title: 'Citywide Expansion & 3rd Gen Kit',
    description:
      'Expanded into multiple indoor and outdoor leagues across Bowling Green alongside the 3rd-generation kit and full club analytics hub.',
    dotClass: 'border-emerald-400'
  }
];

export const About: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in" id="about-page-root">
      {/* Editorial Obsidian Club Banner */}
      <section className="bg-toasty-obsidian text-white rounded-xl p-8 md:p-10 border border-toasty-obsidian-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-toasty-tan block">
              Bowling Green, KY · Established 2022
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tight leading-[0.95]">
              About <span className="text-toasty-tan">Toasty FC</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              From local futsal roots to Bowling Green&apos;s cult-classic side. Explore our club
              history, Bread Tan &amp; Founding Crimson identity, and tactical philosophy.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-toasty-obsidian-card border border-toasty-obsidian-border p-3.5 flex items-center justify-center">
              <img
                src={CLUB_LOGO_URL}
                alt="Toasty FC Official Crest"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 mt-2.5">
              Official Crest
            </span>
          </div>
        </div>
      </section>

      {/* Main Story + Club Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-toasty-surface border border-toasty-border rounded-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-toasty-border pb-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
              Origins &amp; Evolution
            </span>
            <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-zinc-900 mt-1 leading-none">
              The Story of Toasty FC
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
            <p>
              Toasty FC was co-founded in Bowling Green, KY by{' '}
              <strong className="text-zinc-900 font-semibold">Austin Greer</strong> and{' '}
              <strong className="text-zinc-900 font-semibold">Goran Omerdic</strong>. What began as
              a casual effort to field a competitive squad in the{' '}
              <strong className="text-zinc-900 font-semibold">BG Futsal B-Division</strong> quickly
              grew into a fixture across multiple leagues in the city.
            </p>
            <p>
              In <strong className="text-toasty-red font-semibold">Spring 2023</strong>, Toasty FC
              captured its first major silverware by winning the{' '}
              <strong className="text-zinc-900 font-semibold">
                BG Futsal B-Division Spring Championship
              </strong>
              . Since then, the club has expanded across indoor and outdoor competitions with the
              same mix of tactical poise, camaraderie, and humor.
            </p>
            <p>
              Most of the squad consists of former high school and college players now in their 20s
              and 30s. As the roster likes to say:{' '}
              <em className="text-zinc-900 font-medium">
                &ldquo;Our minds move faster than our bodies do these days.&rdquo;
              </em>{' '}
              On tight courts, positioning, quick wall-passes, and shared chemistry routinely outplay
              younger, faster opposition.
            </p>
            <p>
              Above all, Toasty FC is an inviting, inclusive squad that never takes itself too
              seriously — proudly fielding co-ed lineups even against all-male divisions.
            </p>
          </div>

          {/* Locker Room Inside Joke Callout (Flat Hairline Frame, No border-l-4, No Emoji) */}
          <div className="bg-toasty-subtle border border-toasty-border rounded-lg p-5 space-y-2">
            <h3 className="font-mono text-xs font-bold text-toasty-red uppercase tracking-wider flex items-center gap-2">
              <BarChart2 size={14} /> Locker Room Lore · &ldquo;Austin&apos;s Stat Audit&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
              Co-founder <strong className="text-zinc-900">Austin Greer</strong> consistently leads
              the squad in goals and assists — and just so happens to be the webmaster and official
              stat keeper. The locker room refrain remains eternal:{' '}
              <em className="text-toasty-red font-medium">
                &ldquo;Is Austin really that clinical in front of goal, or does he just own the
                spreadsheet?&rdquo;
              </em>
            </p>
          </div>
        </div>

        {/* Right Sidebar: Club Ledger & Motto */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-toasty-obsidian text-white border border-toasty-obsidian-border rounded-xl p-6 space-y-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
                Club Ledger
              </span>
              <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white mt-1 leading-none">
                At a Glance
              </h3>
            </div>

            <div className="divide-y divide-toasty-obsidian-border text-xs">
              <div className="py-3 flex items-center justify-between gap-3">
                <span className="text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  Established
                </span>
                <span className="font-mono font-semibold text-white">Winter 2022</span>
              </div>
              <div className="py-3 flex items-center justify-between gap-3">
                <span className="text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  Co-Founders
                </span>
                <span className="font-semibold text-white">Austin G. &amp; Goran O.</span>
              </div>
              <div className="py-3 flex items-center justify-between gap-3">
                <span className="text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  Home City
                </span>
                <span className="font-mono font-semibold text-toasty-tan">Bowling Green, KY</span>
              </div>
              <div className="py-3 flex items-center justify-between gap-3">
                <span className="text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  Honors
                </span>
                <span className="font-semibold text-emerald-400">2023 Spring B-Champs</span>
              </div>
              <div className="py-3 flex items-center justify-between gap-3">
                <span className="text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  Circuit
                </span>
                <span className="font-semibold text-zinc-200">BG Futsal &amp; Local Leagues</span>
              </div>
            </div>
          </div>

          <div className="bg-toasty-surface border border-toasty-border rounded-xl p-6 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
              Squad Motto
            </span>
            <p className="font-display font-bold text-2xl uppercase tracking-tight text-zinc-900 leading-tight">
              &ldquo;Experience over extra running. Stay Toasty.&rdquo;
            </p>
          </div>
        </aside>
      </section>

      {/* Official Colors & Kit Identity */}
      <section
        id="about-colors-section"
        className="bg-toasty-surface border border-toasty-border rounded-xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-toasty-border pb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
              Kit &amp; Visual Identity
            </span>
            <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-zinc-900 mt-1 leading-none">
              The Bread Tan Palette
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
            A club color palette unlike anyone else in the league — unmistakable on every court.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PALETTE_SWATCHES.map(swatch => (
            <div key={swatch.hex} className="space-y-3">
              <div
                className={`h-20 rounded-lg border ${swatch.borderClass} flex flex-col justify-between p-3`}
                style={{ backgroundColor: swatch.bgStyle }}
              >
                <span className={`text-[10px] font-mono uppercase tracking-widest opacity-80 ${swatch.textClass}`}>
                  {swatch.role}
                </span>
                <span className={`font-mono font-bold text-xs ${swatch.textClass}`}>
                  {swatch.hex}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg uppercase tracking-wide text-zinc-900 leading-none">
                  {swatch.name}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{swatch.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones & Kit Evolutions Timeline */}
      <section
        id="about-timeline-section"
        className="bg-toasty-obsidian text-white rounded-xl p-6 sm:p-10 border border-toasty-obsidian-border space-y-8"
      >
        <div className="border-b border-toasty-obsidian-border pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
              Club Timeline
            </span>
            <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-white mt-1 leading-none">
              Milestones &amp; <span className="text-toasty-tan">Kit Evolutions</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Key chapters since our founding kickoff in Winter 2022.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONES.map(m => (
            <div
              key={m.year}
              className="bg-toasty-obsidian-card border border-toasty-obsidian-border rounded-lg p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-toasty-obsidian-border">
                <span className="font-display font-extrabold text-3xl text-white tabular-nums leading-none">
                  {m.year}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-toasty-tan">
                  {m.tag}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wide text-white leading-snug">
                {m.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tactical Philosophy, Club Pillars & Behind the Name */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-toasty-surface border border-toasty-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-toasty-border">
            <Shield size={16} className="text-toasty-red shrink-0" />
            <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none">
              Tactical Philosophy
            </h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <li>
              <strong className="text-zinc-900">Small-Court Intelligence:</strong> Crisp short
              passes, wall-plays, and spacing over aimless sprinting.
            </li>
            <li>
              <strong className="text-zinc-900">Experience Beats Youth:</strong> Leveraging years of
              chemistry to control tempo against younger athletic squads.
            </li>
            <li>
              <strong className="text-zinc-900">Welcoming &amp; Co-Ed:</strong> Competitive yet
              inclusive football for every skilled player on the bench.
            </li>
          </ul>
        </div>

        <div className="bg-toasty-surface border border-toasty-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-toasty-border">
            <Users size={16} className="text-toasty-tan-dark shrink-0" />
            <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none">
              Club Pillars
            </h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <div>
              <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider block">
                Have Fun
              </span>
              <p>Celebrate great goals, compete hard, and keep locker room banter sharp.</p>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider block">
                Play Forever
              </span>
              <p>Keep the love for the game alive season after season.</p>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider block">
                Tell Stories Through Stats
              </span>
              <p>Log every goal, assist, block, and fixture into a lasting club archive.</p>
            </div>
          </div>
        </div>

        <div className="bg-toasty-obsidian text-white border border-toasty-obsidian-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-toasty-obsidian-border">
            <Flame size={16} className="text-toasty-tan shrink-0" />
            <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-toasty-tan leading-none">
              Behind The Name
            </h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p className="text-zinc-400">
              Where did the name &ldquo;Toasty FC&rdquo; come from?
            </p>
            <p className="font-display font-bold text-xl uppercase tracking-wide text-white">
              Mortal Kombat.
            </p>
            <p>
              While registering the squad for BG Futsal, Austin needed a club name on the spot. A
              nod to Dan Forden&apos;s classic{' '}
              <strong className="text-toasty-tan">&ldquo;TOASTY!&rdquo;</strong> easter egg became
              an instant Bowling Green icon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
