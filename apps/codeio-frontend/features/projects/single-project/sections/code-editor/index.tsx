"use client";

import { useEffect, useState } from "react";

import NoFile from "./partials/noFile";
import StatusBar from "./partials/statusBar";
import EditorBody from "./partials/editorBody";
import EditorHeader from "./partials/editorHeader";
import { useProject } from "../../context/project-context";
import { useDebounce } from "@/features/shared/hooks/useDebounce";

export default function CodeEditor() {
  const [line, setLine] = useState(1);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
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
    updateFileContent(debouncedCode);
  }, [debouncedCode]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background">
      {currentFile.path && <EditorHeader fileName={name} />}

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
