import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripura Property",
  description: "Tripura’s first property marketplace to buy, sell, and rent homes, flats, plots, and rentals.",
  openGraph: {
    title: "Tripura Property",
    description: "Tripura’s first property marketplace.",
    url: "https://tripuraproperty.in",
    siteName: "Tripura Property",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tripura Property",
    description: "Tripura’s first property marketplace.",
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