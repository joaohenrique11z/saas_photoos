"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text?: string | null;
  className?: string;
  maxChars?: number;
}

export function ExpandableText({
  text,
  className,
  maxChars = 150,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) {
    return <span className="text-muted-foreground italic">Sem anotações.</span>;
  }

  const isLong = text.length > maxChars || text.split("\n").length > 3;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed transition-all",
          !expanded && isLong && "line-clamp-3",
          className
        )}
      >
        {text}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-500 transition-colors pt-0.5"
        >
          {expanded ? (
            <>
              <span>Mostrar menos</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Ler mais</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
