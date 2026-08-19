import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export const CONTACT = {
  email: "hello@luxeroam.com",
  phone: "+254 700 000 000",
  location: "Nairobi, Kenya",
};

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Honeymoons", href: "/honeymoon" },
      { label: "Family trips", href: "/family" },
      { label: "All destinations", href: "/search" },
    ],
  },
  {
    heading: "Regions",
    links: [
      { label: "Kenya", href: "/destinations/kenya" },
      { label: "East Africa", href: "/destinations/east-africa" },
      { label: "Europe", href: "/destinations/europe" },
      { label: "Asia", href: "/destinations/asia" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-6 pb-28 pt-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Image
              src="/logo/logo.png"
              alt="Luxe Roam"
              width={1137}
              height={352}
              className="h-8 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Kenya-based, planning private honeymoons and family journeys
              across six regions.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">{column.heading}</h2>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="size-4" />
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Phone className="size-4" />
              {CONTACT.phone}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              {CONTACT.location}
            </span>
          </div>
          <p>© {new Date().getFullYear()} Luxe Roam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
