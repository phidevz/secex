"use client";

import type { PropsWithChildren } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { LanguagePopover } from "~/components/LanguagePopover";
import { useTranslation } from "~/app/i18n/client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { UserIcon } from "lucide-react";

export function AdminLayout(props: PropsWithChildren<{ isLoggedIn: boolean }>) {
  const { isLoggedIn, children } = props;
  const { i18n } = useTranslation();

  return (
    <>
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[var(--max-width)] items-center px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              Secure Exchange Portal <span className="text-red-500">Admin</span>
            </span>
            <div
              className="focus:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80 ml-2 inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              data-v0-t="badge"
            >
              v2.0.0
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="ring-offset-background focus-visible:ring-ring [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  id="radix-«r0»"
                  aria-haspopup="menu"
                  aria-expanded="false"
                  data-state="closed"
                  aria-label={i18n.language === "de" ? "Deutsch" : "English"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-globe h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                  <span className="sm:hidden">🇺🇸</span>
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <LanguagePopover i18n={i18n} />
              </PopoverContent>
            </Popover>
            {isLoggedIn ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <UserIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col gap-4">
                    <Button asChild variant="outline">
                      <Link href="/api/auth/signout">Logout</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </div>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
        {children}
      </main>
    </>
  );
}
