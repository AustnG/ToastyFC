import React, { useState } from 'react';
import { PRIMARY_COLOR, TEAM_NAME, ACCENT_COLOR, DollarIcon, THEME_BLACK, THEME_WHITE } from '../constants';
import { SponsorFormData } from '../types';

const SponsorPage: React.FC = () => {
  const initialFormData: SponsorFormData = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    interestLevel: 'General Inquiry',
    message: '',
  };
  const [formData, setFormData] = useState<SponsorFormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<SponsorFormData>>({});

  const sponsorshipLevels = [
    "Platinum Partner",
    "Gold Sponsor",
    "Silver Sponsor",
    "Bronze Supporter",
    "Community Friend",
    "General Inquiry"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof SponsorFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<SponsorFormData> = {};
    if (!formData.companyName.trim()) errors.companyName = "Company/Organization Name is required.";
    if (!formData.contactName.trim()) errors.contactName = "Contact Name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid.";
    }
    if (formData.phone && !/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone)) {
        errors.phone = "Please enter a valid phone number.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Sponsorship Inquiry:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="py-12 text-center bg-white p-8 rounded-lg shadow-xl">
        <DollarIcon className={`w-16 h-16 text-[${PRIMARY_COLOR}] mx-auto mb-4`} />
        <h2 className={`text-3xl font-bold text-[${PRIMARY_COLOR}] mb-3`}>Thank You!</h2>
        <p className="text-lg text-gray-700 mb-6">
          Your sponsorship inquiry has been received. We appreciate your interest in supporting {TEAM_NAME}!
          <br />
          A member of our team will get back to you as soon as possible.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData(initialFormData);
          }}
          className={`px-6 py-3 bg-neutral-200 text-[${THEME_BLACK}] font-semibold rounded-lg shadow hover:bg-neutral-300 transition-colors`}
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] mb-2`}>Partner with {TEAM_NAME}!</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Become a vital part of the {TEAM_NAME} journey! We offer various sponsorship opportunities to showcase your brand and support our community club.
        </p>
      </header>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company/Organization Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="companyName"
              id="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 border ${formErrors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="companyName-error"
            />
            {formErrors.companyName && <p id="companyName-error" className="mt-1 text-xs text-red-500">{formErrors.companyName}</p>}
          </div>

          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Contact Person <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="contactName"
              id="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 border ${formErrors.contactName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="contactName-error"
            />
            {formErrors.contactName && <p id="contactName-error" className="mt-1 text-xs text-red-500">{formErrors.contactName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`mt-1 block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="email-error"
            />
            {formErrors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
              aria-describedby="phone-error"
            />
             {formErrors.phone && <p id="phone-error" className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="interestLevel" className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Interest Level</label>
            <select
              name="interestLevel"
              id="interestLevel"
              value={formData.interestLevel}
              onChange={handleChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm rounded-md shadow-sm`}
            >
              {sponsorshipLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message/Comments (Optional)</label>
            <textarea
              name="message"
              id="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm`}
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${ACCENT_COLOR}] transition-colors`}
            >
              Submit Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorPage;