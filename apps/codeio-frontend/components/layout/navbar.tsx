"use client";

import Link from "next/link";
import { Code2, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import UserControl from "./user-control";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = async () => {
    if (!document.startViewTransition) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    document.startViewTransition(() => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative overflow-hidden"
      onClick={toggleTheme}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          resolvedTheme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />

      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          resolvedTheme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </div>

          <span>CodeRun</span>
        </Link>

        <nav className="ml-6 hidden gap-1 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            Projects
          </Link>
          <Link
            href="/docs"
            className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto hidden gap-2 md:flex">
          <ThemeToggle />
          <Show when={"signed-out"}>
            <SignInButton>
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when={"signed-in"}>
            <UserControl showName={false} />
          </Show>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-2">
              <Link href="/" className="rounded-md p-3 hover:bg-accent">
                Home
              </Link>
              <Link href="/projects" className="rounded-md p-3 hover:bg-accent">
                Projects
              </Link>
              <Link href="/docs" className="rounded-md p-3 hover:bg-accent">
                Docs
              </Link>
              <Link href="/pricing" className="rounded-md p-3 hover:bg-accent">
                Pricing
              </Link>

              <ThemeToggle />

              <div className="mt-4 flex flex-col gap-2">
                <SignInButton>
                  <Button variant="outline">Log in</Button>
                </SignInButton>
                <SignUpButton>
                  <Button>Sign up free</Button>
                </SignUpButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
