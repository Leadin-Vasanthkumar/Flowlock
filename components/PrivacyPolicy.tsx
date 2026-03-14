import React from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Last Updated: March 14, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to <strong>Flowlock</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your data when you use the Flowlock application.
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        To provide you with the best focus and productivity experience, we collect the following types of information:
      </p>
      <ul>
        <li><strong>Account Information:</strong> When you sign up, we collect your email address and authentication credentials via Supabase.</li>
        <li><strong>Application Data:</strong> We store the tasks you create, your selected focus durations, and the history of your completed focus sessions (sprints).</li>
        <li><strong>Usage Analytics:</strong> We may collect anonymized data about how you interact with the app (e.g., total focus time, frequent task categories) to improve our algorithms.</li>
        <li><strong>Device Information:</strong> Basic information about your browser or device used to access the service.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>
        Flowlock uses your data to:
      </p>
      <ul>
        <li>Maintain and sync your focus history across devices.</li>
        <li>Provide visualizations and analytics of your focus patterns.</li>
        <li>Facilitate "Neural Resets" and guided recovery protocols.</li>
        <li>Send important technical notifications regarding your account.</li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <p>
        We use <strong>Supabase</strong> for our database and authentication services. Your data is stored on secure servers with industry-standard encryption. While we take every precaution to protect your information, no method of transmission over the internet is 100% secure.
      </p>

      <h2>5. Sharing Your Data</h2>
      <p>
        We do <strong>not</strong> sell your personal data to third parties. We only share information with service providers (like Supabase and Vercel) necessary to operate the application. These providers are bound by strict confidentiality agreements.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You have the right to access, correct, or delete your personal information at any time. You can manage your tasks and session history directly within the app or contact us to permanently delete your account.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at contact@vasanthkumar.work.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
