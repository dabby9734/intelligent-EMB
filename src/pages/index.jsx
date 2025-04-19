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
        <title>
          Intelligent e-Message Board (iEMB) | Fast & Mobile-Friendly HCI iEMB
          Client
        </title>
        <meta
          name="description"
          content="Access Hwa Chong Institution's e-Message Board with our responsive, fast, and user-friendly interface. Log in to view student announcements, service messages, and more."
        />
        <meta
          name="keywords"
          content="iEMB, Hwa Chong Institution, HCI message board, school announcements, student portal, e-Message Board"
        />

        {/* Canonical URL to prevent duplicate content issues */}
        <link rel="canonical" href="https://iemb.pages.dev" />

        {/* OpenGraph tags for better social sharing */}
        <meta
          property="og:title"
          content="Intelligent e-Message Board (iEMB)"
        />
        <meta
          property="og:description"
          content="Fast, responsive client for Hwa Chong Institution's e-Message Board. Access school announcements and messages easily."
        />
        <meta property="og:url" content="https://iemb.pages.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="iEMB" />
        <meta
          property="og:image"
          content="https://iemb.pages.dev/android-chrome-512x512.png"
        />
        <meta
          property="og:image:alt"
          content="Intelligent e-Message Board Logo"
        />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Intelligent e-Message Board (iEMB)"
        />
        <meta
          name="twitter:description"
          content="Fast, responsive client for Hwa Chong Institution's e-Message Board."
        />
        <meta
          name="twitter:image"
          content="https://iemb.pages.dev/android-chrome-512x512.png"
        />

        {/* Structured data for improved search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Intelligent e-Message Board",
              alternateName: "iEMB",
              description:
                "A fast and user-friendly client for accessing Hwa Chong Institution's e-Message Board.",
              applicationCategory: "Education",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
              },
              author: {
                "@type": "Person",
                name: "dabby",
              },
            }),
          }}
        />
        {/* Configure other Head tags in _document.js */}
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
