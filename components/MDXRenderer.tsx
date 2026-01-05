import {
  Heading,
  majorScale,
  Paragraph,
  Table,
  Image,
  Text,
  UnorderedList,
  ListItem,
} from "evergreen-ui";
import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";
import * as assets from "../api/assets";
import { GithubURL } from "../api/assets";
import { CodeBlock } from "./CodeBlock";

export type MDXSerialize = MDXRemoteSerializeResult<Record<string, unknown>>;

type Props = {
  repositoryHomepage: GithubURL;
  mdxSource: MDXSerialize;
};

const markdownComponents = (repositoryHomepage: assets.GithubURL) => ({
  table: (props: React.ComponentProps<any>) => (
    <Table>{props.children}</Table>
  ),
  thead: (props: React.ComponentProps<any>) => (
    <Table.Head>
      {props.children.props.children.map((c: React.ComponentProps<any>) => (
        <Table.TextHeaderCell key={c.props.children}>
          {c.props.children}
        </Table.TextHeaderCell>
      ))}
    </Table.Head>
  ),
  img: (props: React.ComponentProps<any>) =>
    pipe(
      props.src,
      assets.fromGithub(repositoryHomepage),
      either.fold(
        () => (
          <Image {...props} src={props.src} maxWidth="100%" display="block" />
        ),
        (src) => <Image {...props} src={src} maxWidth="100%" display="block" />
      )
    ),
  tbody: (props: React.ComponentProps<any>) => (
    <Table.Body>{props.children}</Table.Body>
  ),
  td: (props: React.ComponentProps<any>) => (
    <Table.Cell>
      <Text>{props.children}</Text>
    </Table.Cell>
  ),
  tr: (props: React.ComponentProps<any>) => (
    <Table.Row>{props.children}</Table.Row>
  ),
  h1: (props: React.ComponentProps<any>) => (
    <Heading
      marginTop={majorScale(4)}
      marginBottom={majorScale(2)}
      is="h1"
      size={900}
    >
      {props.children}
    </Heading>
  ),
  h2: (props: React.ComponentProps<any>) => (
    <Heading
      marginTop={majorScale(4)}
      marginBottom={majorScale(2)}
      is="h2"
      size={800}
    >
      {props.children}
    </Heading>
  ),
  h3: (props: React.ComponentProps<any>) => (
    <Heading
      marginTop={majorScale(4)}
      marginBottom={majorScale(2)}
      is="h3"
      size={700}
    >
      {props.children}
    </Heading>
  ),
  h4: (props: React.ComponentProps<any>) => (
    <Heading
      marginTop={majorScale(2)}
      marginBottom={majorScale(2)}
      is="h4"
      size={600}
    >
      {props.children}
    </Heading>
  ),
  h5: (props: React.ComponentProps<any>) => (
    <Heading
      marginTop={majorScale(4)}
      marginBottom={majorScale(2)}
      is="h5"
      size={400}
    >
      {props}
    </Heading>
  ),
  h6: (props: React.ComponentProps<any>) => (
    <Heading
      marginTop={majorScale(4)}
      marginBottom={majorScale(2)}
      is="h6"
      size={300}
    >
      {props.children}
    </Heading>
  ),
  p: (props: React.ComponentProps<any>) => (
    <Paragraph
      size={500}
      marginTop={majorScale(2)}
      marginBottom={majorScale(2)}
      is="div"
    >
      {props.children}
    </Paragraph>
  ),
  code: (props: React.ComponentProps<any>) => {
    // The `code` component can be used for single-line or multi-line code blocks. Determine which to use.
    // Usually multi-line blocks are wrapped in `pre` and are handled that way instead of this.
    // className will exist if this is a code block and the syntax language is defined.
    if (props.className) {
      return defaultCodeBlock(String(props.children));
    }
    return (<CodeBlock variant="inline" content={String(props.children)}  />);
  },
  pre: (props: React.ComponentProps<any>) => {
    // The <pre> block is how multi-line code-blocks are rendered. This unpacks it and renders it appopriately.
    // Ensure we have exactly one child:
    if (!props.children) {
      return null; // No child --> render nothing
    }

    const child = React.Children.only(props.children);

    // Check if the child is a function that makes a <code> element:
    if ( React.isValidElement(child) && typeof child.type === "function" && (child.type as Function).name === "code" ) {
      const codeChildrenProps: React.ComponentProps<any> = child.props;
      return defaultCodeBlock(String(codeChildrenProps.children || "")); // Fall back to empty string if there is no code.
    }
    // If there is no <code> child, return null. There should be a child <code> element.
    return null;
  },
  span: (props: React.ComponentProps<any>) => (
    <Text display="flex">{props.children}</Text>
  ),
  ul: (props: React.ComponentProps<any>) => (
    <UnorderedList>{props.children}</UnorderedList>
  ),
  li: (props: React.ComponentProps<any>) => (
    <ListItem>{props.children}</ListItem>
  ),
});

/**
 * Multiple components can create a Default CodeBlock component, so define it only once:
 */
const defaultCodeBlock = (codeContent: string) => {
  return <CodeBlock variant="default" content={codeContent} showCopyButton />;
}

export const MDXRenderer = (props: Props) => (
  <MDXRemote
    {...props.mdxSource}
    components={markdownComponents(props.repositoryHomepage)}
  />
);
