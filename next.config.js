/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // beforeFiles rewrites run BEFORE the filesystem check.
      // This means they execute BEFORE Vercel can serve index.html statically.
      // This is the only way to override static file precedence.
      beforeFiles: [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: '(?:.*\\.)?bestnightlifethailand\\.com',
            },
          ],
          destination: '/concierge',
        },
      ],
    };
  },
};

module.exports = nextConfig;
