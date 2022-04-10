import { Link, Pane, majorScale, Heading, Image, Text } from "evergreen-ui";
import router from "next/router";
import { espansoTheme } from "./EspansoThemeProvider";
import { Stack } from "./layout";

type FooterLinkProps = {
  children: React.ReactNode;
  href: string;
  external?: boolean;
  iconPath?: string;
};

const FooterLink = (props: FooterLinkProps) => (
  <Link
    href={props.href}
    target={props.external ? "_blank" : undefined}
    className="link-white-override"
  >
    {props.iconPath ? (
      <Stack units={1} alignItems="center">
        <Image src={props.iconPath} display="inline-block" height={20} />
        {props.children}
      </Stack>
    ) : (
      props.children
    )}
  </Link>
);

export const Footer = () => (
  <Pane
    display="flex"
    flexGrow={1}
    paddingTop={majorScale(8)}
    paddingBottom={majorScale(32)}
  >
    <Pane
      flexGrow={1}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Image
        height={30}
        width={172}
        src="/images/navbar_logo.svg"
        alt="Espanso Hub"
        className="clickable"
        onClick={() => router.push("/")}
      />
      <Stack units={1}>
        <Text color={espansoTheme.colors.gray400}>Made with ❤️</Text>
        <Text color={espansoTheme.colors.gray400}>by️</Text>
        <Link
          href="https://www.matteopellegrino.me/"
          target="_blank"
          className="link-pelle"
        >
          Matteo Pellegrino
        </Link>
      </Stack>
    </Pane>
    <Stack flexGrow={1} units={1} direction="column">
      <Heading
        size={500}
        color={espansoTheme.colors.white}
        paddingBottom={majorScale(2)}
      >
        Navigation
      </Heading>
      <FooterLink href="https://espanso.org/docs/get-started/" external>
        Documetation
      </FooterLink>
      <FooterLink
        href="https://espanso.org/docs/next/packages/creating-a-package/"
        external
      >
        Create Package
      </FooterLink>
      <FooterLink href="/search">Explore</FooterLink>
    </Stack>
    <Stack flexGrow={1} units={1} direction="column">
      <Heading
        size={500}
        color={espansoTheme.colors.white}
        paddingBottom={majorScale(2)}
      >
        Community
      </Heading>
      <FooterLink
        href="https://www.reddit.com/r/espanso/"
        external
        iconPath="/images/reddit_logo.svg"
      >
        Reddit
      </FooterLink>

      <FooterLink
        href="https://github.com/espanso/hub-frontend/"
        external
        iconPath="/images/github_logo.png"
      >
        Contribute
      </FooterLink>

      <FooterLink
        href="https://espanso.org"
        external
        iconPath="/images/espanso_logo.svg"
      >
        Espanso
      </FooterLink>
    </Stack>
  </Pane>
);
