const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/hub-frontend" : "";

module.exports = {
  basePath,
  assetPrefix: basePath,
};
