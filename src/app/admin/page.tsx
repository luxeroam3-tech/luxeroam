import Link from "next/link";
import { Star, Inbox, ImageOff, FileText, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getStats } from "@/lib/admin/data";

export default async function AdminOverview() {
  const admin = await requireAdmin();
  const stats = await getStats();

  const coverage =
    stats.places > 0
      ? Math.round(
          ((stats.places - stats.placesWithoutPhoto) / stats.places) * 100,
        )
      : 0;

  const attention = [
    {
      show: stats.pendingReviews > 0,
      icon: Star,
      label: `${stats.pendingReviews} review${stats.pendingReviews === 1 ? "" : "s"} awaiting moderation`,
      href: "/admin/reviews?status=pending",
    },
    {
      show: stats.newEnquiries > 0,
      icon: Inbox,
      label: `${stats.newEnquiries} new enquir${stats.newEnquiries === 1 ? "y" : "ies"} to answer`,
      href: "/admin/enquiries?status=new",
    },
    {
      show: stats.placesWithoutPhoto > 0,
      icon: ImageOff,
      label: `${stats.placesWithoutPhoto} place${stats.placesWithoutPhoto === 1 ? "" : "s"} without a photo`,
      href: "/admin/places?filter=no-photo",
    },
    {
      show: stats.placesWithoutBlurb > 0,
      icon: FileText,
      label: `${stats.placesWithoutBlurb} place${stats.placesWithoutBlurb === 1 ? "" : "s"} without a description`,
      href: "/admin/places?filter=no-blurb",
    },
  ].filter((item) => item.show);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {admin.email}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Regions" value={stats.regions} />
        <Stat label="Places" value={stats.places} />
        <Stat
          label="Photo coverage"
          value={`${coverage}%`}
          hint={`${stats.photos} photos`}
        />
        <Stat
          label="Reviews"
          value={stats.approvedReviews}
          hint={`${stats.pendingReviews} pending`}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Needs attention</h2>
        {attention.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border p-5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-5" />
            Nothing outstanding — every place has a photo and a description, and
            there are no unanswered reviews or enquiries.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {attention.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm hover:bg-muted"
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Enquiries</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="New" value={stats.newEnquiries} />
          <Stat label="Total" value={stats.totalEnquiries} />
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border p-5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
