/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      // Api & testing
      { protocol: 'https', hostname: 'unsplash.it' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      // Filmy
      { protocol: 'https', hostname: 'www.bombuj.si' },
      { protocol: 'https', hostname: 'www.sledujfilmy.io' },
      // Serialy
      { protocol: 'https', hostname: 'svetserialu.io' },
      { protocol: 'https', hostname: 'www.najserialy.io' },
      { protocol: 'https', hostname: 'serialy.sx' },
      // Generic
      { protocol: 'https', hostname: 'prehrajto.cz' },
    ],
  },
};

export default nextConfig;
