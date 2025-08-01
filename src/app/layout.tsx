import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tibia Tools LATAM Pro - Dashboard para jugadores de Tibia",
  description: "Herramientas para jugadores de Tibia en LATAM: LiveMap de Bosses, Historial de Muertes y Temporizador de Respawn",
  keywords: "Tibia, MMORPG, bosses, respawn timer, death log, LATAM, herramientas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 to-black min-h-screen text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
