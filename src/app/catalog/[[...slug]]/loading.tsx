import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";

export default function CatalogLoading() {
  return (
    <main id="main" className="flex flex-1 flex-col pb-16">
      <CatalogSkeleton />
    </main>
  );
}
