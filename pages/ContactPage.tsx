

import React, { useState } from 'react';
import { 
    PRIMARY_COLOR, TEAM_NAME, ACCENT_COLOR, MaterialMailIcon, THEME_BLACK, THEME_WHITE,
    MaterialPersonIcon, MaterialSubjectIcon, MaterialCommentIcon // Placeholders - use relevant icons
} from '../constants'; // Corrected path
import { ContactFormData } from '../types';

const TEAM_EMAIL_ADDRESS = "contact@toastyfc.example.com"; 

const ContactPage: React.FC = () => {
  const initialFormData: ContactFormData = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (formErrors[name as keyof ContactFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {};
    if (!formData.name.trim()) errors.name = "Your Name is required.";
    if (!formData.subject.trim()) errors.subject = "Subject is required.";
    if (!formData.message.trim()) errors.message = "Message is required.";
    if (!formData.email.trim()) {
      errors.email = "Your Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const mailtoSubject = encodeURIComponent(formData.subject);
    const mailtoBody = encodeURIComponent(
      `Sender Name: ${formData.name}\nSender Email: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    
    const mailtoLink = `mailto:${TEAM_EMAIL_ADDRESS}?subject=${mailtoSubject}&body=${mailtoBody}`;
    
    window.location.href = mailtoLink;

    // Consider a more user-friendly notification than alert, perhaps a toast or inline message
    // For now, keeping alert as per original behavior
    alert(`Your email message has been prepared for ${TEAM_EMAIL_ADDRESS}. Please check your email client to send it. If it didn't open automatically, you can manually send your message.`);
  };

  return (
    <div className="space-y-10 py-8">
      <header className="text-center">
        <MaterialMailIcon className={`text-[${PRIMARY_COLOR}] mx-auto mb-3`} style={{ fontSize: '48px' }} />
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] mb-2`}>Get In Touch</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Have questions, suggestions, or just want to say hi? We'd love to hear from you! Fill out the form below, and we'll do our best to respond quickly.
        </p>
      </header>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                {/* <MaterialPersonIcon className="mr-2 opacity-70" /> */}
                 Your Name <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 bg-white text-gray-800 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="name-error"
              aria-invalid={!!formErrors.name}
            />
            {formErrors.name && <p id="name-error" className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <MaterialMailIcon className="mr-2 opacity-70" /> 
                Your Email <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 bg-white text-gray-800 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="email-error"
              aria-invalid={!!formErrors.email}
            />
            {formErrors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="subject" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                {/* <MaterialSubjectIcon className="mr-2 opacity-70" /> */}
                 Subject <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 bg-white text-gray-800 border ${formErrors.subject ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="subject-error"
              aria-invalid={!!formErrors.subject}
            />
            {formErrors.subject && <p id="subject-error" className="mt-1 text-xs text-red-500">{formErrors.subject}</p>}
          </div>

          <div>
            <label htmlFor="message" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                {/* <MaterialCommentIcon className="mr-2 opacity-70" /> */}
                Message <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 bg-white text-gray-800 border ${formErrors.message ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="message-error"
              aria-invalid={!!formErrors.message}
            ></textarea>
            {formErrors.message && <p id="message-error" className="mt-1 text-xs text-red-500">{formErrors.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${ACCENT_COLOR}] transition-colors`}
            >
              <MaterialMailIcon className="mr-2" /> Send Message
            </button>
          </div>
           <p className="text-xs text-gray-500 text-center">
              Clicking "Send Message" will attempt to open your default email application. 
              The destination email is currently set to: <strong className={`text-[${ACCENT_COLOR}]`}>{TEAM_EMAIL_ADDRESS}</strong>.
            </p>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;