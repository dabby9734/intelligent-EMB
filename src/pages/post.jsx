import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import MobileNavbar from "../components/MobileNavbar";
import DesktopNavbar from "../components/DesktopNavbar";
import PostFrame from "../components/PostFrame";

const Post = () => {
  const router = useRouter();
  const { pid, boardID, type } = router.query;

  return (
    <>
      <Head>
        <title>iEMB :: Post {pid}</title>
      </Head>
      <Header />
      <MobileNavbar />
      <div className="contentframe">
        <DesktopNavbar />
        <PostFrame pid={pid} boardID={boardID} type={type} />
      </div>
    </>
  );
};

export default Post;
