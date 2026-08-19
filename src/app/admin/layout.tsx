import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Luxe Roam admin" },
  // The dashboard must never be indexed, whatever robots.txt says.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <AdminNav />
      {children}
    </div>
  );
}
