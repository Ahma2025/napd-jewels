import Link from "next/link";
import { Facebook, Instagram, Phone } from "lucide-react";

const SOCIAL = {
  instagram: "https://instagram.com/napd.ps",
  facebook: "https://facebook.com/napd.ps",
  whatsapp: "https://wa.me/972593255260",
};

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-12 border-t">
      <div className="max-w-[1200px] mx-auto px-6 text-center">

        {/* Brand */}
        <div className="text-[22px] tracking-[0.25em] font-medium">
          NAPD JEWELS
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
              className="text-black transition-all duration-300 group-hover:scale-110 group-hover:text-neutral-500"
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
              className="text-black transition-all duration-300 group-hover:scale-110 group-hover:text-neutral-500"
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
              className="text-black transition-all duration-300 group-hover:scale-110 group-hover:text-neutral-500"
            />
          </a>
        </div>

        {/* Links */}
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[15px]">
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/faqs" className="hover:underline">
            FAQs
          </Link>
          <Link href="/shipping-policy" className="hover:underline">
            Shipping Policy
          </Link>
          <Link href="/exchange-policy" className="hover:underline">
            Exchange Policy
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </nav>

        {/* Copyright */}
        <div className="mt-16 text-sm text-black/50 text-left">
          © NAPD
        </div>
      </div>
    </footer>
  );
}