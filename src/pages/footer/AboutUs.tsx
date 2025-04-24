import { Users, Briefcase, Star } from "lucide-react";

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">About Us</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">Get to know more about our story, mission, and values.</p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Who We Are</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              1618 Office Solutions was established in 1989 in Tondo, Manila. We’re a team of 30 professionals including drivers, accountants, warehouse staff, and admin personnel.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Briefcase className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">What We Do</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              We specialize in office supplies with a focus on products like bond paper, supported by reliable desktop systems and printers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Star className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Our Approach</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              With flexible pricing strategies and negotiable offers, our commitment is to customer satisfaction and adaptability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
