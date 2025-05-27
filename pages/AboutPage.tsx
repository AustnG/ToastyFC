
import React from 'react';
import Card from '../components/ui/Card';
import { 
    TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, MaterialTeamIcon, MaterialClubIcon, MaterialSparklesIcon,
    // Fix: Import missing MaterialUsersIcon
    MaterialUsersIcon
} from '../constants';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 py-6">
      <header className="text-center py-6">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] flex items-center justify-center`}>
            <MaterialClubIcon className="mr-3" style={{fontSize: '36px'}} /> About {TEAM_NAME}
        </h1>
      </header>

      <Card 
        title="Our Story" 
        className="bg-white" 
        icon={<MaterialTeamIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}}/>}
      >
        <img src="https://picsum.photos/seed/teamspirit/800/300" alt="Team Spirit" className="w-full h-64 object-cover rounded-md mb-6 shadow-md"/>
        <p className="text-gray-700 leading-relaxed mb-4">
          {TEAM_NAME} was founded in the fiery pits of friendly competition, forged by a shared love for the beautiful game (and perhaps an unhealthy obsession with perfectly toasted bread). What started as a casual kickabout among friends quickly evolved into something more... organized? Well, somewhat.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          The real story begins in 2022, when {TEAM_NAME} burst onto the Bowling Green Futsal (BGF) league scene. Originally sparked by Austin Greer, a seasoned BGF veteran looking for a fresh start after earlier team ventures, the idea for a new competitive squad began to brew. After the league's return post-pandemic in 2021, Austin teamed up with Goran Omerdic. Recruiting old friends and local soccer talent, they built a team ready to make its mark in BGF Division B.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          And mark they did! In their very first year, {TEAM_NAME} blazed a trail to victory, clinching the BGF 2023 Spring Season Championship. This early success has only fueled their hunger for more. As {TEAM_NAME} continues to chase glory and returns to the BGF, we're just getting warmed up! Keep an eye on our socials to follow the journey.
        </p>
        <div className={`mt-6 bg-[${PRIMARY_COLOR}]/10 p-4 rounded-lg border-l-4 border-[${PRIMARY_COLOR}]`} role="note">
          <h3 className={`text-xl font-semibold text-[${PRIMARY_COLOR}] mb-2 flex items-center`}>
            <MaterialSparklesIcon className="mr-2" /> Fun Fact!
            </h3>
          <p className="text-gray-700 italic">
            {TEAM_NAME} has advanced to the BGF playoffs every year since their establishment!
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card 
            title="Our Mission" 
            className="bg-neutral-50"
            icon={<MaterialTeamIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}}/>}
        >
          <p className="text-gray-700 leading-relaxed">
            To play entertaining indoor soccer, foster a strong sense of camaraderie, and occasionally remember which way we're shooting. We aim to bring joy (and mild bewilderment) to our fans and strike fear (or at least slight concern) into the hearts of our opponents.
          </p>
        </Card>
        <Card 
            title="Club Values" 
            className="bg-neutral-50"
            icon={<MaterialTeamIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}}/>}
        >
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Passion:</strong> For the game, for the team, for the post-game snacks.</li>
            <li><strong>Teamwork:</strong> We win together, we lose together, we blame the ref together.</li>
            <li><strong>Resilience:</strong> We bounce back from losses (eventually).</li>
            <li><strong>Fun:</strong> If it's not fun, why bother? (Unless it's fitness drills).</li>
            <li><strong>Sportsmanship:</strong> Mostly.</li>
          </ul>
        </Card>
      </div>

      <Card 
        title="Behind The Name: Toasty!" 
        className="bg-white"
        icon={<MaterialSparklesIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}}/>}
      >
        <div className="md:flex md:items-center md:space-x-8">
            <div className="md:w-1/3 mb-6 md:mb-0">
                <img
                src="https://picsum.photos/seed/mortalKombatStyle/600/400"
                alt="Abstract image inspired by Mortal Kombat's 'Toasty!' easter egg"
                className="rounded-lg shadow-md w-full h-auto object-cover aspect-[3/2]"
                aria-describedby="name-origin-image-desc"
                />
                <p id="name-origin-image-desc" className="sr-only">A placeholder image with a fiery or retro gaming aesthetic, alluding to the Mortal Kombat origin of the team's name.</p>
            </div>
            <div className="md:w-2/3">
                <p className="text-gray-700 mb-4 leading-relaxed">
                Many often ask "Where did the name {TEAM_NAME} come from?"
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                Simple answer - Mortal Kombat.
                </p>
                <p className="text-gray-700 leading-relaxed">
                The longer story is that when registering for a team in the BGF, Austin did not have a name ready when filing the paperwork. Being a fan of the Mortal Kombat franchise - and the "Toasty!" easter egg - it's what first came to mind, and the rest is history! 🔥
                </p>
            </div>
        </div>
      </Card>

       <Card 
        title="Meet the (Imaginary) Founders" 
        className="bg-white"
        icon={<MaterialUsersIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}}/>}
       >
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
                <img src="https://picsum.photos/seed/founder1/200/200" alt="Founder 1" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 shadow-md border-2 border-gray-200"/>
                <h4 className={`text-xl font-semibold text-gray-800 text-center`}>Sir Reginald Toasterson III</h4>
                <p className="text-sm text-gray-600 text-center">Chief Strategist & Snack Procurement Officer</p>
                <p className="text-gray-700 leading-relaxed mt-2 text-sm text-center md:text-left">
                    A visionary who believed that a team's success is directly proportional to the quality of its pre-game toast. His tactical genius is often overshadowed by his quest for the perfect crumpet.
                </p>
            </div>
            <div>
                <img src="https://picsum.photos/seed/founder2/200/200" alt="Founder 2" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 shadow-md border-2 border-gray-200"/>
                <h4 className={`text-xl font-semibold text-gray-800 text-center`}>Baroness Brunhilde von Crumb</h4>
                <p className="text-sm text-gray-600 text-center">Head of Morale & Questionable Nicknames</p>
                <p className="text-gray-700 leading-relaxed mt-2 text-sm text-center md:text-left">
                    Known for her infectious enthusiasm and an uncanny ability to come up with nicknames that stick (whether you like them or not). She ensures every player feels valued, especially if they bring good biscuits.
                </p>
            </div>
        </div>
       </Card>
    </div>
  );
};

export default AboutPage;