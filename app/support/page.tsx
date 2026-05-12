'use client';

import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

const SUPPORT_CATEGORIES = [
  {
    title: 'Devices',
    icon: 'devices',
    description: 'Connection or configuration issues with your sensors.',
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    title: 'Automations',
    icon: 'dynamic_form',
    description: 'Guide to creating intelligent scenarios and routines.',
    color: 'text-secondary',
    bg: 'bg-secondary/10'
  },
  {
    title: 'Account',
    icon: 'manage_accounts',
    description: 'Profile management, subscriptions, and data security.',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10'
  }
];

export default function SupportPage() {
  function openSupportEmail() {
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=homehub.assistenza@gmail.com&su=HomeHub%20Support&body=Hi%2C%20I%20need%20support%20for%20HomeHub.",
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="bg-background text-on-surface selection:bg-primary/30 min-h-screen flex flex-col font-['Inter']">
      <NavBar />
      
      <main className="flex-grow pt-32 pb-24 px-6">
        <section className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="headline-font text-4xl md:text-5xl font-bold text-on-surface mb-4">
              How can we <span className="text-primary">help you?</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              We are here to ensure your HomeHub experience is perfect. 
              Choose a category or contact us directly.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {SUPPORT_CATEGORIES.map((cat, i) => (
              <div 
                key={cat.title} 
                className="group p-8 rounded-[2rem] bg-surface-container border border-outline-variant/15 hover:border-primary/30 transition-all cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <span className={`material-symbols-outlined ${cat.color} text-[32px]`}>{cat.icon}</span>
                </div>
                <h3 className="headline-font text-xl font-bold mb-3">{cat.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Card */}
          <div className="rounded-[2.5rem] primary-gradient p-1 md:p-1.5 shadow-2xl shadow-primary/20 animate-fade-in-up stagger-3">
            <div className="bg-surface-container rounded-[2.3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-md text-center md:text-left">
                <h2 className="headline-font text-3xl font-bold mb-4">Didn't find what you were looking for?</h2>
                <p className="text-on-surface-variant">
                  Our technical support team is available 24/7 for Pro users. 
                  Send us a message and we'll get back to you within a few hours.
                </p>
              </div>
              
              <button
                onClick={openSupportEmail}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl primary-gradient text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
              >
                <span className="material-symbols-outlined">mail</span>
                Contact Support
              </button>
            </div>
          </div>

          {/* Quick FAQ Snippets */}
          <div className="mt-20">
            <h3 className="headline-font text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: 'How do I add a new device?', a: 'Go to the Rooms section, select a room, and click the "+" button.' },
                { q: 'Does HomeHub work offline?', a: 'Local automations continue to work, but remote access requires an internet connection.' },
                { q: 'Can I share access?', a: 'Yes, with the Home Pro plan you can invite your family members.' },
                { q: 'Which devices are supported?', a: 'We support all Zigbee, Matter standards, and major Wi-Fi brands.' }
              ].map((faq) => (
                <div key={faq.q} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                  <h4 className="font-bold text-on-surface mb-2">{faq.q}</h4>
                  <p className="text-sm text-on-surface-variant">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}