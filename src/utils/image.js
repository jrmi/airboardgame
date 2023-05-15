const imageCache = {};

export const getImage = async (url, retry = 0) => {
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
        if (retry < 2) {
          getImage(url, retry + 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(`Failed to load: <${url}>`));
        }
      };
      img.src = url;
    });
  }
  return imageCache[url];
};
