import { TopNav } from "@/components/TopNav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main>{children}</main>
    </>
  );
}
