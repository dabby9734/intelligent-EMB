export function setCookie(cname, cvalue, exsecs) {
  const d = new Date();
  d.setTime(d.getTime() + exsecs * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function deleteCookie(cname) {
  // get a cookie and set the expiry to Thu, 01 Jan 1970 00:00:01 GMT
  const cvalue = getCookie(cname);
  setCookie(cname, cvalue, -1);
}
