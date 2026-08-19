import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getEnquiries } from "@/lib/admin/data";
import { EnquiryRow } from "@/components/admin/enquiry-row";

export const metadata = { title: "Enquiries" };

const TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
];

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminEnquiriesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = TABS.some((t) => t.value === status) ? status : "";
  const enquiries = await getEnquiries(active || undefined);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
          <p className="text-sm text-muted-foreground">
            Every enquiry submitted from the contact form.
          </p>
        </div>
        <a
          href="/admin/enquiries/export"
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <Download className="size-4" />
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={
              tab.value
                ? `/admin/enquiries?status=${tab.value}`
                : "/admin/enquiries"
            }
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              (active || "") === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <p className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          No enquiries here yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {enquiries.map((enquiry) => (
            <EnquiryRow key={enquiry.id} enquiry={enquiry} />
          ))}
        </ul>
      )}
    </main>
  );
}
