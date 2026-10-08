import { productFormat, productFormatLabel } from "../shop/config";

export default function ProductFormatBadge({ product, format, className = "" }) {
  const value = productFormat(product || { format });
  return (
    <span className={`product-format ${className}`.trim()} data-format={value}>
      {productFormatLabel(value)}
    </span>
  );
}
