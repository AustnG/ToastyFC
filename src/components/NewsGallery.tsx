import React, { useState } from 'react';
import { NewsItem, GalleryItem } from '../types';
import { X } from 'lucide-react';
import { compareDatesDesc, formatDateDisplay } from '../lib/dateUtils';

const CLUB_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png';

interface NewsGalleryProps {
  news: NewsItem[];
  gallery: GalleryItem[];
}

export const NewsGallery: React.FC<NewsGalleryProps> = ({ news, gallery }) => {
  const [subTab, setSubTab] = useState<'news' | 'gallery'>('news');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const sortedNews = [...news].sort((a, b) => compareDatesDesc(a.date, b.date));
  const sortedGallery = [...gallery].sort((a, b) => compareDatesDesc(a.date, b.date));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-toasty-border pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
            {subTab === 'news' ? 'Club Press Office' : 'Matchday Archive'}
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
            {subTab === 'news' ? 'News & Bulletins' : 'Photo Gallery'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            {subTab === 'news'
              ? 'Official matchday announcements, campaign dispatches, and club history.'
              : 'Matchday snapshots captured from league nights, tournaments, and club events.'}
          </p>
        </div>

        <div className="bg-toasty-subtle border border-toasty-border p-1 rounded-lg inline-flex self-stretch sm:self-auto">
          <button
            onClick={() => setSubTab('news')}
            id="subtab-toggle-news"
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              subTab === 'news'
                ? 'bg-toasty-obsidian text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            News & History
          </button>
          <button
            onClick={() => setSubTab('gallery')}
            id="subtab-toggle-gallery"
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              subTab === 'gallery'
                ? 'bg-toasty-obsidian text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Photo Gallery
          </button>
        </div>
      </div>

      {subTab === 'news' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Editorial Article Stream */}
          <div className="lg:col-span-8 space-y-8">
            {sortedNews.map((article, index) => (
              <article
                key={`${article.id}-${index}`}
                className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden"
              >
                <div className="aspect-[16/9] max-h-[360px] w-full overflow-hidden bg-toasty-obsidian relative">
                  {article.imageUrl && !imageErrors[`news-${article.id}`] ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setImageErrors(prev => ({ ...prev, [`news-${article.id}`]: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <img
                        src={CLUB_LOGO_URL}
                        alt="Toasty FC"
                        className="w-12 h-12 object-contain opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-toasty-tan">
                        Club Bulletin
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-2 tabular-nums">
                    <span className="text-toasty-red font-semibold">Official Release</span>
                    <span>·</span>
                    <span>
                      {formatDateDisplay(article.date, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-tight">
                    {article.title}
                  </h2>

                  {article.summary && article.summary.trim() !== article.content?.trim() && (
                    <p className="text-zinc-900 text-sm font-semibold bg-toasty-subtle p-4 rounded-lg border border-toasty-border leading-relaxed">
                      {article.summary}
                    </p>
                  )}

                  {article.content && (
                    <p className="text-zinc-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {article.content}
                    </p>
                  )}
                </div>

                <div className="px-6 sm:px-8 py-3.5 border-t border-toasty-border bg-toasty-subtle/50 flex justify-between items-center text-[11px] text-zinc-500 font-mono">
                  <span className="uppercase tracking-wider">Toasty FC Press Office</span>
                  <span className="tabular-nums">
                    {formatDateDisplay(article.date, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </article>
            ))}

            {sortedNews.length === 0 && (
              <div className="text-center py-12 border border-dashed border-toasty-border rounded-xl bg-white">
                <p className="text-zinc-500 text-sm">No club bulletins published yet.</p>
              </div>
            )}
          </div>

          {/* Club Heritage Sidebar (Obsidian Editorial Callout) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-toasty-obsidian text-white rounded-xl p-6 sm:p-8 border border-toasty-obsidian-border space-y-5">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
                Club Heritage
              </span>
              <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white leading-none">
                The Toasty FC Story
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Founded in Winter 2022, Toasty FC began as a local futsal side organized by Austin
                Greer and Goran Omerdic. By Spring 2023, the club claimed its first major silverware
                with the B-Division Championship before advancing to top-tier competition.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Wearing signature bread tan and founding crimson red, Toasty FC blends tactical
                experience, matchday film production, and unmistakable Bowling Green camaraderie.
              </p>
              <div className="pt-5 border-t border-toasty-obsidian-border grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                    Established
                  </span>
                  <strong className="font-display font-extrabold text-2xl text-toasty-tan tabular-nums">
                    2022
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                    Home City
                  </span>
                  <strong className="font-display font-bold text-xl text-white uppercase tracking-wide">
                    Bowling Green
                  </strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGallery.map((photo, index) => (
              <div
                key={`${photo.id}-${index}`}
                onClick={() => setSelectedImage(photo)}
                id={`gallery-photo-${photo.id}`}
                className="group relative bg-toasty-obsidian border border-toasty-border rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  {photo.imageUrl && !imageErrors[`gal-${photo.id}`] ? (
                    <img
                      src={photo.imageUrl}
                      alt={photo.eventName}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setImageErrors(prev => ({ ...prev, [`gal-${photo.id}`]: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-toasty-obsidian text-zinc-500 text-xs font-mono">
                      Image unavailable
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-toasty-tan tabular-nums block">
                      {formatDateDisplay(photo.date, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <h4 className="font-display font-bold text-lg uppercase tracking-wide leading-tight line-clamp-1">
                      {photo.eventName}
                    </h4>
                    {photo.caption && (
                      <p className="text-xs text-zinc-300 line-clamp-1">{photo.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedGallery.length === 0 && (
            <div className="text-center py-12 border border-dashed border-toasty-border rounded-xl bg-white">
              <p className="text-zinc-500 text-sm">No gallery photos uploaded yet.</p>
            </div>
          )}

          {/* Lightbox Modal */}
          {selectedImage && (
            <div
              onClick={() => setSelectedImage(null)}
              id="gallery-lightbox"
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-fade-in"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="relative max-w-4xl w-full bg-toasty-obsidian border border-toasty-obsidian-border rounded-xl overflow-hidden cursor-default"
              >
                <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.eventName}
                    className="max-h-[75vh] w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-t border-toasty-obsidian-border text-white">
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-toasty-tan tabular-nums block">
                      {formatDateDisplay(selectedImage.date, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <h4 className="font-display font-bold text-xl uppercase tracking-wide truncate">
                      {selectedImage.eventName}
                    </h4>
                    {selectedImage.caption && (
                      <p className="text-xs text-zinc-400 mt-0.5">{selectedImage.caption}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    aria-label="Close lightbox"
                    className="w-9 h-9 rounded-lg bg-toasty-obsidian-card border border-toasty-obsidian-border text-zinc-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
