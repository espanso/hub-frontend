import { Pane } from "evergreen-ui";
import { option } from "fp-ts";
import { flow } from "fp-ts/function";
import { usePackageSearch } from "../api/search";
import { ContentRow, Navbar } from "../components";

const Index = () => {
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500">
        <Navbar onSearchEnter={flow(option.of, packageSearch.setQuery)} />
      </ContentRow>
    </Pane>
  );
};

export default Index;
