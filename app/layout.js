import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Autosphere",
  description: "find your dream car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header/>
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster richColors />
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-6 00">
            <p>Made with ❤️ by Abhishek</p>
          </div>
        </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
