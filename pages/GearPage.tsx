import React from 'react';
import { GEAR_IMAGES } from '../constants';

const GearPage: React.FC = () => {
  const pros = [
    "Wireless - easy to set up almost anywhere",
    "Battery powered",
    "Scalable - can use multiple cameras at once",
    "Can stream to most major platforms directly (YouTube, Facebook, etc.)"
  ];

  const cons = [
    "Expensive",
    "Networking can be tricky without wifi/cellular hotspot",
    "Requires external device (phone, tablet, or computer) to manage/monitor the video feed(s)",
    "Fragile - already taken some camera damage from being around sporting events"
  ];

  return (
    <div className="bg-surface border border-border p-8 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-primary mb-6 pb-3 border-b-2 border-border">Gear & Setup</h1>
      <p className="text-gray-700 mb-8">
        We often get asked about how we film our matches. Here's a look at the gear we use to capture all the action.
      </p>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-accent mb-4">Mevo Start Cameras</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GEAR_IMAGES.map((src, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-[4/3]">
              <img src={src} alt={`Mevo Camera ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="text-gray-700 mt-6 leading-relaxed">
          Currently we are using the MEVO Start Cameras to record our matches. This wireless and scalable camera system has allowed us to capture all our games with relative ease. Seeing as most of our games are on small courts/fields, we've been able to get good coverage and minimal blind spots using a 3 camera configuration. While we've only used them in static setups so far, they have worked great for capturing our games!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-background p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold text-green-500 mb-4">Pros</h2>
          <ul className="space-y-3">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start p-3 rounded-lg bg-surface/50 transition-all duration-300">
                <span className="material-symbols-rounded flex-shrink-0 text-green-500 mr-3">check_circle</span>
                <span className="text-gray-700">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-background p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Cons</h2>
           <ul className="space-y-3">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start p-3 rounded-lg bg-surface/50 transition-all duration-300">
                <span className="material-symbols-rounded flex-shrink-0 text-red-500 mr-3">cancel</span>
                <span className="text-gray-700">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GearPage;