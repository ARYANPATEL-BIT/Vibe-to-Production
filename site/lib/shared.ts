export const appName = 'vibe-to-prod';
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const siteUrl = `https://aryanpatel-bit.github.io${basePath}`;

export const gitConfig = {
  user: 'ARYANPATEL-BIT',
  repo: 'Vibe-to-Production',
  branch: 'main',
};

export const repoUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
