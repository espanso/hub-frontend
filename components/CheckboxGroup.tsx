import { Checkbox, Pane } from "evergreen-ui";
import { array, option } from "fp-ts";
import { pipe, constant } from "fp-ts/function";
import { useEffect, useState } from "react";

export type CheckboxItem = {
  key: string;
  label: string;
  checked: boolean;
};

type Props = {
  items: Array<CheckboxItem>;
  onChange: (items: Array<CheckboxItem>, lastUpdated: string) => unknown;
};

export const CheckboxGroup = (props: Props) => {
  const [checks, setChecks] = useState(props.items);
  const indexByKey: Record<string, number> = pipe(
    checks,
    array.reduceWithIndex({}, (i, acc, curr) => ({ ...acc, [curr.key]: i }))
  );

  useEffect(() => setChecks(props.items), [props.items]);

  return (
    <Pane>
      {pipe(
        checks,
        array.map((item) => (
          <Checkbox
            key={item.key}
            id={item.key}
            label={item.label}
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
      )}
    </Pane>
  );
};
