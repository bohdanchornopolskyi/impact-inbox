import type { ComponentType } from "react";
import type { PlatformStarterName } from "@repo/shared";

function Bar({ className }: { className: string }) {
  return <span className={`block shrink-0 ${className}`} />;
}

function HeroThumbnail() {
  return (
    <span className="flex flex-col gap-1">
      <Bar className="h-7.5 w-full rounded-[2px] bg-neutral-200" />
      <Bar className="h-1.25 w-20 max-w-full rounded-[1px] bg-neutral-400" />
      <Bar className="h-1 w-15.5 max-w-full rounded-[1px] bg-neutral-300" />
      <Bar className="h-2 w-7.5 rounded-[2px] bg-neutral-800" />
    </span>
  );
}

function PostsGridThumbnail() {
  return (
    <span className="flex gap-1.5">
      {[0, 1].map((index) => (
        <span key={index} className="flex min-w-0 flex-1 flex-col gap-1">
          <Bar className="h-9 w-full rounded-[2px] bg-neutral-200" />
          <Bar className="h-1 w-9 max-w-full rounded-[1px] bg-neutral-400" />
          <Bar className="h-0.75 w-5.5 rounded-[1px] bg-neutral-300" />
        </span>
      ))}
    </span>
  );
}

function CtaBannerThumbnail() {
  return (
    <span className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-[3px] bg-neutral-800">
      <Bar className="h-1.25 w-15.5 max-w-full rounded-[1px] bg-white/70" />
      <Bar className="h-2.25 w-7.5 rounded-[2px] bg-brand-300" />
    </span>
  );
}

function TestimonialThumbnail() {
  return (
    <span className="flex flex-1 flex-col items-center justify-center gap-1.25">
      <Bar className="size-4 rounded-full bg-neutral-300" />
      <Bar className="h-1 w-20 max-w-full rounded-[1px] bg-neutral-400" />
      <Bar className="h-1 w-16 max-w-full rounded-[1px] bg-neutral-300" />
      <Bar className="h-0.75 w-7.5 rounded-[1px] bg-neutral-300" />
    </span>
  );
}

export const FEATURED_SECTIONS = [
  { name: "Hero", label: "Hero", Thumbnail: HeroThumbnail },
  { name: "Posts Grid", label: "Posts grid", Thumbnail: PostsGridThumbnail },
  { name: "CTA Banner", label: "CTA banner", Thumbnail: CtaBannerThumbnail },
  { name: "Testimonial", label: "Testimonial", Thumbnail: TestimonialThumbnail },
] as const satisfies ReadonlyArray<{
  name: PlatformStarterName;
  label: string;
  Thumbnail: ComponentType;
}>;
