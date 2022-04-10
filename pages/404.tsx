import { Heading, Link, Pane, Paragraph, TextInput } from "evergreen-ui";
import { option } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { useState } from "react";
import { usePackageSearch } from "../api/search";
import { ContentRow, Footer, Navbar, Stack, espansoTheme } from "../components";

const Custom404 = () => {
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.currentTarget.value !== undefined) {
        packageSearch.setQuery(option.some(event.currentTarget.value));
      }
    }
  };
  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500" elevation={2} zIndex={1}>
        <Navbar
          variant="landing"
          searchInitialValue={pipe(
            packageSearch.query,
            option.getOrElseW(() => "")
          )}
          onSearchEnter={flow(option.of, packageSearch.setQuery)}
        />
      </ContentRow>
      <Pane
        display="flex"
        minHeight="80vh"
        flexDirection="column"
        background="tint2"
      >
        <ContentRow justifyContent="center" flex={6}>
          <Stack units={2} direction="column" alignItems="center">
            <Pane display="flex">
              <Heading size={1000} color={espansoTheme.colors.gray800}>
                {" "}
                ¯\_(ツ)_/¯
              </Heading>
            </Pane>
            <Heading size={900}>404 Page not found</Heading>
            <Heading size={800} color={espansoTheme.colors.gray700}>
              The resource you are looking for is not available
            </Heading>
            <Pane elevation={2}>
              <TextInput
                width={600}
                height={50}
                placeholder="Search for wonderful packages!"
                onKeyDown={onEnter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchValue(e.target.value)
                }
                value={searchValue}
              />
            </Pane>
            <Paragraph size={600}>
              or{" "}
              <Link href="/search" size={600} textDecoration="underline">
                browse the hub
              </Link>
            </Paragraph>
          </Stack>
        </ContentRow>
        <Pane flex={4} />
      </Pane>
      <ContentRow background="green700">
        <Footer />
      </ContentRow>
    </Pane>
  );
};

export default Custom404;
