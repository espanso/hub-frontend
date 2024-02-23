import type { AppProps } from "next/app";
import { EspansoThemeProvider } from "../components";
import "./reset.css";
import "./index.css";

const EspansoHub = ({ Component, pageProps }: AppProps) => {
  return (
    <EspansoThemeProvider>
      <Component {...pageProps} />
    </EspansoThemeProvider>
  );
};

export default EspansoHub;