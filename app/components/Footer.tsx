import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Phone } from "lucide-react";

const SOCIAL = {
  instagram: "https://instagram.com/napd.ps",
  facebook: "https://facebook.com/napd.ps",
  whatsapp: "https://wa.me/972593255260",
};

export default function Footer() {
  return (
    <footer className="pt-20 pb-12 border-t border-white/10" style={{ backgroundColor: "#182B2A" }}>
      <div className="max-w-[1200px] mx-auto px-6 text-center">

        {/* Brand */}
        <div className="flex justify-center">
          <Image
            src="/napd-logo.png"
            alt="NAPD Jewels"
            width={183}
            height={160}
            className="h-16 w-auto"
          />
        </div>

        {/* Social Icons */}
        <div className="mt-8 flex items-center justify-center gap-10">
          <a
            href={SOCIAL.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="Facebook"
          >
            <Facebook
              size={22}
              strokeWidth={1.5}
              className="text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-[#B08D57]"
            />
          </a>

          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="Instagram"
          >
            <Instagram
              size={22}
              strokeWidth={1.5}
              className="text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-[#B08D57]"
            />
          </a>

          <a
            href={SOCIAL.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="WhatsApp"
          >
            <Phone
              size={22}
              strokeWidth={1.5}
              className="text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-[#B08D57]"
            />
          </a>
        </div>

        {/* Links */}
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[14px] uppercase tracking-wide text-white/75">
          <Link href="/contact" className="hover:text-[#B08D57]">
            Contact Us
          </Link>
          <Link href="/about" className="hover:text-[#B08D57]">
            About Us
          </Link>
          <Link href="/faqs" className="hover:text-[#B08D57]">
            FAQs
          </Link>
          <Link href="/shipping-policy" className="hover:text-[#B08D57]">
            Shipping Policy
          </Link>
          <Link href="/exchange-policy" className="hover:text-[#B08D57]">
            Exchange Policy
          </Link>
          <Link href="/privacy-policy" className="hover:text-[#B08D57]">
            Privacy Policy
          </Link>
        </nav>

        {/* Copyright */}
        <div className="mt-16 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
          <span>© 2026 NAPD Jewels. All rights reserved.</span>
          <span>Sterling Silver 925</span>
        </div>
      </div>
    </footer>
  );
}
