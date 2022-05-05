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
  table: Table,
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
  tbody: Table.Body,
  td: (props: React.ComponentProps<any>) => (
    <Table.Cell>
      <Text>{props.children}</Text>
    </Table.Cell>
  ),
  tr: Table.Row,
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
  code: (props: React.ComponentProps<any>) => (
    <CodeBlock content={String(props.children)} showCopyButton />
  ),
  inlineCode: (props: React.ComponentProps<any>) => (
    <CodeBlock content={String(props.children)} inline />
  ),
  kbd: (props: React.ComponentProps<any>) => (
    <CodeBlock content={String(props.children)} inline />
  ),
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

export const MDXRenderer = (props: Props) => (
  <MDXRemote
    {...props.mdxSource}
    components={markdownComponents(props.repositoryHomepage)}
  />
);
