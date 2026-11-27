import Image, { type ImageProps } from "next/image";
import { imageSrc } from "@/lib/image-urls.mjs";

// Assets are pre-encoded to WebP below 500 KB. Passing through avoids a second
// encoder or upscaling request exceeding that limit; layout props stay intact.
export default function SiteImage(props: ImageProps) {
  return (
    <Image
      {...props}
      src={typeof props.src === "string" ? imageSrc(props.src) : props.src}
      unoptimized
    />
  );
}
