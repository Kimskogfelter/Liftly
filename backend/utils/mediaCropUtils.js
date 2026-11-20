export const DEFAULT_MEDIA_CROP = { x: 50, y: 20, zoom: 1 };

export const normalizeMediaCrops = (rawCrops, mediaLength) => {
    if (!rawCrops) return [];

    let list = rawCrops;
    if (typeof rawCrops === "string") {
        try {
            list = JSON.parse(rawCrops);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(list)) return [];

    const count = typeof mediaLength === "number" && mediaLength > 0 ? mediaLength : list.length;

    return Array.from({ length: count }, (_, idx) => {
        const item = list[idx] || {};
        const x = Number(item.x);
        const y = Number(item.y);
        const zoom = Number(item.zoom);

        return {
            x: Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : DEFAULT_MEDIA_CROP.x,
            y: Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : DEFAULT_MEDIA_CROP.y,
            zoom: Number.isFinite(zoom) ? Math.min(3, Math.max(1, zoom)) : DEFAULT_MEDIA_CROP.zoom,
        };
    });
};