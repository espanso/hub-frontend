import { Checkbox, ChevronDownIcon, Link, Pane, Text } from "evergreen-ui";
import { array, option } from "fp-ts";
import { constant, pipe } from "fp-ts/function";
import { useEffect, useState } from "react";
import { Stack } from ".";

export type CheckboxItem = {
  key: string;
  label: string;
  checked: boolean;
};

type Props = {
  title: string;
  items: Array<CheckboxItem>;
  onChange: (items: Array<CheckboxItem>, lastUpdated: string) => unknown;
  limit?: number;
};

export const CheckboxGroup = (props: Props) => {
  const [checks, setChecks] = useState(props.items);
  const [limit, setLimit] = useState(pipe(props.limit, option.fromNullable));
  const indexByKey: Record<string, number> = pipe(
    checks,
    array.reduceWithIndex({}, (i, acc, curr) => ({ ...acc, [curr.key]: i }))
  );

  useEffect(() => setChecks(props.items), [props.items]);
  useEffect(
    () => setLimit(pipe(props.limit, option.fromNullable)),
    [props.limit]
  );

  const checkBoxes = pipe(
    checks,
    array.map((item) => (
      <Checkbox
        key={item.key}
        id={item.key}
        label={
          <Text textTransform="capitalize" alignSelf="center">
            {item.label}
          </Text>
        }
        checked={item.checked}
        onChange={(e) => {
          const newChecks = pipe(
            checks,
            array.modifyAt(indexByKey[item.key], (elem: CheckboxItem) => ({
              ...elem,
              checked: e.target.checked,
            })),
            option.getOrElse(constant(checks))
          );
          setChecks(newChecks);
          props.onChange(newChecks, item.key);
        }}
      />
    ))
  );

  return (
    <Pane>
      <Text size={600}>{props.title}</Text>
      {pipe(
        checkBoxes,
        array.takeLeft(
          pipe(
            limit,
            option.getOrElse(() => checkBoxes.length)
          )
        )
      )}
      {pipe(
        limit,
        option.map(() => (
          <Stack
            units={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            className="clickable"
            onClick={() => setLimit(option.none)}
          >
            <Link>More</Link>
            <ChevronDownIcon color="green500" />
          </Stack>
        )),
        option.toNullable
      )}
    </Pane>
  );
};
