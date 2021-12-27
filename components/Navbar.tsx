import { Link, majorScale, Pane, SearchInput, Strong } from "evergreen-ui";
import { useState } from "react";
import { Stack } from "./layout";

const NavbarLink = (props: { href: string; children: React.ReactNode }) => (
  <Link href={props.href} display="flex" alignItems="center">
    <Strong size={400} color="white">
      {props.children}
    </Strong>
  </Link>
);

type Props = {
  searchInitialValue?: string;
};

export const Navbar = (props: Props) => {
  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      window.location.href = `/search?q=${event.currentTarget.value}`;
    }
  };

  const [searchValue, setSearchValue] = useState(props.searchInitialValue);
  return (
    <Pane
      display="flex"
      flexDirection="column"
      background="green500"
      height={majorScale(8)}
      justifyContent="center"
    >
      <Pane display="flex">
        <Pane display="flex" flex={1}>
          <SearchInput
            placeholder="Search for wonderful packages!"
            onKeyDown={onEnter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
            value={searchValue}
          />
        </Pane>
        <Stack units={4} display="flex" alignContent="center">
          <NavbarLink href="/search">Explore</NavbarLink>
          <NavbarLink href="https://espanso.org/">Create a package</NavbarLink>
          <NavbarLink href="https://espanso.org/docs/packages/#creating-a-package">
            Espanso
          </NavbarLink>
        </Stack>
      </Pane>
    </Pane>
  );
};