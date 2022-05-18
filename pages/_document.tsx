/* eslint-disable react/no-danger */
import React from "react";
import { extractStyles } from "evergreen-ui";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

type DocumentProps = {
  css: string;
  hydrationScript: React.ReactChild;
};

class CustomDocument extends Document<DocumentProps> {
  static async getInitialProps(context: DocumentContext) {
    const page = context.renderPage();
    const { css, hydrationScript } = extractStyles();

    return {
      ...page,
      css,
      hydrationScript,
    };
  }

  render() {
    const { css, hydrationScript } = this.props;

    return (
      <Html>
        <Head>
          <link
            rel="icon"
            href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`}
          />
          <meta property="og:site_name" content="Espanso Hub" />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/espanso_logo.svg`}
          />
          <style dangerouslySetInnerHTML={{ __html: css }} />
        </Head>

        <body>
          <Main />
          {hydrationScript}
          <NextScript />
          <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "47f96ee94a8d478d9b600fdc38a68bc1"}'></script>
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
