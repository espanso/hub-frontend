import { Link, Pane, majorScale, Text, HeartIcon, Color } from "evergreen-ui";
import { array } from "fp-ts";
import { pipe } from "fp-ts/function";
import router from "next/router";
import { Stack } from "./layout";
import { useResponsive } from "./layout/useResponsive";
import Image from "next/image";
import navbarLogo from "../public/images/navbar_logo.svg";

type Props = Pick<React.ComponentProps<typeof Text>, "color"> & {
  showAuthor?: boolean;
};

type FooterLink = {
  label: string;
  href: string;
  internal?: boolean;
};

const links: Array<FooterLink> = [
  {
    href: "https://espanso.org/docs/get-started/",
    label: "Documentation",
  },
  {
    href: "https://espanso.org/docs/next/packages/creating-a-package/",
    label: "Create Package",
  },
  {
    href: "/search",
    label: "Explore",
    internal: true,
  },
  {
    href: "https://github.com/espanso/hub-frontend/",
    label: "Contribute",
  },
  {
    href: "https://espanso.org",
    label: "Espanso",
  },
  {
    href: "https://www.reddit.com/r/espanso/",
    label: "Reddit",
  },
];

export const Footer = (props: Props) => {
  const { foldDevices } = useResponsive();

  const makeLink = (link: FooterLink) => (
    <Link
      className="link-white-override"
      href={link.href}
      target={link.internal ? "_self" : "_blank"}
    >
      {link.label}
    </Link>
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
            <Link href="https://www.matteopellegrino.me/" target="_blank">
              <Text color={props.color} className="link-pelle">
                Matteo Pellegrino
              </Text>
            </Link>
          </Stack>
        )}
      </Pane>
    </Pane>
  );
};
