import { EnvelopeIcon, ExportIcon, IconButton, LinkIcon, Menu, Popover, Position, ShareIcon, toaster } from "evergreen-ui"
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { useEffect, useState } from "react";
import { Package } from "../api/domain";

type Props = {
    package: Package
}

const FEATURE_FLAG_EMAIL_LINK = false;

export const ShareButton = (props: Props) => {
    const [url, setUrl] = useState<string | undefined>(undefined);
    const [canShare, setCanShare] = useState<boolean | undefined>(undefined);

    const onClick = () => pipe(
        url,
        option.fromNullable,
        option.fold(
            () => toaster.warning("Unable to share package", {id: "toaster-share-unable"}),
            u => navigator.share({
                title: props.package.title,
                text: props.package.description,
                url: u
            })
        )
    );

    const onCopyLink = () => pipe(
        url,
        option.fromNullable,
        option.fold(
            () => toaster.warning("Unable to copy link to the clipboard", {id: "toaster-link-copy-unable"}),
            u => navigator.clipboard
                    .writeText(u)
                    .then(() => toaster.success("Link copied to the clipboard!", {
                        id: "toaster-link-copy-success"
                    }))
        )
    )

    const onEmailLink = () => pipe(
        url,
        option.fromNullable,
        option.fold(
            () => toaster.warning("Unable to share link via email", {id: "toaster-link-email-unable"}),
            u => {
                const subject = `Check out Espanso's ${props.package.title} package!`
                const body = `Hello,
I just found out "${props.package.title}", an Espanso package you might be interested into.

Check it out at ${u}
`;
                document.location = encodeURI(`mailto:?subject=${subject}&body=${body}`);
            },
        )
    )

    useEffect(() => {
        setCanShare(typeof navigator.share === "function");
        setUrl(`${window.location.hostname}${window.location.pathname}${window.location.search}`);
    }, []);

    const linkShareLayout = <Popover
        position={Position.BOTTOM_RIGHT}
        content={
        <Menu>
            <Menu.Group>
            <Menu.Item
                icon={LinkIcon} 
                onSelect={onCopyLink}>
                    Copy Link
                </Menu.Item>
            {FEATURE_FLAG_EMAIL_LINK ?? <Menu.Item 
                icon={EnvelopeIcon}
                onSelect={onEmailLink}>
                    Email Link
            </Menu.Item>}
            </Menu.Group>
        </Menu>}>   
        <IconButton icon={ExportIcon} appearance="minimal"/>
    </Popover>

    const webShareAPILayout = <IconButton 
        icon={ShareIcon} 
        appearance="minimal"
        onClick={onClick}/>

    return canShare ? webShareAPILayout : linkShareLayout;
}
