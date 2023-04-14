const imageCache = {};

export const getImage = async (url) => {
  if (!url) {
    return null;
  }
  if (!imageCache[url]) {
    imageCache[url] = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error("Failed to load", url));
      };
      img.src = url;
    });
  }
  return imageCache[url];
};
