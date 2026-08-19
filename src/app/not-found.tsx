import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Compass className="size-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The link may be out of date, or the destination may have moved. Try
        searching, or start again from the homepage.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Back to home
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Browse destinations
        </Link>
      </div>
    </main>
  );
}
