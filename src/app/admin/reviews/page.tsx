import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getReviews } from "@/lib/admin/data";
import { ReviewRow } from "@/components/admin/review-row";

export const metadata = { title: "Reviews" };

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const active = TABS.some((t) => t.value === status) ? status : "pending";
  const reviews = await getReviews(active);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Only approved reviews count towards a place&apos;s public rating.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews?status=${tab.value}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          No {active} reviews.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </ul>
      )}
    </main>
  );
}
