import { Code, majorScale } from "evergreen-ui";
import { Package } from "../api/domain";
import { espansoTheme } from "./EspansoThemeProvider";

type Props = {
  package: Package;
};

export const PackageNamer = (props: Props) => (
    <Code
      paddingRight={majorScale(1)}
      appearance="minimal"
      color={espansoTheme.colors.green600}
    >
      {props.package.name}
    </Code>
);
