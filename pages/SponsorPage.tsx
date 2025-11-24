import React, { useState } from 'react';

// IMPORTANT: Replace this with the actual URL from your Google Apps Script deployment.
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxu-lteHR18E_7nmRGuYvAht41Q__GkqBmg7cigYEnMR7wBO14-deagM8gY6LNT33m3bg/exec';

const SponsorPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        if (WEB_APP_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') || !WEB_APP_URL) {
            setError("This form is not configured. Please deploy the provided Google Apps Script and paste the Web App URL into the code.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: formData,
            });
            
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse JSON response:", responseText);
                throw new Error("Received an invalid response from the server. This often means the Apps Script URL is wrong or the script has an error. Please check the URL and the script's execution logs in your Google account.");
            }

            if (result.status === 'success') {
                 setSuccessMessage("Thank you! Your inquiry has been submitted successfully. We will get back to you shortly.");
                 form.reset();
            } else {
                throw new Error(result.message || 'An unknown error occurred on the server. Please check the Apps Script execution logs.');
            }

        } catch (err) {
            console.error("Error submitting form:", err);
            setError(`Sorry, there was an issue submitting your inquiry. Please try again. (Details: ${err instanceof Error ? err.message : String(err)})`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-border p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-primary mb-2 pb-3 border-b-2 border-border">Sponsor Toasty FC</h1>
            <p className="text-gray-600 mb-8">Join our journey and help support local sports. We'd love to partner with you!</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="formType" value="sponsor" />
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" id="companyName" name="companyName" required disabled={isLoading} className="mt-1 block w-full bg-background border-border rounded-md shadow-sm py-2 px-3 text-accent focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input type="text" id="contactName" name="contactName" required disabled={isLoading} className="mt-1 block w-full bg-background border-border rounded-md shadow-sm py-2 px-3 text-accent focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" name="email" required disabled={isLoading} className="mt-1 block w-full bg-background border-border rounded-md shadow-sm py-2 px-3 text-accent focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm disabled:opacity-50" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                    <input type="tel" id="phone" name="phone" disabled={isLoading} className="mt-1 block w-full bg-background border-border rounded-md shadow-sm py-2 px-3 text-accent focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea id="message" name="message" rows={4} required disabled={isLoading} className="mt-1 block w-full bg-background border-border rounded-md shadow-sm py-2 px-3 text-accent focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm disabled:opacity-50"></textarea>
                </div>

                {successMessage && <p className="text-sm text-green-700 bg-green-100 p-3 rounded-md animate-bounce-in">{successMessage}</p>}
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md animate-bounce-in">{error}</p>}

                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit Inquiry'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SponsorPage;