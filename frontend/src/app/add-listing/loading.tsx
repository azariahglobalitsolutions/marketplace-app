import { Container } from "@/components/layout/container";

export default function AddListingLoading() {
  return (
    <Container className="py-10">
      <div className="h-10 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-80 animate-pulse rounded-2xl bg-muted" />
    </Container>
  );
}
