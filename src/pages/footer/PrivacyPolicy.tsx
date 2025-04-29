import React from "react";
import { FileText, Lock, UserCheck, Clock, RefreshCcw, Shield } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <Lock className="w-8 h-8 text-primary" /> Privacy Policy
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">How we collect, use, and protect your information.</p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-4">
          <FileText className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information We Collect</h2>
            <ul className="list-disc ml-5 text-gray-600 dark:text-gray-300 text-sm">
              <li>Device Information (IP address, browser type, OS, device identifiers)</li>
              <li>Cookies (preferences, site functionality)</li>
              <li>Log Files (site actions, interactions)</li>
              <li>Web Beacons, Tags, and Pixels (analytics, marketing effectiveness)</li>
            </ul>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <UserCheck className="w-6 h-6 text-green-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">We use your information to process orders, provide support, personalize your experience, send updates, and improve our services. We do not sell your data.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Clock className="w-6 h-6 text-yellow-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">We retain your information only as long as necessary for service provision, account maintenance, and legal compliance. Data is securely deleted or anonymized when no longer needed.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <RefreshCcw className="w-6 h-6 text-orange-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Updates</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">We may update this policy as needed. Please review it periodically. Continued use of our services means you accept the changes.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-cyan-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">We use encryption, firewalls, and secure servers to protect your data. No method is 100% secure, but we are committed to your privacy.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-pink-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">We do not knowingly collect data from children under 13. If you have concerns, contact us at <span className="text-primary">acctg.sky@gmail.com</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
