import { Link } from "evergreen-ui";
import { default as NextLink } from "next/link";

type Props = React.ComponentProps<typeof Link> & {
  href: string;
  external?: boolean;
  children: React.ReactNode;
};

export const NextjsLink = (props: Props) => {
  const { href, external, ...linkProps } = props;
  return (
    <NextLink href={href} passHref={true}>
      <Link target={external ? "_blank" : "_self"} {...linkProps}>
        {props.children}
      </Link>
    </NextLink>
  );
};
