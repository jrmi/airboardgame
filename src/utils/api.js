import { API_ENDPOINT } from "./settings";

const uploadURI = `${API_ENDPOINT}/upload`;

export const uploadImage = async (file) => {
  const payload = new FormData();
  payload.append("file", file);
  const result = await fetch(uploadURI, {
    method: "POST",
    body: payload, // this sets the `Content-Type` header to `multipart/form-data`
  });

  return await result.text();
};
