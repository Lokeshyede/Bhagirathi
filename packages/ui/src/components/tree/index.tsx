import React, { useState } from "react";
import { ChevronRight, Building2, Layers, Home, Bed, Plus, Edit2, Trash2 } from "lucide-react";
import { cn } from "../../design-system/utils";
import { AnimateHeight } from "../animations";

export interface PropertyTreeNode {
  id: string;
  label: string;
  type: "hostel" | "floor" | "room" | "bed";
  status?: "available" | "full" | "occupied" | "maintenance" | "reserved";
  children?: PropertyTreeNode[];
  meta?: string; // e.g. "Rent: ₹5000", "Beds: 2/4"
}

export interface PropertyTreeProps {
  data: PropertyTreeNode[];
  onNodeClick?: (node: PropertyTreeNode) => void;
  onAddChild?: (node: PropertyTreeNode) => void;
  onEditNode?: (node: PropertyTreeNode) => void;
  onDeleteNode?: (node: PropertyTreeNode) => void;
  className?: string;
  defaultExpandedIds?: string[];
}

const typeIcons = {
  hostel: Building2,
  floor: Layers,
  room: Home,
  bed: Bed,
};

const statusColors = {
  available: "text-success bg-success/10",
  full: "text-danger bg-danger/10",
  occupied: "text-danger bg-danger/10",
  maintenance: "text-maintenance bg-maintenance/10",
  reserved: "text-reserved bg-reserved/10",
};

export const PropertyTree: React.FC<PropertyTreeProps> = ({
  data,
  onNodeClick,
  onAddChild,
  onEditNode,
  onDeleteNode,
  className,
  defaultExpandedIds = [],
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderNode = (node: PropertyTreeNode, depth = 0) => {
    const isExpanded = expandedIds.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const Icon = typeIcons[node.type];

    return (
      <div key={node.id} className="w-full">
        {/* Node Element */}
        <div
          onClick={() => onNodeClick?.(node)}
          className={cn(
            "group flex items-center justify-between py-2 px-3 rounded-button text-xs font-semibold text-text-secondary hover:bg-background dark:text-gray-300 dark:hover:bg-gray-855 transition duration-150 cursor-pointer select-none",
            depth > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${Math.max(12, depth * 16)}px` }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Expand / Collapse arrow icon */}
            <span
              onClick={(e) => hasChildren && toggleExpand(node.id, e)}
              className={cn(
                "p-0.5 rounded hover:bg-border/50 transition cursor-pointer text-text-muted shrink-0",
                !hasChildren && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isExpanded && "transform rotate-90"
                )}
              />
            </span>

            {/* Entity Icon */}
            <span className={cn(
              "p-1.5 rounded-lg shrink-0",
              node.type === "hostel" && "bg-primary/10 text-primary",
              node.type === "floor" && "bg-info/10 text-info",
              node.type === "room" && "bg-success/10 text-success",
              node.type === "bed" && "bg-warning/10 text-warning"
            )}>
              <Icon className="h-4 w-4" />
            </span>

            {/* Labels */}
            <div className="overflow-hidden">
              <span className="text-text-primary dark:text-white truncate">{node.label}</span>
              {node.meta && (
                <span className="text-[10px] text-text-muted ml-2 font-medium">({node.meta})</span>
              )}
            </div>
          </div>

          {/* Action overlay / Status pills */}
          <div className="flex items-center gap-2 shrink-0">
            {node.status && (
              <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase rounded-badge shrink-0", statusColors[node.status])}>
                {node.status}
              </span>
            )}

            {/* Modify/Add Child Action Triggers (shown on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150 pl-2">
              {onAddChild && node.type !== "bed" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(node);
                  }}
                  className="p-1 rounded text-text-secondary hover:bg-border hover:text-text-primary dark:hover:bg-gray-800 cursor-pointer"
                  title="Add Sub-item"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
              {onEditNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNode(node);
                  }}
                  className="p-1 rounded text-text-secondary hover:bg-border hover:text-text-primary dark:hover:bg-gray-800 cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
              {onDeleteNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(node);
                  }}
                  className="p-1 rounded text-text-secondary hover:bg-danger-light/20 hover:text-danger dark:hover:bg-red-950/20 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Child levels */}
        {hasChildren && (
          <AnimateHeight isOpen={isExpanded}>
            <div className="border-l border-divider/60 ml-5.5 dark:border-gray-850/40 my-1 space-y-0.5">
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </div>
          </AnimateHeight>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-0.5 select-none w-full", className)}>
      {data.map((node) => renderNode(node, 0))}
    </div>
  );
};

export default PropertyTree;
