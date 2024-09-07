import { Pane, majorScale, Text, HeartIcon, Color } from "evergreen-ui";
import { array } from "fp-ts";
import { pipe } from "fp-ts/function";
import router from "next/router";
import { Stack } from "./layout";
import { useResponsive } from "./layout/useResponsive";
import Image from "next/image";
import navbarLogo from "../public/images/navbar_logo.svg";
import notOptimizedImageLoader from "../api/notOptimizedImageLoader";
import { NextjsLink } from "./NextjsLink";

type Props = Pick<React.ComponentProps<typeof Text>, "color"> & {
  showAuthor?: boolean;
};

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const links: Array<FooterLink> = [
  {
    href: "https://espanso.org/docs/get-started/",
    label: "Documentation",
    external: true,
  },
  {
    href: "https://espanso.org/docs/next/packages/creating-a-package/",
    label: "Create Package",
    external: true,
  },
  {
    href: "/search",
    label: "Explore",
  },
  {
    href: "https://github.com/espanso/hub-frontend/",
    label: "Contribute",
    external: true,
  },
  {
    href: "https://espanso.org",
    label: "Espanso",
    external: true,
  },
  {
    href: "https://www.reddit.com/r/espanso/",
    label: "Reddit",
    external: true,
  },
];

export const Footer = (props: Props) => {
  const { foldDevices } = useResponsive();

  const makeLink = (link: FooterLink) => (
    <NextjsLink
      href={link.href}
      className="link-white-override"
      external={link.external}
    >
      {link.label}
    </NextjsLink>
  );

  const makeDesktopContent = (links: Array<FooterLink>) => (
    <Pane
      display="flex"
      flex={1}
      justifyContent="space-between"
      alignItems="center"
    >
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
      {pipe(
        links,
        array.map((l) => (
          <Pane key={l.href} paddingRight={majorScale(3)}>
            {makeLink(l)}
          </Pane>
        ))
      )}
    </Pane>
  );

  const makeMobileContent = (links: Array<FooterLink>) => (
    <Stack units={2} direction="column" alignItems="center">
      <Pane
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        {pipe(
          links,
          array.map((l) => (
            <Pane key={l.href} paddingRight={majorScale(3)}>
              {makeLink(l)}
            </Pane>
          ))
        )}
      </Pane>
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
    </Stack>
  );

  return (
    <Pane
      display="flex"
      flexDirection="column"
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(2)}
    >
      {foldDevices({
        mobile: () => makeMobileContent(links),
        tablet: () => makeMobileContent(links),
        desktop: () => makeDesktopContent(links),
      })}

      <Pane paddingTop={majorScale(4)}>
        {props.showAuthor && (
          <Stack units={1} justifyContent="center">
            <Text color={props.color}>Made with</Text>
            <HeartIcon color={props.color as Color} />
            <Text color={props.color}>by</Text>
            <NextjsLink
              href="https://www.matteopellegrino.dev/"
              target="_blank"
            >
              <Text color={props.color} className="link-pelle">
                Matteo Pellegrino
              </Text>
            </NextjsLink>
          </Stack>
        )}
      </Pane>
    </Pane>
  );
};
