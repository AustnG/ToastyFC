

import React from 'react';
import { Link } from 'react-router-dom';
import { 
    PRIMARY_COLOR, ACCENT_COLOR, TEAM_NAME, TEXT_COLOR_DARK, 
    MaterialGearIcon, MaterialCameraIcon, MaterialListIcon, MaterialQuestionAnswerIcon // Placeholder icons, adjust as needed
} from '../constants';
import Card from '../components/ui/Card';

const GearSetupPage: React.FC = () => {
  const mevoCameraImages = [
    { src: "https://picsum.photos/seed/mevo1/400/300", alt: "Mevo Start Cameras - Triple Pack" },
    { src: "https://picsum.photos/seed/mevo2/400/300", alt: "Mevo Start Camera - Product Box" },
    { src: "https://picsum.photos/seed/mevo3/400/300", alt: "Mevo Start Camera on a tripod stand" },
  ];

  const prosList = [
    "Wireless, easy to set up almost anywhere",
    "Battery powered",
    "Can stream to most major platforms directly (YouTube, Facebook, etc.)",
    "Scaleable"
  ];

  const consList = [
    "Expensive",
    "Network setup can be finicky sometimes without wifi",
    "Requires external device (phone, tablet, or computer) to manage/monitor the video feed",
    "Bit fragile - already taken some camera damage from being around sporting events (i.e. stands being hit with balls)"
  ];

  return (
    <div className="space-y-10 py-8 text-gray-800">
      <header className="text-center mb-10">
        <h1 className={`text-4xl md:text-5xl font-bold ${TEXT_COLOR_DARK} mb-3 flex items-center justify-center`} style={{color: PRIMARY_COLOR}}>
          <MaterialGearIcon className="mr-3" style={{fontSize: '36px'}} /> HOW WE RECORD GAMES
        </h1>
        <div className={`w-24 h-1.5 bg-[${PRIMARY_COLOR}] mx-auto mb-6`}></div>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          Currently we are using the{' '}
          <a
            href="https://mevo.com/products/mevo-start"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-bold text-[${ACCENT_COLOR}] hover:underline`}
          >
            MEVO Start Cameras
          </a>{' '}
          to record our matches.
        </p>
      </header>

      <Card 
        className="bg-white" 
        aria-labelledby="mevo-showcase-heading" 
        // icon={<MaterialCameraIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}} />} // No title prop here, added directly
      >
        <h2 id="mevo-showcase-heading" className={`text-2xl font-semibold text-[${PRIMARY_COLOR}] mb-4 flex items-center`}>
            {/* <MaterialCameraIcon className="mr-2" />  Mevo Camera Showcase */}
            Mevo Camera Showcase
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {mevoCameraImages.map((img, index) => (
            <img
              key={index}
              src={img.src}
              alt={img.alt}
              className="w-full h-auto object-cover rounded-lg shadow-md aspect-video"
              loading="lazy"
            />
          ))}
        </div>
        <p className="text-gray-700 leading-relaxed">
          This wireless and scalable camera system has allowed us to capture all our games with relative ease. Seeing as most of our games are on small courts/fields, we've been able to get good coverage and minimal blind spots using this configuration. While we've only used them in static setups so far, they have worked great for capturing our games so far!
        </p>
      </Card>

      <Card 
        className="bg-gray-50" 
        aria-labelledby="camera-placement-heading"
        title="Our Camera Setup Strategy"
        // icon={<MaterialVideocamIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}} />}
      >
        <div className="flex flex-col md:flex-row md:space-x-6 items-center">
          <div className="md:w-2/3 text-gray-700 leading-relaxed">
            <p className="mb-3">
              Generally we have 2 cameras placed on the corners of the fields +1 additional camera on a smaller stand that we can place for additional angles (we usually place it behind one of the goals).
            </p>
            <p>
              This setup provides a good balance of wide coverage to capture overall gameplay and closer angles for specific actions or areas of interest, like goalmouth scrambles or skillful plays.
            </p>
          </div>
          <div className="md:w-1/3 mt-6 md:mt-0">
            <img
              src="https://placehold.co/600x400/e2e8f0/a0aec0/png?text=Futsal+Court+Diagram%0A(Top-Down+View)%0A2+Corner+Cameras%0A1+Goal+Camera"
              alt="Diagram: Top-down view of a futsal court showing 2 cameras in opposite corners and 1 camera behind a goal."
              className="w-full h-auto object-contain rounded-lg shadow-md"
              loading="lazy"
            />
            <p className="text-xs text-gray-500 text-center mt-1">Visual representation of typical camera placement.</p>
          </div>
        </div>
      </Card>

      <Card 
        className="bg-white" 
        aria-labelledby="pros-cons-heading"
        title="System Pros & Cons"
        // icon={<MaterialListIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h3 className={`text-xl font-semibold text-[${PRIMARY_COLOR}] mb-3`}>PROS:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {prosList.map((pro, index) => <li key={`pro-${index}`}>{pro}</li>)}
            </ul>
          </div>
          <div>
            <h3 className={`text-xl font-semibold text-[${PRIMARY_COLOR}] mb-3`}>CONS:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {consList.map((con, index) => <li key={`con-${index}`}>{con}</li>)}
            </ul>
          </div>
        </div>
      </Card>

      <div className="text-center mt-10 py-6">
        <p className="text-lg text-gray-700">
          Feel free to{' '}
          <Link
            to="/connect/contact"
            className={`font-bold text-[${ACCENT_COLOR}] hover:underline flex items-center justify-center sm:inline-flex`}
          >
            {/* <MaterialQuestionAnswerIcon className="mr-1" />  */}
            CONTACT US
          </Link>
          {' '}with any questions you may have about our setup.
        </p>
      </div>
    </div>
  );
};

export default GearSetupPage;