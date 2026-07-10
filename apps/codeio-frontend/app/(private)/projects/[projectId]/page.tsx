"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FileExplorer from "@/features/projects/single-project/sections/file-explorer";
import CodeEditor from "@/features/projects/single-project/sections/code-editor";
import TerminalComponent from "@/features/projects/single-project/sections/terminal";

function SingleProject() {
  // Left/Right split (percentage of total width for left panel)
  const [leftWidth, setLeftWidth] = useState(60);
  // Top/Bottom split within right panel (percentage for terminal)
  const [terminalHeight, setTerminalHeight] = useState(40);
  // Sidebar/Editor split within left panel (percentage for sidebar)
  const [sidebarWidth, setSidebarWidth] = useState(22);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingH = useRef(false); // horizontal (left/right)
  const isDraggingV = useRef(false); // vertical (terminal/output)
  const isDraggingS = useRef(false); // sidebar width

  const startDrag = useCallback(
    (type: "horizontal" | "vertical" | "sidebar") => (e: React.MouseEvent) => {
      e.preventDefault();
      if (type === "horizontal") isDraggingH.current = true;
      if (type === "vertical") isDraggingV.current = true;
      if (type === "sidebar") isDraggingS.current = true;
    },
    [],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      if (isDraggingH.current) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftWidth(Math.min(Math.max(x, 25), 80));
      }

      if (isDraggingV.current) {
        const rightPanelTop = rect.top;
        const rightPanelHeight = rect.height;
        const y = ((e.clientY - rightPanelTop) / rightPanelHeight) * 100;
        // terminalHeight is measured from bottom, so invert
        setTerminalHeight(Math.min(Math.max(100 - y, 15), 75));
      }

      if (isDraggingS.current) {
        // Sidebar is within the left panel
        const leftPanelWidth = (leftWidth / 100) * rect.width;
        const x = ((e.clientX - rect.left) / leftPanelWidth) * 100;
        setSidebarWidth(Math.min(Math.max(x, 12), 45));
      }
    };

    const onMouseUp = () => {
      isDraggingH.current = false;
      isDraggingV.current = false;
      isDraggingS.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [leftWidth]);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none"
    >
      {/* ── LEFT PANEL: File Explorer + Code Editor ── */}
      <div
        className="flex h-full overflow-hidden border-2"
        style={{ width: `${leftWidth}%` }}
      >
        {/* Sidebar */}
        <div
          className="flex flex-col h-full overflow-hidden border-r border-border bg-muted/30"
          style={{ width: `${sidebarWidth}%` }}
        >
          <FileExplorer />
        </div>

        {/* Sidebar drag handle */}
        <div
          onMouseDown={startDrag("sidebar")}
          className="w-1 h-full cursor-col-resize bg-border hover:bg-primary/50 transition-colors shrink-0"
        />

        {/* Code editor */}
        <div className="flex-1 h-full overflow-hidden">
          <CodeEditor />
        </div>
      </div>

      {/* Horizontal drag handle (left/right split) */}
      <div
        onMouseDown={startDrag("horizontal")}
        className="w-1 h-full cursor-col-resize bg-border hover:bg-primary/50 transition-colors shrink-0 z-10"
      />

      {/* ── RIGHT PANEL: Terminal + Output ── */}
      <div
        className="flex flex-col h-full overflow-hidden min-h-0"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {/* Output panel (top) */}
        <div
          className="overflow-hidden min-h-0"
          style={{ height: `${100 - terminalHeight}%` }}
        >
          {/* <OutputPanel /> */}
        </div>

        {/* Vertical drag handle */}
        <div
          onMouseDown={startDrag("vertical")}
          className="h-1 w-full cursor-row-resize bg-border hover:bg-primary/50 transition-colors shrink-0"
        />

        {/* Terminal (bottom) */}
        <div
          className="flex overflow-hidden min-h-0"
          style={{ height: `${terminalHeight}%` }}
        >
          {/* <Terminal /> */}
          <TerminalComponent />
        </div>
      </div>
    </div>
  );
}

export default SingleProject;
