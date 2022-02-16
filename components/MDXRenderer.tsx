import { Heading, majorScale, Paragraph, Table, Image } from "evergreen-ui";
import { boolean } from "fp-ts";
import { pipe } from "fp-ts/function";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { CodeBlock } from "./CodeBlock";

export type MDXSerialize = MDXRemoteSerializeResult<Record<string, unknown>>;

type Props = {
  mdxSource: MDXSerialize;
};

const githubAssetMiddleware: (assetUrl: string) => string = (assetUrl) =>
  pipe(
    assetUrl.includes("github.com"),
    boolean.fold(
      () => assetUrl,
      () => assetUrl.replace("/blob/", "/raw/")
    )
  );

const markdownComponents = {
  table: Table,
  thead: (props) => (
    <Table.Head>
      {props.children.props.children.map((c) => (
        <Table.TextHeaderCell key={c.props.children}>
          {c.props.children}
        </Table.TextHeaderCell>
      ))}
    </Table.Head>
  ),
  img: (props) => (
    <Image
      {...{ ...props, src: pipe(props.src, githubAssetMiddleware) }}
      maxWidth="100%"
    />
  ),
  tbody: Table.Body,
  td: Table.TextCell,
  tr: Table.Row,
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
  p: (props) => (
    <Paragraph
      size={500}
      marginTop={majorScale(2)}
      marginBottom={majorScale(2)}
    >
      {props.children}
    </Paragraph>
  ),
  code: (props) => (
    <CodeBlock content={String(props.children)} showCopyButton />
  ),
};

export const MDXRenderer = (props: Props) => (
  <MDXRemote {...props.mdxSource} components={markdownComponents} />
);
