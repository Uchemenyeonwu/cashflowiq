import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var B = 'cdnfonts.com';
            // 1. Intercept href property setter on HTMLLinkElement
            var hd = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
            if (hd && hd.set) {
              Object.defineProperty(HTMLLinkElement.prototype, 'href', {
                set: function(v) { if (typeof v === 'string' && v.indexOf(B) !== -1) return; hd.set.call(this, v); },
                get: hd.get, configurable: true, enumerable: true
              });
            }
            // 2. Intercept setAttribute
            var sa = Element.prototype.setAttribute;
            Element.prototype.setAttribute = function(n, v) {
              if (this.tagName === 'LINK' && n === 'href' && typeof v === 'string' && v.indexOf(B) !== -1) return;
              return sa.call(this, n, v);
            };
            // 3. Intercept appendChild
            var ac = Node.prototype.appendChild;
            Node.prototype.appendChild = function(c) {
              if (c && c.tagName === 'LINK' && c.href && c.href.indexOf(B) !== -1) return c;
              return ac.call(this, c);
            };
            // 4. Intercept insertBefore
            var ib = Node.prototype.insertBefore;
            Node.prototype.insertBefore = function(n, r) {
              if (n && n.tagName === 'LINK' && n.href && n.href.indexOf(B) !== -1) return n;
              return ib.call(this, n, r);
            };
            // 5. Intercept append
            var ap = Element.prototype.append;
            if (ap) { Element.prototype.append = function() {
              var a = arguments; for (var i = 0; i < a.length; i++) {
                if (a[i] && a[i].tagName === 'LINK' && a[i].href && a[i].href.indexOf(B) !== -1) return;
              } return ap.apply(this, a);
            }; }
            // 6. Suppress console errors
            var ce = console.error;
            console.error = function() { var m = Array.prototype.join.call(arguments, ' ');
              if (m.indexOf(B) !== -1 || m.indexOf('ERR_BLOCKED_BY_RESPONSE') !== -1) return; ce.apply(console, arguments);
            };
            // 7. Capture resource errors
            window.addEventListener('error', function(e) {
              if (e.target && (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT')) {
                var s = e.target.href || e.target.src || '';
                if (s.indexOf(B) !== -1) { e.stopImmediatePropagation(); e.preventDefault(); return false; }
              }
            }, true);
          })();
        `}} />
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <Providers>{children}</Providers>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
