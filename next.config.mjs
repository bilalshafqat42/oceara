/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    /*
     * Only qualities listed here may be requested
     * through the Next.js Image component.
     */
    qualities: [75, 90, 100],

    /*
     * Prefer AVIF on supporting browsers and use
     * WebP as the next available optimized format.
     */
    formats: ["image/avif", "image/webp"],

    /*
     * Widths used by Next.js when generating responsive
     * full-width image candidates.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560, 3840],

    /*
     * Smaller candidates used by images that do not
     * occupy the full viewport width.
     */
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
