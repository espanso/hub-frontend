import {
  Card,
  Code,
  DuplicateIcon,
  IconButton,
  majorScale,
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

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("plaintext", plaintext);

type Props = {
  content: string;
  showCopyButton?: boolean;
  syntax?: "yaml" | "shell" | "plaintext";
};

export const CodeBlock = (props: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const language = props.syntax || "plaintext";

  return (
    <Card
      display="flex"
      background="default"
      alignItems="center"
      padding={majorScale(1)}
      elevation={2}
    >
      <Code
        flex={1}
        size={400}
        appearance="minimal"
        color={language === "yaml" ? "#98c379" : "white"} // hljs yaml does not parse curly brackets
        style={{ whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{
          __html: hljs.highlight(props.content, {
            language,
          }).value,
        }}
      />
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
  );
};
