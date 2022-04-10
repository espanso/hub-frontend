import {
  Card,
  DuplicateIcon,
  IconButton,
  Code,
  majorScale,
  Popover,
  Pane,
  Text,
} from "evergreen-ui";

type Props = {
  packageName: string;
};

export const InstallPackage = (props: Props) => {
  const command: string = `espanso install ${props.packageName}`;

  return (
    <Card
      display="flex"
      background="default"
      alignItems="center"
      height={majorScale(5)}
      padding={majorScale(1)}
    >
      <Code flex={1} size={400} appearance="minimal" color="white">
        {command}
      </Code>
      <Popover
        onOpen={() => navigator.clipboard.writeText(command)}
        content={
          <Pane
            height={majorScale(5)}
            display="flex"
            background="gray800"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white">Copied!</Text>
          </Pane>
        }
      >
        <IconButton appearance="minimal" color="white" icon={DuplicateIcon} />
      </Popover>
    </Card>
  );
};
