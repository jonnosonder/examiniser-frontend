import type { Metadata } from "next";
import '../styles/globals.css';
import '../styles/colors.css';
import { DataProvider } from "../context/dataContext";
// import Script from 'next/script'

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"></meta>
        <link rel="icon" href="/favicon.ico" />

      </head>
      <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      ></script>
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
