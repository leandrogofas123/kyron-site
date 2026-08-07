import type { Metadata } from "next";

const APP_URL = `https://${process.env.APP_HOST ?? "app.kyrontecnologia.com"}`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Kyron Academy",
    template: "%s | Kyron Academy",
  },
  description: "Treinamentos e manuais práticos da Kyron Tecnologia.",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-kyron-black text-kyron-white">{children}</div>;
}
