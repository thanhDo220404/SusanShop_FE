const EXPAND_THRESHOLD = 6;

export function expandProductsByColor(products) {
  if (!products || products.length === 0) return [];
  if (products.length >= EXPAND_THRESHOLD) return products;

  const expanded = [];

  for (const product of products) {
    const variants = product.variants || [];

    const uniqueColors = [];
    const seenColorIds = new Set();

    for (const v of variants) {
      if (!v.color_id) continue;
      const colorId = v.color_id?._id || v.color_id;
      if (seenColorIds.has(String(colorId))) continue;
      seenColorIds.add(String(colorId));

      uniqueColors.push({
        id: colorId,
        name: v.color_id?.name,
        hex: v.color_id?.hex,
      });
    }

    if (uniqueColors.length <= 1) {
      expanded.push(product);
      continue;
    }

    const allImages = product.images || [];

    for (const color of uniqueColors) {
      const colorVariants = variants.filter((v) => {
        const vColorId = v.color_id?._id || v.color_id;
        return String(vColorId) === String(color.id);
      });

      const colorIndex = uniqueColors.indexOf(color);
      const colorImage = allImages[colorIndex];

      expanded.push({
        ...product,
        _id: `${product._id}_${color.id}`,
        _isExpanded: true,
        _colorLabel: color.name,
        _colorHex: color.hex,
        _colorId: color.id,
        variants: colorVariants,
        features: false,
        images: colorImage
          ? [colorImage]
          : allImages.length > 0
            ? [allImages[0]]
            : [],
      });
    }
  }

  return expanded;
}
