import logoImage from "../assets/logo.webp";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" aria-label="Home">
      <span className="inline-flex justify-center items-center gap-2">
        <img src={logoImage} alt="1618 Office Solutions Logo" className="w-10 h-10 object-contain" />
        <span className="md:block text-[3.5vw] md:text-[2.5vw] lg:text-[1.8vw] xl:text-[1.4vw] font-bold whitespace-nowrap">
          1618 Office Solutions Inc.
        </span>
      </span>
    </Link>
  );
}
