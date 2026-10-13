const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// console.log('IMAGE_URL', item);
export const APIURLS = {
  baseUrl: BASE_URL,
  authImg: BASE_URL + "auth/",
  imageUrl: BASE_URL?.slice(0, -1),
};