import "./globals.css";
import MiniPayBanner from "../components/MiniPayBanner";

export const metadata = {
  title: "ChamaVault — Trustless Savings Circles on Celo",
  description:
    "Digitize Africa's centuries-old rotating savings tradition (Chama, Susu, Tontine) with blockchain-powered trust. Save together, grow together — powered by Celo stablecoins.",
  keywords:
    "chama, savings circle, celo, minipay, stablecoins, susu, tontine, stokvel, rotating savings, Africa, blockchain, DeFi",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "ChamaVault — Trustless Savings Circles on Celo",
    description: "Digitize Africa's rotating savings tradition with blockchain-powered trust.",
    url: "https://chamavault.vercel.app",
    siteName: "ChamaVault",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChamaVault — Trustless Savings Circles on Celo",
    description: "Digitize Africa's rotating savings tradition with blockchain-powered trust.",
    images: ["/icon.png"],
  },
  other: {
    "talentapp:project_verification": "3ee68e619f7e029c1c46da3d016a5505c3b83374452af7d9318161fc4c1c02c0f36cf29d1280a87d5166a2e90cbce8523346daf8fbf8321858b32c35fa13eaf6"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MiniPayBanner />
        {children}
      </body>
    </html>
  );
}
