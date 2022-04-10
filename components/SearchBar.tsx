import {
  majorScale,
  minorScale,
  Pane,
  SearchIcon,
  TextInput,
} from "evergreen-ui";
import { useState } from "react";
import { option } from "fp-ts";
import { pipe } from "fp-ts/function";

type Props = React.ComponentProps<typeof TextInput> & {
  onSearch: (text: string) => unknown;
};

export const SearchBar = (props: Props) => {
  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.currentTarget.value !== undefined) {
        props.onSearch(event.currentTarget.value);
      }
    }
  };

  const { width, onSearch, value, onKeyDown, ...textInputProps } = props;
  const [innerValue, setInnerValue] = useState<string>();

  return (
    <Pane
      display="flex"
      background="white"
      borderColor="gray400"
      borderRadius={minorScale(1)}
      alignItems="center"
      width={props.width}
    >
      <TextInput
        onKeyDown={onEnter}
        border="none"
        flexShrink={1}
        flexGrow={1}
        value={innerValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInnerValue(e.currentTarget.value)
        }
        {...textInputProps}
      />
      <SearchIcon
        flexBasis={majorScale(8)}
        color="muted"
        className="search-bar-icon"
        onClick={() =>
          pipe(innerValue, option.fromNullable, option.map(props.onSearch))
        }
      />
    </Pane>
  );
};
