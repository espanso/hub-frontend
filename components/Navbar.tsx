import { Link, majorScale, Pane, SearchInput, Strong } from "evergreen-ui";
import { ContentRow, Stack } from "./layout";

const NavbarLink = (props: { href: string; children: React.ReactNode }) => (
  <Link href="#" display="flex" alignItems="center">
    <Strong size={400} color="white">
      {props.children}
    </Strong>
  </Link>
);

export const Navbar = () => {
  return (
    <Pane display="flex" flexDirection="column" background="green500">
      <ContentRow marginTop={majorScale(2)} marginBottom={majorScale(2)}>
        <Pane display="flex">
          <Pane display="flex" flex={1}>
            <SearchInput placeholder="Search for wonderful packages!" />
          </Pane>
          <Stack units={4} display="flex" alignContent="center">
            <NavbarLink href="#">Explore</NavbarLink>
            <NavbarLink href="#">Create a package</NavbarLink>
            <NavbarLink href="#">Espanso</NavbarLink>
          </Stack>
        </Pane>
      </ContentRow>
    </Pane>
  );
};
