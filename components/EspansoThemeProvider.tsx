import deepmerge from "deepmerge";
import { defaultTheme, ThemeProvider } from "evergreen-ui";

// https://evergreen.segment.com/introduction/theming

const espansoColors = {
  // https://maketintsandshades.com/#00a595
  green25: "#e6f6f4",
  green100: "#ccedea",
  green200: "#99dbd5",
  green300: "#66c9bf",
  green400: "#33b7aa",
  green500: "#00a595",
  green600: "#008477",
  green700: "#006359",
  green800: "#00423c",
  green900: "#00211e",
};

const espansoTheme = deepmerge(defaultTheme, {
  colors: {
    ...espansoColors,
  },
  components: {
    Tab: {
      appearances: {
        secondary: {
          borderRadius: 0,
          _focus: {},
          _hover: {
            backgroundColor: "trasparent",
          },
          _current: {
            backgroundColor: "trasparent",
            color: espansoColors.green500,
            borderBottom: `2px solid ${espansoColors.green500}`,
          },
        },
      },
    },
    Button: {
      appearances: {
        minimal: {
          backgroundColor: "transparent",
          _hover: {
            backgroundColor: "trasparent",
          },
          _active: {
            backgroundColor: "trasparent",
          },
        },
      },
    },
  },
});

export const EspansoThemeProvider = ({
  children,
}: {
  children: JSX.Element;
}) => <ThemeProvider value={espansoTheme}>{children}</ThemeProvider>;
