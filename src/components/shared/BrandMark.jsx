import navalisLogo from "../../img/navalis_logo.png";

export function BrandMark({ size = "md" }) {
  const sizes = {
    sm: "w-36",
    md: "w-48",
    lg: "w-64",
  };

  // Backward compat: numeric sizes map to closest named size
  const resolveSize = (s) => {
    if (typeof s === "string") return sizes[s] || sizes.md;
    if (s <= 36) return sizes.sm;
    if (s <= 52) return sizes.md;
    return sizes.lg;
  };

  const w = resolveSize(size);

  return <img src={navalisLogo} alt="Navalis" className={`${w} h-auto`} draggable="false" />;
}
