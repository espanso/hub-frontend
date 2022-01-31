import { majorScale, Pane } from "evergreen-ui";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof Pane> & {
  children: React.ReactNode;
};

export const ContentRow = (props: Props) => (
  <Pane display="flex" flexDirection="column" alignItems="center" {...props}>
    <Pane display="flex" flexDirection="column" className="content-row">
      {props.children}
    </Pane>
  </Pane>
);
