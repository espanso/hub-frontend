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
  // Override primary default color
  blue25: "#e6f6f4",
  blue50: "#ccedea",
  blue100: "#b3e4df",
  blue200: "#99dbd5",
  blue300: "#66c9bf",
  blue400: "#33b7aa",
  blue500: "#00a595",
  blue600: "#008477",
  blue700: "#006359",
  blue800: "#00423c",
  blue900: "#00211e",
};

// Default Theme definition https://github.com/segmentio/evergreen/blob/master/src/themes/default
const espansoTheme = deepmerge(defaultTheme, {
  colors: {
    ...espansoColors,
  },
  components: {
    Tab: {
      appearances: {
        secondary: {
          _current: {
            borderRadius: 2,
            borderLeft: `2px solid ${espansoColors.green500}`,
            backgroundColor: espansoColors.green25,
          },
        },
      },
    },
    Input: {
      appearances: {
        navbar: {
          borderRadius: 2,
          backgroundColor: espansoColors.green100,

          _focus: {
            backgroundColor: "white",
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
        navbar: deepmerge(defaultTheme.components.Button.appearances.default, {
          color: "white",
          backgroundColor: "transparent",
          borderColor: "white",
          _hover: {
            color: espansoColors.green500,
            backgroundColor: "white",
            borderColor: "white",
          },
          _active: {
            backgroundColor: "trasparent",
          },
        }),
      },
    },
  },
});

export const EspansoThemeProvider = ({
  children,
}: {
  children: JSX.Element;
}) => <ThemeProvider value={espansoTheme}>{children}</ThemeProvider>;
