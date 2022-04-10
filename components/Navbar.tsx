import {
  IconButton,
  IconButtonAppearance,
  Link,
  majorScale,
  Menu,
  MenuIcon,
  Pane,
  Popover,
  Position,
  SearchInput,
  Strong,
  TextInputAppearance,
} from "evergreen-ui";
import { useState } from "react";
import { Stack } from "./layout";
import Image from "next/image";
import { useRouter } from "next/router";
import { useResponsive } from "./layout/useResponsive";
import { pipe } from "fp-ts/function";
import { array } from "fp-ts";

const NavbarLink = (props: {
  href: string;
  children: React.ReactNode;
  color?: string;
}) => (
  <Link href={props.href} display="flex" alignItems="center">
    <Strong size={400} color={props.color}>
      {props.children}
    </Strong>
  </Link>
);

type Props = {
  searchInitialValue?: string;
  onSearchEnter?: (value: string) => unknown;
};

export const Navbar = (props: Props) => {
  const router = useRouter();
  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (props.onSearchEnter && event.currentTarget.value !== undefined) {
        props.onSearchEnter(event.currentTarget.value);
      }
    }
  };

  const [searchValue, setSearchValue] = useState(props.searchInitialValue);
  const { foldDevices } = useResponsive();

  const searchInput = (
    <SearchInput
      // evergreen doesn't infer user defined appearance type
      appearance={"navbar" as TextInputAppearance}
      placeholder="Search for wonderful packages!"
      onKeyDown={onEnter}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setSearchValue(e.target.value)
      }
      value={searchValue}
    />
  );

  const makeLinks = (color?: string) => [
    <NavbarLink href="/search" color={color}>
      Explore
    </NavbarLink>,
    <NavbarLink
      href="https://espanso.org/docs/next/packages/creating-a-package/"
      color={color}
    >
      Create a package
    </NavbarLink>,
    <NavbarLink href="https://espanso.org/" color={color}>
      Espanso
    </NavbarLink>,
  ];

  const logoDesktop = (
    <Image
      height={30}
      width={172}
      src="/images/navbar_logo.svg"
      alt="Espanso Hub"
      className="clickable"
      onClick={() => router.push("/")}
    />
  );

  const logoMobile = (
    <Image
      height={30}
      width={30}
      src="/images/navbar_logo_mobile.svg"
      alt="Espanso Hub"
      className="clickable"
      onClick={() => router.push("/")}
    />
  );

  const hamburgerMenu = (
    <Popover
      position={Position.BOTTOM_LEFT}
      content={
        <Menu>
          <Menu.Group>
            {pipe(
              makeLinks(),
              array.map((l) => <Menu.Item>{l}</Menu.Item>)
            )}
          </Menu.Group>
        </Menu>
      }
    >
      <MenuIcon color="white" />
    </Popover>
  );

  return (
    <Pane
      display="flex"
      flexDirection="column"
      background="green500"
      height={majorScale(8)}
      justifyContent="center"
    >
      {foldDevices({
        mobile: () => (
          <Stack units={2} display="flex">
            {logoMobile}
            {searchInput}
            <Pane
              display="flex"
              flex={1}
              alignItems="center"
              justifyContent="center"
            >
              {hamburgerMenu}
            </Pane>
          </Stack>
        ),
        tablet: () => (
          <Pane display="flex">
            <Stack units={2} display="flex" flex={1} alignItems="center">
              {logoMobile}
              {searchInput}
            </Stack>
            <Stack units={4} display="flex" alignContent="center">
              {makeLinks("white")}
            </Stack>
          </Pane>
        ),
        desktop: () => (
          <Pane display="flex">
            <Stack units={2} display="flex" flex={1} alignItems="center">
              {logoDesktop}
              {searchInput}
            </Stack>
            <Stack units={4} display="flex" alignContent="center">
              {makeLinks("white")}
            </Stack>
          </Pane>
        ),
      })}
    </Pane>
  );
};
