const imageCache = {};

export const getImageWithRetry = async (url, retry = 0) => {
  console.log("called with", url, retry);
  if (!url) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      console.log("onError", url, e);
      if (retry < 3) {
        console.log("call retry", retry);
        getImageWithRetry(url, retry + 1)
          .then(resolve)
          .catch(reject);
      } else {
        console.log("reject");
        reject(new Error(`Failed to load: <${url}>`));
      }
    };
    img.src = url;
  });
};

export const getImage = async (url) => {
  if (!url) {
    return null;
  }
  if (!imageCache[url]) {
    imageCache[url] = getImageWithRetry(url);
  }
  return imageCache[url];
};
