import { ImageLoader } from "next/image";

const notOptimizedImageLoader: ImageLoader = ({ src }) => {
  return src;
};
export default notOptimizedImageLoader;
