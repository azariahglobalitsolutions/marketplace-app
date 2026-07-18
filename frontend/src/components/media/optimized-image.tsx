import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

type OptimizedImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function OptimizedImage({
  className,
  alt,
  src,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}
