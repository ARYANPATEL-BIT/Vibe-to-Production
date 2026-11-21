import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// GitHub Pages serves the site at https://aryanpatel-bit.github.io/Vibe-to-Production/
const basePath = '/Vibe-to-Production';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // The content lives in ../content and the Get it pages read ../prompts etc.,
  // so Turbopack must be allowed to resolve files above site/.
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
  reactStrictMode: true,
};

export default withMDX(config);
