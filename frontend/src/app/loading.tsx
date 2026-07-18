import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="space-y-4">
        <div className="h-10 w-64 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    </Container>
  );
}
