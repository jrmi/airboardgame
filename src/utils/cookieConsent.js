const COOKIE_NAME = "cookieConsent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const getCookieConsent = () => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  return cookie.slice(COOKIE_NAME.length + 1) === "true";
};

export const setCookieConsent = (consent) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${consent}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
};
