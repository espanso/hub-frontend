import { Heading, Paragraph, Code, Table, majorScale } from "evergreen-ui";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

type Props = {
  content: string;
};

export const Markdown = (props: Props) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
    components={{
      h1: (props) => (
        <Heading
          marginTop={majorScale(4)}
          marginBottom={majorScale(2)}
          is="h1"
          size={400}
        >
          {props.children}
        </Heading>
      ),
      h2: (props) => (
        <Heading
          marginTop={majorScale(4)}
          marginBottom={majorScale(2)}
          is="h2"
          size={500}
        >
          {props.children}
        </Heading>
      ),
      h3: (props) => (
        <Heading
          marginTop={majorScale(4)}
          marginBottom={majorScale(2)}
          is="h3"
          size={600}
        >
          {props.children}
        </Heading>
      ),
      h4: (props) => (
        <Heading
          marginTop={majorScale(2)}
          marginBottom={majorScale(2)}
          is="h4"
          size={700}
        >
          {props.children}
        </Heading>
      ),
      h5: (props) => (
        <Heading
          marginTop={majorScale(4)}
          marginBottom={majorScale(2)}
          is="h5"
          size={800}
        >
          {props}
        </Heading>
      ),
      h6: (props) => (
        <Heading
          marginTop={majorScale(4)}
          marginBottom={majorScale(2)}
          is="h6"
          size={900}
        >
          {props.children}
        </Heading>
      ),
      p: (props) => <Paragraph size={500}>{props.children}</Paragraph>,
      code: (props) =>
        props.inline ? (
          <Code>{props.children}</Code>
        ) : (
          <CodeBlock content={String(props.children)} showCopyButton />
        ),
      table: (props) => <Table>{props.children}</Table>,
      thead: (props) => <Table.Head>{props.children}</Table.Head>,
      tbody: (props) => <Table.Body>{props.children}</Table.Body>,
      tr: (props) =>
        props.isHeader ? (
          <>{props.children}</>
        ) : (
          <Table.Row>{props.children}</Table.Row>
        ),
      th: (props) => <Table.TextCell>{props.children}</Table.TextCell>,
      td: (props) => <Table.TextCell>{props.children}</Table.TextCell>,
    }}
  >
    {props.content}
  </ReactMarkdown>
);
