import { Navbar } from "@/components/layout/navbar";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">{children}</main>
    </>
  );
}
