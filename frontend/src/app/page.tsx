import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { brand } from "@/lib/brand";

export default function Home() {
  return (
    <PageContainer>
      <SectionHeading
        as="h1"
        title={
          <>
            {brand.name}{" "}
            <span lang="am" className="text-brand-amharic text-primary">
              {brand.nameAmharic}
            </span>
          </>
        }
        description={brand.description}
      />
      <p className="text-body-sm text-muted-foreground">{brand.tagline}</p>
    </PageContainer>
  );
}
