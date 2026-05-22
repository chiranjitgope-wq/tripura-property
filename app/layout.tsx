import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripuraproperty.in"),
  title: {
    default: "Tripura Property",
    template: "%s | Tripura Property",
  },
  description:
    "Tripura’s first property marketplace to buy, sell, and rent homes, flats, plots, and rentals.",
  openGraph: {
    title: "Tripura Property",
    description:
      "Tripura’s first property marketplace to buy, sell, and rent properties in Tripura.",
    url: "https://tripuraproperty.in",
    siteName: "Tripura Property",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tripura Property",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tripura Property",
    description:
      "Tripura’s first property marketplace to buy, sell, and rent properties in Tripura.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}