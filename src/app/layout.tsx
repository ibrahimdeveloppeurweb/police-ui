import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import InitialLoader from "@/components/ui/InitialLoader";
import { ToastProvider } from "@/components/ui/ToastProvider";
import TokenExpirationChecker from "@/components/auth/TokenExpirationChecker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Police Nationale CI - Système de Gestion",
  description: "Plateforme intégrée de gestion des opérations de la Police Nationale de Côte d'Ivoire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ToastProvider>
          <TokenExpirationChecker />
          <InitialLoader />
          <LoadingOverlay />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}