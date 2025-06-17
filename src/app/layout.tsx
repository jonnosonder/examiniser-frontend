import type { Metadata } from "next";
import '../styles/globals.css';
import '../styles/colors.css';


export const metadata: Metadata = {
  title: "Examiniser",
  description: "Create exam papers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

        <link rel="icon" href="/favicon.ico" />

      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
