import React from 'react';
import logo from '../assets/images/liftly-logo.png';

const PrivacyPolicyPage = () => {
    return (
        <section className="flex min-h-screen flex-col items-center justify-start bg-[#0D0D0E] px-4 md:px-6 pt-12 md:pt-16 pb-24 font-sans text-white">
            {/* Header med Liftly-logga */}
            <div className="w-full max-w-2xl text-center mb-8 border-b border-zinc-800 pb-6 flex flex-col items-center">
                <img src={logo} alt="Liftly logo" className="h-8 w-auto object-contain mb-3" />

                <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
                    Privacy Policy & GDPR
                </h1>
                <p className="text-xs text-zinc-400 font-medium mt-1">
                    How we handle and protect your data
                </p>
            </div>

            {/* Innehållskort i mörk stil */}
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-5 text-xs text-zinc-300 leading-relaxed">
                <div>
                    <h2 className="font-bold text-white text-sm mb-1">1. Overview</h2>
                    <p className="text-zinc-400">Welcome to Liftly. We respect your privacy and are committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR).</p>
                </div>

                <div>
                    <h2 className="font-bold text-white text-sm mb-1">2. What Data We Collect</h2>
                    <p className="text-zinc-400">When you register an account, we collect your chosen username, email address, and a securely hashed password. To provide the app's core features, we also store user-generated content and activity data, including posts, comments, uploaded media (images and videos via Cloudinary), calendar events, workout logs, and nutritional/food tracking data that you choose to create or save within Liftly.</p>
                </div>

                <div>
                    <h2 className="font-bold text-white text-sm mb-1">3. Purpose of Processing & Data Retention</h2>
                    <p className="text-zinc-400">Your data is processed strictly to provide you with access to your fitness calendar, workout routines, and history. We store your GDPR consent status and timestamp to comply with legal accountability requirements. We retain your personal data and logs only for as long as your account remains active. If you choose to delete your account, all associated data and logs are permanently removed from our systems.</p>
                </div>

                <div>
                    <h2 className="font-bold text-white text-sm mb-1">4. Your Rights</h2>
                    <p className="text-zinc-400">You have the right to request access to, correction of, or deletion of your personal data at any time directly through the app or by contacting us. You also have the right to lodge a complaint with a supervisory data protection authority (such as IMY in Sweden).</p>
                </div>

                <div>
                    <h2 className="font-bold text-white text-sm mb-1">5. Contact Us</h2>
                    <p className="text-zinc-400">If you have any questions regarding this privacy policy or how your data is handled, you can reach out to us via the contact options inside the app or at support@liftly.app.</p>
                </div>
            </div>
        </section>
    );
};

export default PrivacyPolicyPage;