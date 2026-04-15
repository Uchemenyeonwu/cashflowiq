import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CashFlowIQ - AI Cash Flow Forecasting for SMBs",
  description: "Predict cash shortfalls, manage cash flow, and make better financial decisions.",
  openGraph: {
    title: "CashFlowIQ",
    description: "AI-powered cash flow forecasting for small businesses",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var origError = console.error;
            console.error = function() {
              var args = Array.prototype.slice.call(arguments);
              var msg = args.join(' ');
              if (msg.indexOf('cdnfonts.com') !== -1 || msg.indexOf('ERR_BLOCKED_BY_RESPONSE') !== -1) return;
              origError.apply(console, arguments);
            };
            window.addEventListener('error', function(e) {
              if (e.filename && (e.filename.indexOf('cdnfonts.com') !== -1 || e.filename.indexOf('appllm-lib') !== -1)) {
                e.preventDefault();
              }
            });
          })();
        `}} />
      </head>
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
