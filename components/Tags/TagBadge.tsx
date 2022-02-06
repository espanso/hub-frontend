import { Badge, majorScale } from "evergreen-ui";
import { ForwardedRef, forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => unknown;
};

export const TagBadge = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLElement>) => (
    <Badge
      ref={ref}
      color="neutral"
      isInteractive
      {...props}
      onClick={props.onClick}
    >
      {props.children}
    </Badge>
  )
);
