import React, { useState } from 'react';
import { NewsItem, GalleryItem } from '../types';
import { Sparkles, Image as ImageIcon, BookOpen, Clock, Heart, Users } from 'lucide-react';

interface NewsGalleryProps {
  news: NewsItem[];
  gallery: GalleryItem[];
}

export const NewsGallery: React.FC<NewsGalleryProps> = ({ news, gallery }) => {
  const [subTab, setSubTab] = useState<'news' | 'gallery'>('news');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Sort news and gallery in descending order by date so the latest items appear at the top
  const sortedNews = [...news].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.date || '').localeCompare(a.date || '');
  });

  const sortedGallery = [...gallery].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.date || '').localeCompare(a.date || '');
  });

  return (
    <div className="space-y-8">
      {/* Tab Switcher & Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            {subTab === 'news' ? (
              <>
                <BookOpen className="text-toasty-red" size={24} /> News & Club History
              </>
            ) : (
              <>
                <ImageIcon className="text-toasty-red" size={24} /> Fan & Event Gallery
              </>
            )}
          </h2>
          <p className="text-slate-500 text-sm">
            {subTab === 'news' 
              ? 'Stay updated with the latest club match briefings, news, and our rich history.' 
              : 'Memorable snapshots captured live from our games, training, and gatherings.'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-slate-150 p-1 rounded-xl inline-flex self-stretch sm:self-auto text-center border border-slate-200">
          <button
            onClick={() => setSubTab('news')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              subTab === 'news' 
                ? 'bg-toasty-red text-white shadow-md border border-red-500/30' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="subtab-toggle-news"
          >
            News & History
          </button>
          <button
            onClick={() => setSubTab('gallery')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              subTab === 'gallery' 
                ? 'bg-toasty-red text-white shadow-md border border-red-500/30' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="subtab-toggle-gallery"
          >
            Photo Gallery
          </button>
        </div>
      </div>

      {subTab === 'news' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News Stream */}
          <div className="lg:col-span-2 space-y-8">
            {sortedNews.map((article, index) => (
              <article key={`${article.id}-${index}`} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-64 sm:h-80 overflow-hidden relative">
                  <img
                    src={article.imageUrl || null}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 bg-slate-950/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-mono font-medium border border-slate-800">
                    {article.date}
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-toasty-red font-bold uppercase tracking-wider font-mono">
                    <Clock size={12} /> Club Announcement
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 hover:text-toasty-red transition cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                </div>

                <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50 text-xs text-slate-400 font-mono">
                  <span>Written by: <strong>{article.author}</strong></span>
                  <span className="flex items-center gap-1"><Heart size={12} className="text-toasty-red fill-toasty-red" /> Toasty Fan Favourite</span>
                </div>
              </article>
            ))}
          </div>

          {/* Club History & Mission Column */}
          <div className="space-y-6">
            <div className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-900 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-toasty-red/10 blur-3xl rounded-full" />
              <div className="inline-flex items-center gap-1.5 bg-toasty-red/20 text-red-300 border border-toasty-red/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                <Users size={12} /> Our Legacy
              </div>
              <h3 className="text-2xl font-bold tracking-tight">The Toasty FC Story</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Founded in Winter 2022, Toasty FC began as a casual weekend futsal run organized by Austin Greer and Goran Omerdic. Fast forward to 2023, and the team earned its first major silverware with the B-Division Championship, ultimately earning promotion to the top-tier A-Division in Winter 2024.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Today, Toasty FC represents camaraderie, competitive edge, and high-production sports coverage. We wear our signature bread tan and founding crimson red with absolute pride, treating every battle on the court with equal humor and commitment.
              </p>
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Est.</span>
                  <strong className="text-lg text-toasty-tan font-mono font-bold">2022</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Home Field</span>
                  <strong className="text-sm text-toasty-tan font-mono block truncate font-bold">Futsal Court</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Image Gallery masonry style */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGallery.map((photo, index) => (
              <div
                key={`${photo.id}-${index}`}
                onClick={() => setSelectedImage(photo.imageUrl)}
                className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                id={`gallery-photo-${photo.id}`}
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={photo.imageUrl || null}
                    alt={photo.eventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[10px] bg-toasty-red text-white border border-red-500/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      {photo.date}
                    </span>
                    <h4 className="font-bold text-sm leading-tight line-clamp-1">{photo.eventName}</h4>
                    <p className="text-xs text-slate-300 line-clamp-1 leading-normal font-medium">{photo.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded Lightbox Modal */}
          {selectedImage && (
            <div 
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
              id="gallery-lightbox"
            >
              <div className="relative max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-2xl">
                <img
                  src={selectedImage || null}
                  alt="Expanded view"
                  className="w-full h-full object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-950/60 text-white font-bold text-lg flex items-center justify-center hover:bg-slate-950/80 transition"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
