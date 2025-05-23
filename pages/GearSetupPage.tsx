
import React from 'react';
import { PRIMARY_COLOR, ACCENT_COLOR, TEAM_NAME } from '../constants';

const GearSetupPage: React.FC = () => {
  const gearItems = [
    {
      name: "Main Camera: The Eagle Eye",
      description: `For crystal-clear, full-field coverage, we rely on the "ToastyCam HD Pro". It captures every pass, tackle, and glorious goal in stunning high definition. We usually position it mid-field at an elevated angle for the best tactical view.`,
      imageUrl: "https://picsum.photos/seed/gearCam1/600/400",
      alt: "Main broadcast camera for soccer game"
    },
    {
      name: "Action Cam: Pitch-Side Thrills",
      description: `To get you right into the heart of the action, we use a couple of "EmberGo X" action cameras. These are often placed safely behind the goals or near the corner flags (when regulations permit!) to capture those dynamic, close-up shots and player reactions.`,
      imageUrl: "https://picsum.photos/seed/gearCam2/600/400",
      alt: "Action camera for unique game angles"
    },
    {
      name: "Tripod & Mounts: Steady As She Goes",
      description: `Shaky footage is a no-go! Our main camera is mounted on a "RockSolid Pro" fluid-head tripod for smooth pans and tilts. Action cams use a variety of clamps and mini-tripods to get those unique perspectives without wobbling.`,
      imageUrl: "https://picsum.photos/seed/gearTripod/600/400",
      alt: "Tripod and camera mounts"
    },
    {
      name: "Audio Gear: Hear the Roar!",
      description: `What's a game without the sound of the crowd and the thud of the ball? We use a directional microphone on our main camera to capture ambient game sounds and are exploring options for on-field player mics for special interviews.`,
      imageUrl: "https://picsum.photos/seed/gearAudio/600/400",
      alt: "Audio recording equipment"
    },
    {
      name: "Editing & Streaming Rig (The Toaster Oven)",
      description: `Back at ${TEAM_NAME} HQ, all footage is processed on our custom-built PC, affectionately nicknamed "The Toaster Oven". We're currently working on setting up live streaming capabilities to bring games to you in real-time. Stay tuned!`,
      imageUrl: "https://picsum.photos/seed/gearEditing/600/400",
      alt: "Computer for editing and streaming"
    }
  ];

  return (
    <div className="space-y-12 py-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] mb-2`}>Our Filming Gear & Setup</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Ever wondered how we capture those sizzling {TEAM_NAME} highlights? Here's a peek into the equipment and setup we use to bring all the soccer action to you!
        </p>
      </header>

      <div className="space-y-10">
        {gearItems.map((item, index) => (
          <section 
            key={item.name} 
            className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out overflow-hidden ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex flex-col md:space-x-6 md:space-x-reverse items-center`}
            aria-labelledby={`gear-item-heading-${index}`}
          >
            <img 
              src={item.imageUrl} 
              alt={item.alt} 
              className="w-full md:w-1/3 h-64 object-cover rounded-lg shadow-md mb-4 md:mb-0" 
            />
            <div className="md:w-2/3">
              <h2 id={`gear-item-heading-${index}`} className={`text-2xl font-semibold text-[${ACCENT_COLOR}] mb-3`}>{item.name}</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="text-center py-10 bg-gray-50 rounded-lg shadow-inner">
        <h3 className={`text-2xl font-bold text-[${PRIMARY_COLOR}] mb-3`}>Always Improving!</h3>
        <p className="text-gray-700 max-w-2xl mx-auto">
          We're passionate about sharing the {TEAM_NAME} journey. As a community club, we're always looking for ways to improve our setup. If you have suggestions or expertise in sports videography, we'd love to hear from you!
        </p>
      </section>
    </div>
  );
};

export default GearSetupPage;
