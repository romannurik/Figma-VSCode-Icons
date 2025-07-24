import {
  Bold,
  Code,
  Divider,
  Link,
  Muted,
  render,
  SearchTextbox,
  useInitialFocus,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import cn from "classnames";
import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import allIcons from './codicons';
import { NeedsSetupHandler, PluginDrop, SelectionChangeHandler } from "./types";
import styles from "./ui.css";

function Plugin() {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [needsSetup, setNeedsSetup] = useState(false);

  const initialFocus = useInitialFocus();

  const filteredIcons = useMemo(() => {
    let sanitizedFilter = filter.toLocaleLowerCase();
    return allIcons.filter(
      (icon) =>
        icon.description.includes(sanitizedFilter) ||
        icon.shortName.replace(/-/g, " ").includes(sanitizedFilter)
    );
  }, [allIcons, filter]);

  useEffect(() => {
    on<NeedsSetupHandler>("NEEDS_SETUP", () => {
      setNeedsSetup(true);
    });
    on<SelectionChangeHandler>("SELECTION_CHANGE", (icon) => {
      // TODO: if the icon isn't in the filter, clear the filter?
      if (allIcons.find((c) => c.character === icon)) {
        setSelectedChar(icon);
      } else {
        setSelectedChar(null);
      }
    });
  }, []);

  if (needsSetup) {
    return (
      <div class={styles.root}>
        <div class={styles.fatalError}>
          <Bold>Whoops.</Bold>
          <Muted style={{ marginTop: 8 }}>
            The <Code>codicon</Code> font isn't installed on your computer.{" "}
            <Link
              target="_blank"
              href="https://github.com/microsoft/vscode-codicons/blob/main/dist/codicon.ttf"
            >
              Download and install it,
            </Link>{" "}
            <br />
            and then re-run the plugin.
          </Muted>
        </div>
      </div>
    );
  }

  return (
    <div class={styles.root}>
      <SearchTextbox
        {...initialFocus}
        clearOnEscapeKeyDown
        placeholder="Search icons"
        value={filter}
        onInput={(ev) => setFilter(ev.currentTarget.value)}
      />
      <Divider />
      {!filteredIcons.length && <div class={styles.empty}>No results</div>}
      {!!filteredIcons.length && (
        <div class={styles.iconList}>
          {filteredIcons.map((ic) => (
            <button
              key={ic.shortName}
              class={cn(styles.iconTile, {
                [styles.isSelected]: selectedChar === ic.character,
              })}
              onClick={(ev) => {
                emit<SelectionChangeHandler>("SELECTION_CHANGE", ic.character);
                setSelectedChar(ic.character);
              }}
              // None of these seem to prevent the "drag-failed" animation :-/
              // onDragStart={(ev) => {
              //   if (!ev.dataTransfer) return;
              //   ev.dataTransfer.effectAllowed = "all";
              //   ev.dataTransfer.dropEffect = "copy";
              // }}
              // onDragExit={(ev) => {
              //   ev.preventDefault();
              // }}
              draggable
              ref={(node) => {
                if (node && selectedChar === ic.character) {
                  node.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
              }}
              onDragEnd={(ev) => {
                ev.preventDefault();
                if (ev.view?.length === 0) return;
                window.parent.postMessage(
                  {
                    pluginDrop: {
                      clientX: ev.clientX,
                      clientY: ev.clientY,
                      items: [{ type: "text/plain", data: ic.character }],
                    } satisfies PluginDrop,
                  },
                  "*"
                );
              }}
            >
              <div class={styles.iconPreview}>{ic.character}</div>
              <div class={styles.iconName}>{ic.shortName}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default render(Plugin);
