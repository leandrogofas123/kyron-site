import type { Metadata } from "next";
import "./academy.css";

const APP_URL = `https://${process.env.APP_HOST ?? "app.kyrontecnologia.com"}`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Kyron Academy",
    template: "%s | Kyron Academy",
  },
  description: "Capacitação comercial que transforma conhecimento em performance.",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="academy-scope min-h-screen bg-kyron-black text-kyron-white">{children}</div>;
}
