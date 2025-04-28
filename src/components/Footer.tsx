import { MailIcon, MapPinIcon, PhoneIcon, PrinterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.webp";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-16">
      <div className="container mx-auto px-4">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 - Logo and Location */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="mb-6">
              <Link to="/" aria-label="Home" className="inline-flex items-center gap-2">
                <img src={logoImage} alt="1618 Office Solutions Logo" className="w-10 h-10 object-contain" />
                <span className="text-sm sm:text-base font-bold whitespace-normal sm:whitespace-nowrap">
                  1618 Office Solutions Inc.
                </span>
              </Link>
            </div>
            
            <div className="text-center sm:text-left w-full">
              <h3 className="text-lg font-bold mb-4">Location</h3>
              <div className="flex items-start justify-center sm:justify-start">
                <MapPinIcon size={16} className="text-primary mt-1 mr-2 flex-shrink-0" />
                <p>
                  1618 Felix Deleon Street, Tondo, Manila
                </p>
              </div>
            </div>
          </div>
          
          {/* Column 2 - Contact Us */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 w-full max-w-[250px]">
              <div className="flex items-start">
                <PhoneIcon size={16} className="text-primary mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Tel:</p>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-left">
                    <li>495-3333</li>
                    <li>253-9310</li>
                    <li>495-7878</li>
                    <li>254-8940</li>
                    <li>253-9250</li>
                    <li>253-9359</li>
                    <li>252-3049</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-start w-full">
                <PrinterIcon size={16} className="text-primary mr-2 flex-shrink-0" />
                <p>Fax: 254-0132</p>
              </div>
              <div className="flex items-start">
                <MailIcon size={16} className="text-primary mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email:</p>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-left">
                    <li>skycos@yahoo.com</li>
                    <li>acctg.sky@gmail.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 3 - Legal Terms */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-lg font-bold mb-4">Legal Terms</h3>
            <ul className="space-y-2 flex flex-col items-center sm:items-start">
              <li>
                <Link 
                  to="/terms&conditions" 
                  onClick={() => window.scrollTo(0, 0)} 
                  className="hover:underline hover:text-primary transition-colors inline-flex items-center"
                >
                  <span className="mr-2">›</span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  onClick={() => window.scrollTo(0, 0)} 
                  className="hover:underline hover:text-primary transition-colors inline-flex items-center"
                >
                  <span className="mr-2">›</span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4 - Others */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-lg font-bold mb-4">Others</h3>
            <ul className="space-y-2 flex flex-col items-center sm:items-start">
              <li>
                <Link 
                  to="/purchasing-guide" 
                  onClick={() => window.scrollTo(0, 0)} 
                  className="hover:underline hover:text-primary transition-colors inline-flex items-center"
                >
                  <span className="mr-2">›</span>
                  Purchasing Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright section with subtle divider */}
        <div className="border-t border-muted-foreground/10 mt-10 pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} 1618 Office Solutions Inc. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
