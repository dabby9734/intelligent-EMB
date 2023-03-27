import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Alert, Snackbar } from "@mui/material";

import { getCookie, setCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";

import Login from "../components/Login";

export default function LoginPage() {
  const router = useRouter();
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (getCookie("username") && getCookie("password")) {
      // update cookie
      setCookie("username", getCookie("username"), 2592000);

      if (
        !getCookie("sess_id") ||
        !getCookie("veri_token") ||
        !getCookie("auth_token")
      ) {
        setInfo("Refreshing token...");
        refreshToken(
          // redirect to student board if token refresh successful
          async () => router.push("/student?type=inbox"),
          setInfo
        );
      } else {
        router.push("/student?type=inbox");
      }
    }
  });

  return (
    <div>
      <Head>
        <title>iEMB :: Login</title>
        <meta name="description" content="i-EMB, reimagined." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Snackbar
        open={!!info}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setInfo("")}
      >
        <Alert severity="info">{info}</Alert>
      </Snackbar>
      <Login />
    </div>
  );
}
