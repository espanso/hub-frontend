import {
  Card,
  Code,
  DuplicateIcon,
  IconButton,
  majorScale,
  minorScale,
  Pane,
  Popover,
  Position,
  Text,
  TickIcon,
} from "evergreen-ui";
import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";
import shell from "highlight.js/lib/languages/shell";
import plaintext from "highlight.js/lib/languages/plaintext";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import { useState } from "react";
import { pipe } from "fp-ts/function";
import { readonlyNonEmptyArray as rnea} from "fp-ts";
import { Children } from "react"
import { espansoTheme } from "./EspansoThemeProvider";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("plaintext", plaintext);

export type CodeBlockVariant = "default" | "inline" | "incremental"

type CommonProps = {
  variant: CodeBlockVariant
  syntax?: "yaml" | "shell" | "plaintext";
} 

const makeBlock = (inline: boolean, language: string = "yaml") => (content: string) =>
  <Code
    flex={inline ? 0 : 1}
    size={400}
    appearance="minimal"
    color={language === "yaml" ? "#98c379" : "white"}
    style={{ whiteSpace: "pre-wrap" }}
    dangerouslySetInnerHTML={{
      __html: hljs.highlight(content, {language}).value,
    }}
  />

type  DefaultCodeBlockProps = CommonProps & {
  variant: "default"
  content: string;
  showCopyButton?: boolean
}

const DefaultCodeBlock = (props: DefaultCodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);

  return <Card
    display="flex"
    background="default"
    alignItems="center"
    padding={majorScale(1)}
    elevation={2} >
      {pipe(props.content, makeBlock(false, props.syntax))}
      {props.showCopyButton && (
        <Popover
          position={Position.TOP_RIGHT}
          onOpen={() => navigator.clipboard.writeText(props.content)}
          onOpenComplete={() => setIsCopied(true)}
          onCloseComplete={() => setIsCopied(false)}
          content={
            <Pane
              height={majorScale(5)}
              display="flex"
              background="gray800"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white">Copied to clipboard</Text>
            </Pane>
          }
        >
          {isCopied ? (
            <IconButton
              appearance="minimal"
              icon={<TickIcon color="success" />}
              disabled
            />
          ) : (
            <IconButton
              appearance="minimal"
              icon={<DuplicateIcon color="white" />}
            />
          )}
        </Popover>
      )}
    </Card>
}

type  InlineCodeBlockProps = CommonProps & {
  variant: "inline"
  content: string;
} 

const InlineCodeBlock = (props: InlineCodeBlockProps) => (
  <Card
    display="inline"
    background="muted"
    alignItems="center"
    padding={minorScale(1)}
    elevation={0}
  >
      {pipe(props.content, makeBlock(true, props.syntax))}
  </Card>
);

type IncrementalCodeBlockProps = CommonProps & {
  variant: "incremental"
  content: rnea.ReadonlyNonEmptyArray<string>
}

const IncrementalCodeBlock = (props: IncrementalCodeBlockProps) => {
  const [showUpToIndex, setShowUpToIndex] = useState(1);
  const contentToBeShown = pipe(
    props.content,
    rnea.splitAt(showUpToIndex),
    x => x[0]
  )
  
  return (<Card
    display="flex"
    background="default"
    flexDirection="column"
    padding={majorScale(1)}
    elevation={2} >
      {pipe(
        contentToBeShown,
        rnea.map(makeBlock(false, props.syntax)),
        Children.toArray
      )}

      {showUpToIndex < props.content.length - 1 && 
        <Text
          onClick={() => setShowUpToIndex(showUpToIndex + 1)}
          textAlign="center"
          borderTop="solid"
          borderWidth={1}
          borderColor={espansoTheme.colors.gray700}
          size={300}
          color={espansoTheme.colors.gray500} 
          marginTop={majorScale(1)}
          padding={majorScale(1)} 
          className="clickable">
            Show more
        </Text>}
  </Card>)
}

type Props = DefaultCodeBlockProps | InlineCodeBlockProps | IncrementalCodeBlockProps

const foldCodeBlockProps: <A>(match: {
  default: (p: DefaultCodeBlockProps) => A,
  inline: (p: InlineCodeBlockProps) => A,
  incremental: (p: IncrementalCodeBlockProps) => A,
}) => (props: Props) => A = (m) => (p) => {
  switch(p.variant) {
    case "default":
      return m.default(p);
    case "inline":
      return m.inline(p);
    case "incremental":
      return m.incremental(p);
  }
}

export const CodeBlock = (props: Props) => pipe(
  props,
  foldCodeBlockProps({
    default: (p) => <DefaultCodeBlock {...p}/>,
    inline: (p) => <InlineCodeBlock {...p}/>,
    incremental: (p) => <IncrementalCodeBlock {...p}/>
  })
)
