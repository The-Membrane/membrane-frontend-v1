/** @type {import('next').NextConfig} */

const withTM = require("next-transpile-modules")(["@0xsquid/widget"]);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@0xsquid/widget"]
}

module.exports = withTM(nextConfig);
