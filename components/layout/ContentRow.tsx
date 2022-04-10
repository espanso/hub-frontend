import { ComponentProps } from "react";
import { majorScale, Pane } from "evergreen-ui";

type Props = ComponentProps<typeof Pane> & {
  children: JSX.Element;
};

export const ContentRow = (props: Props) => (
  <Pane display="flex" flexDirection="column" alignItems="center" {...props}>
    <Pane display="flex" flexDirection="column" width={majorScale(160)}>
      {props.children}
    </Pane>
  </Pane>
);
