import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";

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

export const metadata: Metadata = {
  title: "NAPD Jewels",
  description: "Luxury Silver Jewelry Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${cormorant.variable} ${bodoni.variable} ${pinyon.variable} antialiased bg-white min-h-screen flex flex-col`}
      >
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
