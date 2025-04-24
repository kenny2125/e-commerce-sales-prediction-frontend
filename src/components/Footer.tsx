import RedPcLogo from "../assets/redpcph.png";
import { FacebookIcon, PhoneIcon, PrinterIcon } from "lucide-react";
import { MailIcon } from "lucide-react";
import { MapPinIcon } from "lucide-react";
import { Outlet, Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <>
      <footer className="w-full py-8 mt-16">
        {/* Main footer content */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row justify-between gap-2">
            {/* Logo section */}
            <div className="flex flex-col items-center md:items-start">
              <Logo />
            </div>

            {/* Contact section */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h1 className="text-lg font-bold">Contact Us</h1>
              <div className="flex items-start gap-2">
                <PhoneIcon size={16} className="text-primary mt-1" />
                <div>
                  <span className="font-bold">Tel:</span>
                  <ul className="list-disc list-inside pl-2">
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
              <div className="flex items-center gap-2">
                <PrinterIcon size={16} className="text-primary" />
                <p>Fax: 254-0132</p>
              </div>
              <div className="flex items-start gap-2">
                <MailIcon size={16} className="text-primary mt-1" />
                <div className="text-center md:text-left">
                  <span className="font-bold">Email:</span>
                  <ul className="list-disc list-inside pl-2">
                    <li>
                      <span className="inline-block align-middle">
                        <a href="mailto:skycos@yahoo.com" className="hover:underline">skycos@yahoo.com</a>
                      </span>
                    </li>
                    <li>
                      <span className="inline-block align-middle">
                        <a href="mailto:acctg.sky@gmail.com" className="hover:underline">acctg.sky@gmail.com</a>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Location section */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <h1 className="text-lg font-bold">Location</h1>
              <div className="flex gap-2 max-w-xs">
                <MapPinIcon size={16} className="text-primary flex-shrink-0" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=1618%20Felix%20Deleon%20Street%2C%20Tondo%2C%20Manila" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-center md:text-left hover:underline"
                >
                  1618 Felix Deleon Street, Tondo, Manila
                </a>
              </div>
            </div>

            {/* Links section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col items-center md:items-start gap-2">
                <h1 className="text-lg font-bold">Who are we?</h1>
                <div className="flex flex-col items-center md:items-start gap-2">
                  <Link to="/about-us" onClick={() => window.scrollTo(0, 0)} className="hover:underline">About Us</Link>
                  <Link to="/faq" onClick={() => window.scrollTo(0, 0)} className="hover:underline">FAQ</Link>
                  <Link to="/contact-us" onClick={() => window.scrollTo(0, 0)} className="hover:underline">Contact Us</Link>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-start gap-2">
                <h1 className="text-lg font-bold">Legal Terms</h1>
                <div className="flex flex-col items-center md:items-start gap-2">
                  <Link to="/terms&conditions" onClick={() => window.scrollTo(0, 0)} className="hover:underline">Terms & Conditions</Link>
                  <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="hover:underline">Privacy Policy</Link>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-start gap-2">
                <h1 className="text-lg font-bold">Others</h1>
                <div className="flex flex-col items-center md:items-start gap-2">
                  <Link to="/purchasing-guide" onClick={() => window.scrollTo(0, 0)} className="hover:underline">Purchasing Guide</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright section */}
        <p className="text-center py-8 mt-4">
          © 1618 Office Solutions Inc. All Rights Reserved
        </p>
      </footer>
      <Outlet />
    </>
  );
}
