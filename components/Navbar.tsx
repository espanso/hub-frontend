import { Link, majorScale, Pane, SearchInput, Strong } from "evergreen-ui";
import { useState } from "react";
import { Stack } from "./layout";
import Image from "next/image";

const NavbarLink = (props: { href: string; children: React.ReactNode }) => (
  <Link href={props.href} display="flex" alignItems="center">
    <Strong size={400} color="white">
      {props.children}
    </Strong>
  </Link>
);

type Props = {
  searchInitialValue?: string;
  onSearchEnter?: (value: string) => unknown;
};

export const Navbar = (props: Props) => {
  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (props.onSearchEnter && event.currentTarget.value !== undefined) {
        props.onSearchEnter(event.currentTarget.value);
      }
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
        <Stack units={2} display="flex" flex={1} alignItems="center">
          <Image
            height={26}
            width={161}
            src="/images/navbar_logo.svg"
            alt="Espanso Hub"
          />
          <SearchInput
            appearance="navbar"
            placeholder="Search for wonderful packages!"
            onKeyDown={onEnter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
            value={searchValue}
          />
        </Stack>
        <Stack units={4} display="flex" alignContent="center">
          <NavbarLink href="/search">Explore</NavbarLink>
          <NavbarLink href="https://espanso.org/docs/next/packages/creating-a-package/">
            Create a package
          </NavbarLink>
          <NavbarLink href="https://espanso.org/">Espanso</NavbarLink>
        </Stack>
      </Pane>
    </Pane>
  );
};
