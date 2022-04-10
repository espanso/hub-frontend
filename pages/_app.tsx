import EspansoThemeProvider from "../components/EspansoThemeProvider";

const App = ({ Component, pageProps }) => (
  <EspansoThemeProvider>
    <Component {...pageProps} />
  </EspansoThemeProvider>
);

export default App;
