import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./components/Sidebar";
import AdminGuard from "./components/AdminGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AdminGuard>
          <div className="d-flex">
            <Sidebar />
            <main className="flex-grow-1 p-4" style={{ overflowX: "auto" }}>
              {children}
            </main>
          </div>
        </AdminGuard>
      </body>
    </html>
  );
}
