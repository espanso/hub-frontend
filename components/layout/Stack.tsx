import { pipe } from "fp-ts/function";
import { array } from "fp-ts";
import { majorScale, Pane } from "evergreen-ui";

type Direction = "row" | "column";

type Props = React.ComponentProps<typeof Pane> & {
  units: number;
  direction?: Direction;
};

export const Stack = (props: Props) => {
  const direction: Direction = props.direction || "row";

  return (
    <Pane {...props} display="flex" flexDirection={direction}>
      {pipe(
        props.children,
        array.of,
        array.flatten,
        array.filter(
          (item: any) => item !== null && item !== undefined && item !== false
        ),
        array.intersperse<unknown>(
          direction == "row" ? (
            <Pane width={majorScale(props.units)} />
          ) : (
            <Pane height={majorScale(props.units)} />
          )
        )
      )}
    </Pane>
  );
};
