import {
  Card,
  DuplicateIcon,
  IconButton,
  Code,
  majorScale,
  Popover,
  Pane,
  Text,
  Position,
  TickIcon,
} from "evergreen-ui";
import { useState } from "react";

type Props = {
  content: string;
  showCopyButton?: boolean;
};

export const CodeBlock = (props: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Card
      display="flex"
      background="default"
      alignItems="center"
      minHeight={majorScale(5)}
      padding={majorScale(1)}
      elevation={2}
      marginTop={majorScale(2)}
      marginBottom={majorScale(2)}
    >
      <Code
        flex={1}
        size={400}
        appearance="minimal"
        color="white"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {props.content}
      </Code>
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
