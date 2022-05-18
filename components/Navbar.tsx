import {
  Button,
  ButtonAppearance,
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
import { array } from "fp-ts";
import { constant, pipe } from "fp-ts/function";
import { useRouter } from "next/router";
import { useState } from "react";
import { espansoTheme } from ".";
import { Stack } from "./layout";
import { useResponsive } from "./layout/useResponsive";
import Image from "next/image";
import navbarLogo from "../public/images/navbar_logo.svg";
import navbarLogoMobile from "../public/images/navbar_logo_mobile.svg";
import notOptimizedImageLoader from "../api/notOptimizedImageLoader";
import { NextjsLink } from "./NextjsLink";

type NavbarVariant = "default" | "landing";

type Props = {
  searchInitialValue?: string;
  variant?: NavbarVariant;
  onSearchEnter?: (value: string) => unknown;
};

const foldVariant: <T>(match: {
  default: () => T;
  landing: () => T;
}) => (variant: NavbarVariant) => T = (match) => (variant) => {
  switch (variant) {
    case "default":
      return match.default();
    case "landing":
      return match.landing();
  }
};

export const Navbar = (props: Props) => {
  const variant: NavbarVariant = props.variant ?? "default";
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
  const { device, foldDevices } = useResponsive();
  const isDesktop = device === "desktop";

  const NavbarLink = (props: {
    href: string;
    children: React.ReactNode;
    color?: string;
  }) => (
    <Pane display="flex" alignItems="center">
      <NextjsLink href={props.href}>
        <Strong size={400} color={props.color}>
          {props.children}
        </Strong>
      </NextjsLink>
    </Pane>
  );

  const NavbarLinkCTA = (props: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Button
      appearance={"navbar" as ButtonAppearance}
      size="large"
      width={isDesktop ? 160 : "auto"}
      onClick={() => router.push(props.href)}
    >
      <Strong size={400} color="inherit">
        {props.children}
      </Strong>
    </Button>
  );

  const makeSearchInput = (widthPerc?: string) => (
    <SearchInput
      // evergreen doesn't infer user defined appearance type
      appearance={"navbar" as TextInputAppearance}
      placeholder="Search for wonderful packages!"
      onKeyDown={onEnter}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setSearchValue(e.target.value)
      }
      value={searchValue}
      width={widthPerc}
    />
  );

  const makeLinks = (color?: string) => [
    <NavbarLink
      href="https://espanso.org/docs/get-started/"
      color={color}
      key="/docs"
    >
      Documentation
    </NavbarLink>,
    <NavbarLink
      href="https://espanso.org/docs/next/packages/creating-a-package/"
      color={color}
      key="/createapackage"
    >
      Create Package
    </NavbarLink>,
    isDesktop ? (
      <NavbarLinkCTA href="/search" key="/search">
        Explore
      </NavbarLinkCTA>
    ) : (
      <NavbarLink href="/search" key="/search">
        Explore
      </NavbarLink>
    ),
  ];

  const logoDesktop = (
    <Image
      height={30}
      width={172}
      src={navbarLogo}
      loader={notOptimizedImageLoader}
      unoptimized
      alt="Espanso Hub"
      className="clickable"
      onClick={() => router.push("/")}
    />
  );

  const logoMobile = (
    <Image
      height={30}
      width={30}
      src={navbarLogoMobile}
      loader={notOptimizedImageLoader}
      unoptimized
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
              array.map((l) => (
                <Menu.Item key={`${l.key}-menu-item`}>{l}</Menu.Item>
              ))
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
      background={pipe(
        variant,
        foldVariant({
          default: constant(espansoTheme.colors.green500),
          landing: constant("transparent"),
        })
      )}
      height={majorScale(8)}
      justifyContent="center"
    >
      {foldDevices({
        mobile: () => (
          <Stack units={2} display="flex" alignItems="center">
            {logoMobile}
            {pipe(
              variant,
              foldVariant({
                default: () => makeSearchInput("100%"),
                landing: () => <Pane flex={1} />,
              })
            )}
            {hamburgerMenu}
          </Stack>
        ),
        tablet: () => (
          <Pane display="flex">
            <Stack units={2} display="flex" flex={1} alignItems="center">
              {logoMobile}
              {makeSearchInput()}
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
              {pipe(
                variant,
                foldVariant({
                  default: makeSearchInput,
                  landing: constant(<></>),
                })
              )}
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
