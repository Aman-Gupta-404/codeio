"use client";

import { Circle } from "lucide-react";
import { getMonacoLanguage } from "../../../utils/helper";

interface Props {
  line: number;
  column: number;
  fileName: string;
}

export default function StatusBar({ line, column, fileName }: Props) {
  return (
    <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Circle size={8} className="fill-green-500 text-green-500" />
          {getMonacoLanguage(fileName || "")}
        </span>

        <span>UTF-8</span>

        <span>LF</span>
      </div>

      <div className="flex items-center gap-4">
        <span>
          Ln {line}, Col {column}
        </span>

        <span>Spaces: 2</span>
      </div>
    </div>
  );
}
