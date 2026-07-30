import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "fill";
};

const sizes = {
  sm: { width: 40, height: 40, className: "h-10 w-10" },
  md: { width: 96, height: 96, className: "h-24 w-24" },
  lg: { width: 320, height: 240, className: "h-48 w-full" },
};

export function ProductPhoto({
  src,
  alt,
  className = "",
  size = "sm",
}: Props) {
  if (!src) {
    if (size === "fill") {
      return (
        <div
          className={`flex h-full min-h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-400 ${className}`}
        >
          Sin foto
        </div>
      );
    }
    const s = sizes[size];
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400 ${s.className} ${className}`}
      >
        N/A
      </div>
    );
  }

  if (size === "fill") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-contain ${className}`}
      />
    );
  }

  const s = sizes[size];
  return (
    <Image
      src={src}
      alt={alt}
      width={s.width}
      height={s.height}
      unoptimized
      className={`rounded-md object-cover ${s.className} ${className}`}
    />
  );
}
