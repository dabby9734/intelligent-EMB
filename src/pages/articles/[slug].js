import fs from "fs";
import matter from "gray-matter";
import md from "markdown-it";
import Head from "next/head";

export async function getStaticPaths() {
  const files = fs.readdirSync("src/md");
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(".md", ""),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const fileName = fs.readFileSync(`src/md/${slug}.md`, "utf-8");
  const { data: frontmatter, content } = matter(fileName);
  return {
    props: {
      frontmatter,
      content,
    },
  };
}

export default function PostPage({ frontmatter, content }) {
  return (
    <>
      <Head>
        <title>iEMB :: {frontmatter.title}</title>
        <meta
          name="description"
          content={frontmatter.description ?? frontmatter.title}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="md-wrap md-scroll">
        <div className="markdown-body md-box">
          <div className="github-callout">
            <div className="callout-content">
              <p>👋 Looking for the iEMB login page?</p>
              <a href="/" className="callout-button">
                Go to Login →
              </a>
            </div>
          </div>

          <h1>{frontmatter.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: md().render(content) }} />
        </div>
      </div>
    </>
  );
}
