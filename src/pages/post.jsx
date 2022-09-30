import Head from "next/head";
import { useRouter } from "next/router";
import { Box, useTheme } from "@mui/material";
import Header from "../components/Header";
import MobileNavbar from "../components/MobileNavbar";
import DesktopNavbar from "../components/DesktopNavbar";
import PostFrame from "../components/PostFrame";

const Post = () => {
  const router = useRouter();
  const { pid, boardID, type } = router.query;

  const theme = useTheme();

  return (
    <>
      <Head>
        <title>iEMB :: Post {pid}</title>
        <meta name="description" content="i-EMB, reimagined." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <MobileNavbar />
      <div style={{ display: "flex" }}>
        <DesktopNavbar />
        <Box
          className="contentframe"
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          <PostFrame pid={pid} boardID={boardID} type={type} />
        </Box>
      </div>
    </>
  );
};

export default Post;
