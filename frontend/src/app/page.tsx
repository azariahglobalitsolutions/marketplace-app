import { Container, Section } from "@/components/layout/container";
import { brand } from "@/lib/brand";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container className="py-8 sm:py-12">
          <p className="text-caption">{brand.tagline}</p>
          <h1 className="text-display mt-2">
            {brand.name}{" "}
            <span lang="am" className="text-brand-amharic">
              {brand.nameAmharic}
            </span>
          </h1>
          <p className="text-body-sm mt-4 max-w-2xl text-muted-foreground">
            {brand.description}
          </p>
        </Container>
      </Section>
    </main>
  );
}
