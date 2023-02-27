import { getCookie, setCookie, deleteCookie } from "./cookieMonster";
import { getApiURL } from "./util";

export const refreshToken = async (onComplete, fireNotification, router) => {
  let url = new URL(getApiURL("login"));
  url.searchParams.append("username", getCookie("username"));
  url.searchParams.append("password", getCookie("password"));
  const response = await fetch(url);

  switch (response.status) {
    case 200:
      break;
    default:
      fireNotification("Token refresh failed");
      deleteCookie("username");
      deleteCookie("password");
      deleteCookie("auth_token");
      deleteCookie("sess_id");
      deleteCookie("veri_token");
      localStorage.clear();
      router.push("/" + "?next=" + encodeURIComponent(router.asPath));
  }

  const data = await response.json();

  if (data.success) {
    setCookie("auth_token", data.AUTH_TOKEN, 1800);
    setCookie("sess_id", data.SESSION_ID, 1800);
    setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);

    fireNotification("Token refreshed");
    return await onComplete();
  }
};
