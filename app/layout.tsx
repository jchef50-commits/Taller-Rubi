import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Taller Rubí",
  description: "Gestión de taller automotriz profesional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-20 p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
