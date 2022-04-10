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

// Default Theme definition https://github.com/segmentio/evergreen/blob/master/src/themes/default
const espansoTheme = deepmerge(defaultTheme, {
  colors: {
    ...espansoColors,
  },
  components: {
    Tab: {
      appearances: {
        primary: {
          _before: {
            backgroundColor: espansoColors.green500,
          },

          _current: {
            color: espansoColors.green500,

            "&:before": {
              transform: "scaleY(1)",
            },

            "&:focus": {
              color: espansoColors.green500,
            },
          },
        },
        secondary: {
          _current: {
            borderRadius: 2,
            borderLeft: `2px solid ${espansoColors.green500}`,
            backgroundColor: espansoColors.green25,
            color: espansoColors.green500,
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
