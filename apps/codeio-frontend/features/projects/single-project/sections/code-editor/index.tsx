"use client";

import { useEffect, useMemo, useState } from "react";
import EditorHeader from "./partials/editorHeader";
import EditorBody from "./partials/editorBody";
import StatusBar from "./partials/statusBar";
import { useProject } from "../../context/project-context";
import NoFile from "./partials/noFile";
import { useDebounce } from "@/features/shared/hooks/useDebounce";

const INITIAL_CODE = `export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
    </main>
  );
}
`;

export default function CodeEditor() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [extention, setExtention] = useState("");
  const [line, setLine] = useState(1);
  const [column, setColumn] = useState(1);

  const { currentFile, updateFileContent } = useProject();
  const debouncedCode = useDebounce(code, 1000);

  useEffect(() => {
    if (currentFile.path !== null && currentFile.content !== null) {
      setCode(currentFile.content || "");
      const splitPath = currentFile.path.split("/");
      const fileName = splitPath.length
        ? splitPath.length > 1
          ? splitPath.pop()
          : splitPath[0]
        : "file";

      setName(fileName || "file");
    }
  }, [currentFile]);

  useEffect(() => {
    console.log("getting the debounced code: ", debouncedCode);
    updateFileContent(debouncedCode);
  }, [debouncedCode]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background">
      {currentFile.path && <EditorHeader fileName={name} />}

      {/* <EditorBody code={code} setCode={setCode} lines={lines} /> */}
      {currentFile.path ? (
        <>
          <EditorBody
            code={code}
            setCode={setCode}
            fileName={name}
            onCursorChange={(line, column) => {
              setLine(line);
              setColumn(column);
            }}
          />
          <StatusBar line={line} column={column} fileName={name} />
        </>
      ) : (
        <NoFile />
      )}
    </div>
  );
}
