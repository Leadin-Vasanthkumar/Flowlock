import React from 'react';
import LegalLayout from './LegalLayout';

const TermsOfService: React.FC = () => {
  return (
    <LegalLayout title="Terms of Service">
      <p>Last Updated: March 14, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using <strong>Flowlock</strong>, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our application.
      </p>

      <h2>2. Use of Service</h2>
      <p>
        Flowlock is a productivity tool designed to help you manage focus sessions and neural recovery. You are granted a limited, non-exclusive, non-transferable license to use the service for personal or professional productivity purposes.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
      </p>

      <h2>4. Prohibited Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the service for any illegal purpose or in violation of any local, state, or international laws.</li>
        <li>Attempt to interfere with or disrupt the service's integrity or performance.</li>
        <li>Attempt to gain unauthorized access to the service or its related systems.</li>
        <li>Reverse engineer or attempt to extract the source code of the application.</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        The Flowlock application, including its design, logos, and protocols (such as Guided Neural Resets), is the intellectual property of Flowlock. You may not use our branding or proprietary content without express written permission.
      </p>

      <h2>6. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our business interests.
      </p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>
        FLOWLOCK IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        IN NO EVENT SHALL FLOWLOCK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Flowlock operates, without regard to its conflict of law provisions.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have questions about these Terms of Service, please contact us at contact@vasanthkumar.work.
      </p>
    </LegalLayout>
  );
};

export default TermsOfService;
