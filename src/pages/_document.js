import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head />
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
