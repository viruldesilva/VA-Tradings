import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NotFoundContent } from "@/components/content/not-found-content";

export const metadata = { title: "Page not found" };

/** Unmatched URLs render here, outside the (shop) layout, so add the shop chrome. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
