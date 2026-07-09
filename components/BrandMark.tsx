import Image from "next/image";
import Link from "next/link";
import logoMark from "@/assets/brand/logo/logo-mark.svg";

export function BrandMark() {
  return (
    <Link className="brand-mark" href="/" aria-label="Gaia Research home">
      <Image src={logoMark} alt="" width={32} height={32} aria-hidden="true" />
      <span>
        GAIA <b>[RESEARCH]</b>
      </span>
    </Link>
  );
}
