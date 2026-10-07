import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { LangProvider } from "./context/LangContext";
import { cookies, headers } from "next/headers";
import { detectLang, LANG_COOKIE } from "@/lib/i18n";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Self-hosted display serif for headings (SIL Open Font License).
const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/CormorantGaramond-Variable.ttf", weight: "300 700", style: "normal" },
    { path: "./fonts/CormorantGaramond-Italic-Variable.ttf", weight: "300 700", style: "italic" },
  ],
});

// Fashion-house display serif and a script for single flourish words.
const bodoni = localFont({
  variable: "--font-bodoni",
  display: "swap",
  src: [
    { path: "./fonts/BodoniModa.woff", weight: "400 900", style: "normal" },
    { path: "./fonts/BodoniModa-Italic.woff", weight: "400 900", style: "italic" },
  ],
});

const pinyon = localFont({
  variable: "--font-script",
  display: "swap",
  src: [{ path: "./fonts/PinyonScript-Regular.woff", weight: "400", style: "normal" }],
});

// Arabic faces: only downloaded when Arabic text is on the page.
const arDisplay = localFont({
  variable: "--font-ar-display",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/ar-Amiri-Regular.woff", weight: "400", style: "normal" }],
});

const arScript = localFont({
  variable: "--font-ar-script",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/ar-ArefRuqaa-Bold.woff", weight: "700", style: "normal" }],
});

const arSans = localFont({
  variable: "--font-ar-sans",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/ar-Plex-Regular.woff", weight: "400", style: "normal" },
    { path: "./fonts/ar-Plex-Medium.woff", weight: "500", style: "normal" },
    { path: "./fonts/ar-Plex-SemiBold.woff", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "NAPD Jewels",
  description: "Luxury Silver Jewelry Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // a saved choice wins; otherwise follow the visitor's phone/browser language
  const cookieStore = await cookies();
  const headerList = await headers();
  const lang = detectLang(
    cookieStore.get(LANG_COOKIE)?.value,
    headerList.get("accept-language")
  );

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${dmSans.variable} ${cormorant.variable} ${bodoni.variable} ${pinyon.variable} ${arDisplay.variable} ${arScript.variable} ${arSans.variable} antialiased bg-white min-h-screen flex flex-col`}
      >
        <LangProvider initial={lang}>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
