import { HelpCircle, Info, CreditCard, Truck, RefreshCcw, Headphones, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <HelpCircle className="w-8 h-8 text-primary" /> FAQ
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">Frequently Asked Questions</p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Info</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2"><strong>What is 1618 Office Solutions?</strong> We're an office supply company located in Tondo, Manila, operating since 1989.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <CreditCard className="w-6 h-6 text-green-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders & Pricing</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              <strong>How can I place an order?</strong> You can now place orders directly through our online system! Simply browse our products, add items to your cart, and proceed to checkout. For a detailed walkthrough, please see our <Link to="/purchasing-guide" className="text-primary hover:underline">Purchasing Guide</Link>.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-cyan-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products & Offers</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2"><strong>What do you sell most?</strong> Bond paper is our most commonly sold product.</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm"><strong>Do you offer promotions?</strong> No current promotions are offered regularly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
