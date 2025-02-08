import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            name="description"
            content="intelligent EMB is blazingly fast and user friendly for the Integrated e-Message Board (iEMB) of Hwa Chong Institution"
          />
          <meta name="theme-color" content="#CE9EFF" />
          <meta name="author" content="iEMB" />
          <meta
            name="keywords"
            content="iemb, hwa chong, hci, hci iemb, Hwa Chong Institution, Integrated e-Message Board"
          />

          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <>
            {/* <!-- Cloudflare Web Analytics --> */}
            <script
              defer
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon='{"token": "167cd996f0ac407f842e3cac80c43a7f"}'
            ></script>
            {/* <!-- End Cloudflare Web Analytics --> */}
          </>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
