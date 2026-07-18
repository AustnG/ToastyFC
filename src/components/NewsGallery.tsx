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

  return (
    <div className="space-y-8">
      {/* Tab Switcher & Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            {subTab === 'news' ? (
              <>
                <BookOpen className="text-amber-500" size={24} /> News & Club History
              </>
            ) : (
              <>
                <ImageIcon className="text-amber-500" size={24} /> Fan & Event Gallery
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
        <div className="bg-slate-100 p-1 rounded-xl inline-flex self-stretch sm:self-auto text-center">
          <button
            onClick={() => setSubTab('news')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              subTab === 'news' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
            id="subtab-toggle-news"
          >
            News & History
          </button>
          <button
            onClick={() => setSubTab('gallery')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              subTab === 'gallery' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
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
            {news.map((article, index) => (
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
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold uppercase tracking-wider font-mono">
                    <Clock size={12} /> Club Announcement
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 hover:text-amber-600 transition cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                </div>

                <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50 text-xs text-slate-400 font-mono">
                  <span>Written by: <strong>{article.author}</strong></span>
                  <span className="flex items-center gap-1"><Heart size={12} className="text-rose-500 fill-rose-500" /> Toasty Fan Favourite</span>
                </div>
              </article>
            ))}
          </div>

          {/* Club History & Mission Column */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-8 border border-slate-800 space-y-6 shadow-lg">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                <Users size={12} /> Our Legacy
              </div>
              <h3 className="text-2xl font-bold tracking-tight">The Toasty FC Story</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Founded in Winter 2022, Toasty FC began as a casual weekend futsal run organized by Austin Greer and Goran Omerdic. Fast forward to 2023, and the team earned its first major silverware with the B-Division Championship, ultimately earning promotion to the top-tier A-Division in Winter 2024.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Today, Toasty FC represents camaraderie, competitive edge, and high-production sports coverage. We wear our gold and charcoal colors with absolute pride, treating every battle on the court with equal humor and commitment.
              </p>
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Est.</span>
                  <strong className="text-lg text-amber-400 font-mono font-bold">2022</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Home Field</span>
                  <strong className="text-sm text-amber-400 font-mono block truncate font-bold">Futsal Court</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Image Gallery masonry style */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((photo, index) => (
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
                    <span className="text-[10px] bg-amber-500/85 backdrop-blur text-white px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
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
