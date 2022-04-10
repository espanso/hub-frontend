import { Checkbox, Pane } from "evergreen-ui";
import { record, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Ord } from "fp-ts/Ord";
import { useEffect, useState } from "react";

export type CheckboxItem = {
  label: string;
  checked: boolean;
};

type Props = {
  items: Record<string, CheckboxItem>;
  onChange: (
    items: Record<string, CheckboxItem>,
    lastUpdated: string
  ) => unknown;
  order?: Ord<string>;
};

export const CheckboxGroup = (props: Props) => {
  const [checks, setChecks] = useState(props.items);
  const order = props.order ?? string.Ord;

  useEffect(() => setChecks(props.items), [props.items]);

  return (
    <Pane>
      {pipe(
        checks,
        record.collect(order)((k, item) => (
          <Checkbox
            key={k}
            id={k}
            label={item.label}
            checked={item.checked}
            onChange={(e) => {
              const newChecks = {
                ...checks,
                [k]: {
                  ...item,
                  checked: e.target.checked,
                },
              };
              setChecks(newChecks);
              props.onChange(newChecks, k);
            }}
          />
        ))
      )}
    </Pane>
  );
};
