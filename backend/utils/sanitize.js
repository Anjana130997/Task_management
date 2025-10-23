// utils/sanitize.js
export const sanitizeString = (str = "") => {
  if (typeof str !== "string") return str;
  // remove script tags and trim - basic helper for demo
  return str.replace(/<script.*?>.*?<\/script>/gi, "").trim();
};
