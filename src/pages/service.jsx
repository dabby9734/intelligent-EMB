import Head from "next/head";
import Navbar from "../components/Navbar";
import Messages from "../components/Messages";

export default function serviceBoard() {
  return (
    <>
      <Head>
        <title>iEMB</title>
        <meta name="description" content="i-EMB, reimagined." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <Messages boardID={1039} />
    </>
  );
}
