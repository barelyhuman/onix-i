// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'
import { extractCss } from 'goober'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" type="image/png" href="/logo.png"></link>

        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <link rel="manifest" href="/manifest.json"></link>

        <Script type="module">
          import 'https://cdn.jsdelivr.net/npm/@pwabuilder/pwaupdate'; const el
          = document.createElement('pwa-update'); document.body.appendChild(el);
        </Script>

        <style id="_goober">{extractCss()}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
