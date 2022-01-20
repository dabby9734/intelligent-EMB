import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { getCookie } from "../lib/cookieMonster";

import Login from "../components/Login";

export default function LoginPage() {
  const router = useRouter();
  const needsLogin = () => {
    if (!getCookie("username") || !getCookie("password")) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!needsLogin()) {
      router.push("/student");
    }
  });

  return (
    <div>
      <Head>
        <title>iEMB :: Login</title>
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
