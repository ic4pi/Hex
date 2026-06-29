/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/': ['./data/**/*'],
    '/admin': ['./data/**/*'],
    '/api/**': ['./data/**/*'],
  },
}

module.exports = nextConfig
