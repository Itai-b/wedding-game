import Image from "next/image";

/** Renders a transparent Saar/Itai sticker, aspect-preserved inside a square box. */
export default function Sticker({
  src,
  size = 40,
  alt = "",
  className = "",
  priority = false,
}: {
  src: string;
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-block shrink-0 align-middle ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={priority}
      />
    </span>
  );
}
