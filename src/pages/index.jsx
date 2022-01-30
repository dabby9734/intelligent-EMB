import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { getCookie, setCookie } from "../lib/cookieMonster";

import Login from "../components/Login";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getCookie("username") && getCookie("password")) {
      // update cookie
      setCookie("username", getCookie("username"), 2592000);

      // redirect to student page
      router.push("/student");
    }
  });

  return (
    <div>
      <Head>
        <title>iEMB :: Login</title>
        <html lang="en" />
        <meta
          name="description"
          content="Fighting HCI IT Department's anticompetitive behaviours"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Login />
    </div>
  );
}
