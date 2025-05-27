
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, THEME_WHITE, THEME_BLACK, MaterialMailIcon, MaterialDollarIcon } from '../constants';


const ConnectPage2: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
    if (formError) setFormError(''); // Clear error when user starts typing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
        setFormError('Please fill out all fields.');
        setFormSubmitted(false);
        return;
    }
    setFormError('');
    // Mock submission
    console.log("Form submitted (mock):", formState);
    setFormSubmitted(true);
    setFormState({ name: '', email: '', subject: '', message: '' }); // Clear form
     setTimeout(() => setFormSubmitted(false), 5000); // Reset message after 5 seconds
  };

  return (
    <div className="space-y-8 py-6">
      <header className="text-center py-6">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}]`} style={{fontFamily: "'Roboto Slab', serif"}}>Connect With Us</h1>
        <p className="text-lg text-gray-600 mt-2">We'd love to hear from you!</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card title="Send Us a Message" className="bg-white">
          {formSubmitted && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">Thank you! Your message has been "sent" (this is a demo).</p>}
          {formError && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{formError}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formState.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${formError && !formState.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
                aria-invalid={formError && !formState.name ? "true" : "false"}
                aria-describedby={formError && !formState.name ? "name-error" : undefined}
              />
              {formError && !formState.name && <p id="name-error" className="mt-1 text-xs text-red-500">Full Name is required.</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formState.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${formError && !formState.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
                aria-invalid={formError && !formState.email ? "true" : "false"}
                aria-describedby={formError && !formState.email ? "email-error" : undefined}
              />
              {formError && !formState.email && <p id="email-error" className="mt-1 text-xs text-red-500">Email is required.</p>}
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formState.subject}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${formError && !formState.subject ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
                aria-invalid={formError && !formState.subject ? "true" : "false"}
                aria-describedby={formError && !formState.subject ? "subject-error" : undefined}
              />
              {formError && !formState.subject && <p id="subject-error" className="mt-1 text-xs text-red-500">Subject is required.</p>}
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                id="message"
                rows={4}
                value={formState.message}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${formError && !formState.message ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
                aria-invalid={formError && !formState.message ? "true" : "false"}
                aria-describedby={formError && !formState.message ? "message-error" : undefined}
              ></textarea>
              {formError && !formState.message && <p id="message-error" className="mt-1 text-xs text-red-500">Message is required.</p>}
            </div>
            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${ACCENT_COLOR}] transition-colors`}
              >
                Send Message
              </button>
            </div>
          </form>
        </Card>

        <div className="space-y-8">
          <Card title="Contact Information" className="bg-neutral-50">
            <p className="text-gray-700 leading-relaxed flex items-center">
              <MaterialMailIcon className="mr-2 text-gray-600" style={{ fontSize: '20px' }} />
              <strong>General Inquiries:</strong> <a href="mailto:info@toastyfc.example.com" className={`text-[${PRIMARY_COLOR}] hover:underline ml-1`}>info@toastyfc.example.com</a> (placeholder)
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              We're currently a grassroots team, so we don't have a physical clubhouse yet. But you can find us at local indoor soccer arenas, probably near the snack bar.
            </p>
          </Card>

          <Card title="Sponsorship Opportunities" className="bg-neutral-50">
            <p className="text-gray-700 leading-relaxed flex items-center">
              <MaterialDollarIcon className="mr-2 text-gray-600" style={{ fontSize: '20px' }} />
              {TEAM_NAME} is actively seeking sponsors to help us grow and continue providing thrilling (and occasionally competent) soccer entertainment.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              If you're interested in partnering with a team that has grit, determination, and an impressive collection of slightly singed jerseys, please reach out to:
              <br />
              <a href="mailto:sponsorship@toastyfc.example.com" className={`text-[${PRIMARY_COLOR}] hover:underline font-semibold`}>sponsorship@toastyfc.example.com</a> (placeholder)
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              We offer various sponsorship packages, including jersey branding, social media shoutouts, and the eternal gratitude of our players (especially if snacks are involved).
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage2;