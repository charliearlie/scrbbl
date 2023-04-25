import { Link } from "@remix-run/react";
import type { ImgHTMLAttributes } from "react";

type CardImageProps = {
  to?: string;
};

type Props = ImgHTMLAttributes<HTMLImageElement> & CardImageProps;

export default function CardImage({ alt, src, to, ...imageProps }: Props) {
  if (to) {
    return (
      <Link
        to={to}
        className="flex w-full cursor-pointer rounded-t-lg bg-black"
      >
        <img
          alt={alt}
          className="md:32 h-40 w-full rounded-t-lg opacity-80"
          loading="lazy"
          height="10rem"
          width="100%"
          src={src}
          {...imageProps}
        />
      </Link>
    );
  }

  return (
    <img
      alt={alt}
      className="md:32 h-40 w-full rounded-t-lg opacity-80"
      loading="lazy"
      height="10rem"
      src={src}
      width="100%"
      {...imageProps}
    />
  );
}
