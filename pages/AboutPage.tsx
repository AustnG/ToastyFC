import React from 'react';
import { ABOUT_TEAM_IMAGE_URL, ABOUT_EASTER_EGG_URL } from '../constants';

const InfoCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="relative bg-background p-6 rounded-xl h-full flex flex-col overflow-visible">
        <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-rounded text-primary text-3xl">{icon}</span>
            <h2 className="text-2xl font-bold text-accent">{title}</h2>
        </div>
        <div className="text-gray-700 space-y-3 flex-grow">
            {children}
        </div>
    </div>
);


const AboutPage: React.FC = () => {
    return (
        <div className="bg-surface border border-border p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-primary mb-8 pb-3 border-b-2 border-border">About Toasty FC</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2 space-y-4 text-gray-700">
                    <p>
                        Toasty FC's journey began with Austin Greer - a seasoned player in the Bowling Green Futsal league. After years of bouncing between various teams, he decided it was time to forge his own path. While his initial foray with "Rocky's FC" faced back-to-back last-place finishes in the B-Division, the desire for a fresh start was strong.
                    </p>
                    <p>
                        Enter Goran Omerdic. Together, they envisioned a new, more competitive squad. By recruiting old friends and talented soccer players from around Bowling Green, Toasty FC was born. This new roster quickly proved its mettle, and within their very first year, Toasty FC achieved a significant milestone by winning the 2023 Spring Season B-Division Championship at Bowling Green Futsal!
                    </p>
                    <p>
                        From the 2022 Winter season until the 2024 Spring season, Toasty FC competed fiercely in the B-Division. Our consistent performance and dedication paid off, earning us a well-deserved promotion to the A-Division in Winter 2024, where we continue to compete today. We're proud to be one of the league's more experienced teams, boasting an average age of 33.
                    </p>
                    <div className="mt-6 p-4 bg-background rounded-lg border-l-4 border-primary shadow-inner">
                        <h3 className="font-bold text-lg text-yellow-500">Fun Fact!</h3>
                        <p className="text-gray-700 mt-1">Toasty FC has advanced to the Bowling Green Futsal playoffs every year since our establishment!</p>
                    </div>
                </div>
                <div className="md:col-span-1">
                    <img src={ABOUT_TEAM_IMAGE_URL} alt="Toasty FC Team Photo" className="rounded-lg shadow-md w-full h-full object-cover" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <InfoCard icon="info" title="Our Mission">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Play entertaining indoor soccer.</li>
                        <li>Deliver quality highlights for our fans via YouTube and other social platforms.</li>
                        <li>Foster a strong sense of camaraderie and teamwork within our squad.</li>
                        <li>Embrace the challenge of competition, even when occasionally reminded of our age against younger opponents!</li>
                    </ul>
                </InfoCard>
                <InfoCard icon="groups" title="Club Values">
                     <ul className="space-y-2">
                        <li><strong className="text-accent">Fun:</strong> We believe futsal should be enjoyable, both on and off the court.</li>
                        <li><strong className="text-accent">Win:</strong> We strive for success and put in the effort to achieve victories.</li>
                        <li><strong className="text-accent">Competitive:</strong> We push ourselves and our opponents to be the best we can be.</li>
                        <li><strong className="text-accent">Professionalism:</strong> We conduct ourselves with respect for our teammates, opponents, and the league.</li>
                    </ul>
                </InfoCard>
                <InfoCard icon="auto_awesome" title="Behind The Name">
                    <p>
                        Many often ask, "Where did the name 'Toasty FC' come from?"
                    </p>
                    <p>
                        The simple answer: Mortal Kombat!
                    </p>
                    <p>
                        The longer story is that when Austin was registering the team for the BGF, he didn't have a name ready. As a big fan of the Mortal Kombat franchise and its iconic "Toasty!" Easter egg, it was the first thing that came to mind. The rest, as they say, is history! 🔥
                    </p>
                    <img 
                        src={ABOUT_EASTER_EGG_URL} 
                        alt="Toasty MK" 
                        className="absolute -bottom-4 -right-4 w-16 h-auto transition-transform duration-300 ease-in-out hover:scale-125 hover:-rotate-12" 
                    />
                </InfoCard>
            </div>
        </div>
    );
};

export default AboutPage;