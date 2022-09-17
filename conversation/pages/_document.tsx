import type { ReactElement } from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document<{
  styleTags: ReactElement[];
}> {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          {/* <link rel="stylesheet" href="/tailwind.min.css" /> */}
          <script src="/matrix-libolm/olm.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
