import type { Metadata, Viewport } from "next";
import "./tokens.css";
import "./components.css";
import "./site.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.usopennetball.com"),
  title: "U.S. Open Netball Championships® 2026 · Las Vegas, Nov 6–8",
  description: "Watch the free global livestream and follow final scores from the USA's largest netball event. Women's and mixed teams from 25+ states and 12 countries. Las Vegas, November 6–8, 2026.",
  openGraph: {
    title: "U.S. Open Netball Championships® 2026",
    description: "Free global livestream and final scores from Las Vegas, November 6–8.",
    images: ["/images/photos/opening-ceremony.jpg"],
    type: "website",
  },
  icons: { icon: "/images/logos/us-open-2026.png" },
};

export const viewport: Viewport = { themeColor: "#1c489a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap" />
      </head>
      <body className="uso">
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
