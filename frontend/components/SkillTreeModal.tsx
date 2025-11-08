"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { X, CheckCircle, Lock } from "lucide-react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { SkillTreeNode, SkillTree, getSkillTreeForPosition, hasSkillTree } from "@/lib/skillTrees";
import SkillResourcePanel from "./SkillResourcePanel";

interface Position {
  id: string;
  title: string;
  industry: string;
  requiredSkills: string[];
  description?: string;
  company?: string;
  isCustom?: boolean;
  jobUrl?: string;
  userId?: string;
}

interface PositionWithProgress extends Position {
  completionPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  isFocused?: boolean;
}

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: PositionWithProgress | null;
  userSkills: string[];
}

// Custom node component for skills
const SkillNode = ({ data }: { data: any }) => {
  const { skill, isLearned, onClick } = data;
  
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 rounded-lg shadow-md border-2 min-w-[120px] text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
        isLearned
          ? "bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white"
          : "bg-gradient-to-br from-slate-300 to-slate-400 border-slate-400 text-slate-700 dark:from-slate-600 dark:to-slate-700 dark:border-slate-500 dark:text-slate-300"
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {isLearned ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        <span className="font-semibold text-sm">{skill}</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  skillNode: SkillNode,
};

export default function SkillTreeModal({
  isOpen,
  onClose,
  position,
  userSkills,
}: SkillTreeModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert skill tree to ReactFlow nodes and edges
  const buildFlowData = useCallback(
    (tree: SkillTree, onNodeClick: (skill: string) => void) => {
      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];
      const seenNodeIds = new Set<string>(); // Track node IDs to prevent duplicates
      
      // Node dimensions (approximate)
      const NODE_WIDTH = 150;
      const NODE_HEIGHT = 80;
      const HORIZONTAL_SPACING = 200; // Space between nodes at same level
      const VERTICAL_SPACING = 180; // Space between levels
      const MIN_LEVEL_WIDTH = 400; // Minimum width for a level

      // Calculate subtree width recursively
      function getSubtreeWidth(node: SkillTreeNode): number {
        if (!node.children || node.children.length === 0) {
          return NODE_WIDTH;
        }
        
        let totalWidth = 0;
        node.children.forEach((child) => {
          totalWidth += getSubtreeWidth(child);
        });
        
        // Add spacing between children
        const spacing = node.children.length > 1 
          ? HORIZONTAL_SPACING * (node.children.length - 1)
          : 0;
        
        return Math.max(totalWidth + spacing, NODE_WIDTH);
      }

      // Calculate layout positions with better spacing
      function calculateLayout(
        node: SkillTreeNode,
        x: number,
        y: number
      ): { x: number; y: number; width: number } {
        const nodeId = `node-${node.id}`;
        
        // Check for duplicate node IDs
        if (seenNodeIds.has(nodeId)) {
          console.warn(`Duplicate node ID detected: ${nodeId} (${node.skill}). Skipping duplicate.`);
          return { x: 0, y: 0, width: 0 };
        }
        seenNodeIds.add(nodeId);
        
        const nodeY = y * VERTICAL_SPACING;

        // Create ReactFlow node
        flowNodes.push({
          id: nodeId,
          type: "skillNode",
          position: { x: x - NODE_WIDTH / 2, y: nodeY },
          data: {
            skill: node.skill,
            isLearned: node.isLearned || false,
            onClick: () => onNodeClick(node.skill),
          },
        });

        let subtreeWidth = 0;
        let currentX = x;

        if (node.children && node.children.length > 0) {
          // Calculate total width needed for all children
          const childrenWidths = node.children.map((child) => getSubtreeWidth(child));
          const totalChildrenWidth = childrenWidths.reduce((sum, w) => sum + w, 0);
          const totalSpacing = HORIZONTAL_SPACING * (node.children.length - 1);
          subtreeWidth = Math.max(totalChildrenWidth + totalSpacing, MIN_LEVEL_WIDTH);

          // Start positioning children from the left
          currentX = x - subtreeWidth / 2;

          node.children.forEach((child, index) => {
            const childWidth = childrenWidths[index];
            const childX = currentX + childWidth / 2;
            
            const childPos = calculateLayout(
              child,
              childX,
              y + 1
            );

            // Only create edge if child node was created (not duplicate)
            if (childPos.width > 0) {
              // Create edge with directional arrow
              const edgeColor = node.isLearned && child.isLearned ? "#10b981" : "#64748b";
              flowEdges.push({
                id: `edge-${node.id}-${child.id}`,
                source: nodeId,
                target: `node-${child.id}`,
                type: "smoothstep",
                animated: node.isLearned && child.isLearned,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 25,
                  height: 25,
                  color: edgeColor,
                },
                style: {
                  stroke: edgeColor,
                  strokeWidth: 3,
                },
              });
            }

            // Move to next child position
            currentX += childWidth + HORIZONTAL_SPACING;
          });
        } else {
          // Leaf node - just return its width
          subtreeWidth = NODE_WIDTH;
        }

        return { x: x - NODE_WIDTH / 2, y: nodeY, width: subtreeWidth };
      }

      // Start layout calculation from root
      const rootWidth = getSubtreeWidth(tree.root);
      calculateLayout(tree.root, 0, 0);

      // Center the tree horizontally
      if (flowNodes.length > 0) {
        const minX = Math.min(...flowNodes.map((n) => n.position.x));
        const maxX = Math.max(...flowNodes.map((n) => n.position.x));
        const centerX = (minX + maxX) / 2;

        flowNodes.forEach((node) => {
          node.position.x -= centerX;
        });
      }

      return { nodes: flowNodes, edges: flowEdges };
    },
    []
  );

  // Build flow data when position or user skills change
  useEffect(() => {
    if (!position) return;

    const tree = getSkillTreeForPosition(position.title, userSkills);

    if (tree) {
      const { nodes: flowNodes, edges: flowEdges } = buildFlowData(tree, setSelectedSkill);
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [position, userSkills, buildFlowData, setNodes, setEdges]);

  if (!isOpen || !position) return null;

  const hasTree = hasSkillTree(position.title);

  if (!hasTree) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-start z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Skill Tree: {position.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click on any skill node to view learning resources
              </p>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-green-600"></div>
                  <span className="text-slate-700 dark:text-slate-300">Learned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700"></div>
                  <span className="text-slate-700 dark:text-slate-300">Not Learned</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tree Visualization */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              className="bg-slate-50 dark:bg-slate-900"
            >
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Resource Panel */}
      {selectedSkill && (
        <SkillResourcePanel
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </>
  );
}

