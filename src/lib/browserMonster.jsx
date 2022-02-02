import { getCookie, setCookie, deleteCookie } from "./cookieMonster.jsx";

export const refreshToken = async (onComplete, setInfo, router) => {
  const response = await fetch(
    `https://iemb-backend.azurewebsites.net/api/login?username=${encodeURI(
      getCookie("username")
    )}&password=${encodeURI(getCookie("password"))}`
  );

  if (response.status != 200) {
    return setInfo("Token refresh failed");
  }

  const data = await response.json();

  if (data.success) {
    setCookie("auth_token", data.AUTH_TOKEN, 1800);
    setCookie("sess_id", data.SESSION_ID, 1800);
    setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);

    setInfo("Token refreshed");
    return await onComplete();
  }

  if (data.message === "Missing username and/or password") {
    deleteCookie("username");
    deleteCookie("password");
    deleteCookie("auth_token");
    deleteCookie("sess_id");
    deleteCookie("veri_token");
    localStorage.clear();
    router.push("/");
  } else {
    setInfo(data.message);
  }
};
