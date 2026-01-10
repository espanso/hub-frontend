import { Check, Copy, Github, Share2, ShieldIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate } from "react-router";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { isFeatured, type Package } from "~/model/packages";
import { Header } from "../components/Header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  fetchPackageFiles,
  getPackageByName,
  getPackageByNameAndVersion,
  getVersionsForPackage,
  parseManifest,
} from "../services/packages";
import type { Route } from "./+types/package";

export async function loader({ params }: Route.LoaderArgs) {
  const { packageName, version } = params;

  // If version is provided, fetch specific version; otherwise fetch latest
  const pkg = version
    ? await getPackageByNameAndVersion(packageName, version)
    : await getPackageByName(packageName);

  return match(pkg)
    .with(null, () => {
      throw new Response(
        version ? "Package version not found" : "Package not found",
        { status: 404 },
      );
    })
    .otherwise(async (p) => {
      const versions = await getVersionsForPackage(packageName);
      const isLatest = !version || versions[0] === version;

      // Fetch the package archive files
      const files = await fetchPackageFiles(p.archive_url);

      // Extract repository home URL from _manifest.yml if available
      const repositoryHome = files["_manifest.yml"]
        ? parseManifest(files["_manifest.yml"])
        : null;

      // Add files and repositoryHome to the package object
      const packageWithFiles = {
        ...p,
        files,
        repositoryHome: repositoryHome || undefined,
      };

      return { package: packageWithFiles, versions, isLatest };
    });
}

export function meta({ data, params }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Package Not Found" }];
  }

  const title = params.version
    ? `${data.package.title} v${data.package.version} - Espanso Hub`
    : `${data.package.title} - Espanso Hub`;

  return [
    { title },
    { name: "description", content: data.package.description },
  ];
}

export default function PackageRoute({ loaderData }: Route.ComponentProps) {
  const { package: pkg, versions, isLatest } = loaderData;
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [sharecopied, setShareCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [copiedFileContent, setCopiedFileContent] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Initialize selected file from available files if not set and files are available
  useEffect(() => {
    if (selectedFile === "" && pkg.files && Object.keys(pkg.files).length > 0) {
      // Get all files excluding README.md and _manifest.yml
      const availableFiles = Object.keys(pkg.files)
        .filter(
          (fileName) => !["README.md", "_manifest.yml"].includes(fileName),
        )
        .sort();

      // Select first available file after exclusions
      if (availableFiles.length > 0) {
        setSelectedFile(availableFiles[0]);
      } else if (Object.keys(pkg.files).includes("README.md")) {
        // Fallback to README.md if no other files are available
        setSelectedFile("README.md");
      } else {
        // Last resort: use the first file whatever it is
        setSelectedFile(Object.keys(pkg.files)[0]);
      }
    }
  }, [pkg.files, selectedFile]);

  const installCommand = isLatest
    ? `espanso install ${pkg.name}`
    : `espanso install ${pkg.name} --version ${pkg.version}`;

  const copyToClipboard = async (
    text: string,
    setCopiedState: (val: boolean) => void,
  ) => {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleVersionChange = (version: string) => {
    if (version === versions[0]) {
      navigate(`/${pkg.name}`);
    } else {
      navigate(`/${pkg.name}/v/${version}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/search?t=${tag}`);
  };

  const handleShare = () => {
    const url = window.location.href;
    copyToClipboard(url, setShareCopied);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={(searchValue) => {
          navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        }}
      />

      {/* Top Content */}
      <div className="bg-white py-8">
        <div className="content-row">
          {/* Package Header */}
          <div className="space-y-4">
            {/* Title and Featured Badge */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-2 md:gap-8">
                <h1 className="text-3xl md:text-5xl font-bold">{pkg.title}</h1>
                {isFeatured(pkg) && (
                  <Badge>
                    <ShieldIcon />
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                {/* Actions Row */}
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  {sharecopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>

                {pkg.repositoryHome && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={pkg.repositoryHome}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View on GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                {/* Version Selector */}
                <Select value={pkg.version} onValueChange={handleVersionChange}>
                  <SelectTrigger className="w-[130px] md:w-auto">
                    Select version
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version} value={version}>
                        v{version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-6 mt-4">
              <div className="flex flex-1 flex-col gap-4 md:gap-5">
                {/* Package Name */}
                <p className="font-mono text-sm text-muted-foreground">
                  {pkg.name}
                </p>

                {/* Author */}
                <p className="text-sm text-muted-foreground">by {pkg.author}</p>

                {/* Description */}
                <p className="text-base leading-relaxed">{pkg.description}</p>

                {/* Tags */}
                {pkg.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pkg.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Install Box */}
              <div className="flex md:w-1/3 flex-col gap-3 md:gap-5 mt-2 md:mt-0">
                <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                  {installCommand}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => copyToClipboard(installCommand, setCopied)}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Content */}
      <Tabs
        defaultValue="description"
        className="content-row py-8 flex-1 flex flex-col"
      >
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="source">Source</TabsTrigger>
              </TabsList>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {/* Description */}
            <TabsContent value="description" className="h-full flex flex-col">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => (
                      <h1 className="text-4xl font-bold" {...props} />
                    ),
                    h2: (props) => (
                      <h2 className="text-3xl font-bold" {...props} />
                    ),
                    h3: (props) => (
                      <h3 className="text-2xl font-bold" {...props} />
                    ),
                    h4: (props) => (
                      <h4 className="text-xl font-bold" {...props} />
                    ),
                    h5: (props) => (
                      <h5 className="text-lg font-bold" {...props} />
                    ),
                    h6: (props) => (
                      <h6 className="text-md font-bold" {...props} />
                    ),
                  }}
                >
                  {pkg.files["README.md"]}
                </Markdown>
              </p>
            </TabsContent>

            {/* Source */}
            <TabsContent value="source" className="h-full flex flex-col">
              {pkg.files && Object.keys(pkg.files).length > 0 ? (
                <div className="h-full flex flex-col">
                  <div className="flex flex-col md:flex-row gap-4 h-full">
                    {/* File Selector */}
                    <div className="w-full md:w-1/4 border rounded p-2 bg-slate-50 overflow-auto h-[500px] md:h-full">
                      <h3 className="text-sm font-semibold mb-2">Files</h3>
                      <ul className="space-y-1 text-xs font-mono">
                        {Object.keys(pkg.files)
                          .filter(
                            (fileName) =>
                              !["README.md", "_manifest.yml"].includes(
                                fileName,
                              ),
                          )
                          .sort()
                          .map((fileName) => (
                            <li
                              key={fileName}
                              className={`hover:bg-slate-200 p-1 rounded cursor-pointer truncate ${selectedFile === fileName ? "bg-slate-200 font-medium" : ""}`}
                              onClick={() => setSelectedFile(fileName)}
                            >
                              {fileName}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* File Content */}
                    <div className="w-full md:w-3/4 border rounded p-2 bg-slate-50 overflow-x-auto h-[500px] md:h-full flex flex-col">
                      {selectedFile &&
                      selectedFile !== "" &&
                      pkg.files[selectedFile] ? (
                        <>
                          <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <h3 className="text-sm font-semibold truncate max-w-[80%]">
                              {selectedFile}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  pkg.files[selectedFile],
                                  setCopiedFileContent,
                                )
                              }
                              title="Copy file content"
                            >
                              {copiedFileContent ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <pre className="text-xs whitespace-pre-wrap overflow-auto flex-1 p-2">
                            {pkg.files[selectedFile]}
                          </pre>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground p-8">
                          Select a file to view its content
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  No source files available
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
