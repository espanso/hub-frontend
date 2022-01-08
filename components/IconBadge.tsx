import { Badge, majorScale, Pane } from "evergreen-ui";
import { ForwardedRef, forwardRef } from "react";
import { Stack } from "./layout";

type Props = {
  text: string;
  onIconClick: () => unknown;
  icon: () => JSX.Element;
};

export const IconBadge = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLElement>) => {
    return (
      <Badge
        color="neutral"
        display="flex"
        height={majorScale(4)}
        alignItems="center"
        paddingLeft={majorScale(2)}
        paddingRight={majorScale(2)}
        ref={ref}
      >
        <Stack units={1} display="flex" alignItems="center">
          {props.text}
          <Pane
            className="icon-badge-icon"
            onClick={props.onIconClick}
            display="flex"
            alignItems="center"
          >
            {props.icon()}
          </Pane>
        </Stack>
      </Badge>
    );
  }
);
