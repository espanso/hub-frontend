import "./reset.css";
import "./index.css";
import { EspansoThemeProvider } from "../components";
import { AppProps } from "next/app";

const EspansoHub = ({ Component, pageProps }: AppProps) => {
  return (
    <EspansoThemeProvider>
      <Component {...pageProps} />
    </EspansoThemeProvider>
  );
};

export default EspansoHub;
