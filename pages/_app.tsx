import "./reset.css";
import { EspansoThemeProvider } from "../components";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <EspansoThemeProvider>
    <Component {...pageProps} />
  </EspansoThemeProvider>
);

export default App;
