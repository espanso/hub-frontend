import { majorScale, Pane } from "evergreen-ui";
import { array } from "fp-ts";
import { pipe } from "fp-ts/function";
import { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

type Direction = "row" | "column";

type Props = React.ComponentProps<typeof Pane> & {
  units: number;
  direction?: Direction;
};

const space_placeholder = `space_placeholder_ffea129a-cad3-40dd-8c95-5b5e3c4e0925`;

export const Stack = (props: Props) => {
  const direction: Direction = props.direction || "row";
  const spaceProps = {
    [direction === "row" ? "width" : "height"]: majorScale(props.units),
  };

  return (
    <Pane {...props} display="flex" flexDirection={direction}>
      {pipe(
        Array.isArray(props.children) ? props.children : [props.children],
        array.filter(
          (item: ReactNode) =>
            item !== null && item !== undefined && item !== false
        ),
        array.intersperse(space_placeholder),
        array.map((item: ReactNode) =>
          item === space_placeholder ? (
            <Pane key={uuidv4()} {...spaceProps} />
          ) : (
            item
          )
        )
      )}
    </Pane>
  );
};
