import { MailIcon, MapPinIcon, PhoneIcon, PrinterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.webp";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-16 bg-muted/10">
      <div className="container mx-auto px-4">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Column 1 - Logo and Location */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Link to="/" aria-label="Home" className="inline-flex items-center gap-2">
                <img src={logoImage} alt="1618 Office Solutions Logo" className="w-10 h-10 object-contain" />
                <span className="text-sm sm:text-base font-bold whitespace-normal sm:whitespace-nowrap">
                  1618 Office Solutions Inc.
                </span>
              </Link>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-3">Location</h3>
              <div className="flex items-start">
                <MapPinIcon size={18} className="text-primary mt-1 mr-3 flex-shrink-0" />
                <p>
                  1618 Felix Deleon Street, Tondo, Manila
                </p>
              </div>
            </div>
          </div>
          
          {/* Column 2 - Contact Us */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-3">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <PhoneIcon size={18} className="text-primary mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Telephone:</p>
                  <p className="text-sm ">495-3333 | 253-9310 | 495-7878</p>
                  <p className="text-sm ">254-8940 | 253-9250 | 253-9359 | 252-3049</p>
                </div>
              </div>
              <div className="flex items-start">
                <PrinterIcon size={18} className="text-primary mt-1 mr-3 flex-shrink-0" />
                <p>Fax: 254-0132</p>
              </div>
              <div className="flex items-start">
                <MailIcon size={18} className="text-primary mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="text-sm ">skycos@yahoo.com | acctg.sky@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 3 - Legal Terms */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-3">Legal Terms</h3>
            <ul className="space-y-3">
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
            
            {/* Company Established Info */}
            <div className="mt-8">
              <p className="text-sm ">Established 1989</p>
              <p className="text-sm ">Serving businesses across the Philippines for over 35 years</p>
            </div>
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
