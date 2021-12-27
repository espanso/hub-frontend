import { AppProps } from "next/app";
import { EspansoThemeProvider } from "../components";
import "./index.css";
import "./reset.css";

const EspansoHub = ({ Component, pageProps }: AppProps) => {
  return (
    <EspansoThemeProvider>
      <Component {...pageProps} />
    </EspansoThemeProvider>
  );
};

export default EspansoHub;
