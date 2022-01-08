import { Pane, Tab, Tablist } from "evergreen-ui";
import { option } from "fp-ts";
import { zipper } from "fp-ts-contrib";
import { pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { useState } from "react";

type TabProps = {
  id: string;
  label: string;
  render: () => JSX.Element;
};

export const useTabs: (
  tabs: NonEmptyArray<TabProps>
) => [JSX.Element, JSX.Element] = (tabs) => {
  const [ztabs, setTabs] = useState(
    pipe(tabs, zipper.fromNonEmptyArray, zipper.start)
  );
  const tabList = (
    <Tablist elevation={1}>
      {pipe(
        ztabs,
        zipper.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            onSelect={() =>
              pipe(
                ztabs,
                zipper.moveByFindFirst((t) => t.id === tab.id),
                option.map(setTabs)
              )
            }
            isSelected={tab.id === ztabs.focus.id}
            aria-controls={`tab-${tab}`}
          >
            {tab.label}
          </Tab>
        )),
        zipper.toNonEmptyArray
      )}
    </Tablist>
  );

  const panels = (
    <>
      {pipe(
        ztabs,
        zipper.map((tab) => (
          <Pane
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            aria-hidden={tab.id !== ztabs.focus.id}
            display={tab.id === ztabs.focus.id ? "block" : "none"}
          >
            {tab.render()}
          </Pane>
        )),
        zipper.toNonEmptyArray
      )}
    </>
  );

  return [tabList, panels];
};
