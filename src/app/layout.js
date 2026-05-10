import "./globals.css";

export const metadata = {
  title: "ChamaVault — Trustless Savings Circles on Celo",
  description:
    "Digitize Africa's centuries-old rotating savings tradition (Chama, Susu, Tontine) with blockchain-powered trust. Save together, grow together — powered by Celo stablecoins.",
  keywords:
    "chama, savings circle, celo, minipay, stablecoins, susu, tontine, stokvel, rotating savings, Africa, blockchain",
  other: {
    "talentapp:project_verification": "3ee68e619f7e029c1c46da3d016a5505c3b83374452af7d9318161fc4c1c02c0f36cf29d1280a87d5166a2e90cbce8523346daf8fbf8321858b32c35fa13eaf6"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
