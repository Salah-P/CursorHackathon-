import type { Metadata } from "next";
import "./globals.css";

// Update this with your project's name and pitch — it sets the browser tab
// title and social previews.
export const metadata: Metadata = {
  title: "Hakim AI — Decision Intelligence",
  description:
    "The intelligence layer between city data and the decision. Hakim AI turns fragmented datasets into one clear answer the moment a decision is made.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-night-950 text-sand-50 antialiased">
        {children}
      </body>
    </html>
  );
}
