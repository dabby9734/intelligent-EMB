import Head from "next/head";
import Navbar from "../components/Navbar";
import Messages from "../components/Messages";

export default function lostBoard() {
  return (
    <>
      <Head>
        <title>iEMB</title>
        <meta
          name="description"
          content="Fighting HCI IT Department's anticompetitive behaviours"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <div className="contentframe">
        <Messages boardID={1050} />
      </div>
    </>
  );
}
