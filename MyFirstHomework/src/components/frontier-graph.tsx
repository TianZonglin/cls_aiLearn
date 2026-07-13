"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FrontierInsightBlock } from "@/lib/home-insights";

interface FrontierGraphProps {
  filterSource: string;
  frontier: FrontierInsightBlock;
}

interface Point {
  x: number;
  y: number;
}

function buildProjectsLink(source: string, title?: string, year?: number, discipline?: string) {
  const search = new URLSearchParams();

  if (title) {
    search.set("title", title);
  }

  if (year) {
    search.set("year", String(year));
  }

  if (discipline) {
    search.set("discipline", discipline);
  }

  if (source && source !== "all") {
    search.set("source", source);
  }

  return `/projects?${search.toString()}`;
}

function shortenLabel(label: string, maxLength: number) {
  const chars = [...label];
  if (chars.length <= maxLength) {
    return label;
  }

  return `${chars.slice(0, maxLength).join("")}...`;
}

function buildDegreeMap(frontier: FrontierInsightBlock) {
  const degreeMap = new Map<string, number>();

  frontier.graphNodes.forEach((node) => {
    degreeMap.set(node.id, node.value);
  });

  frontier.graphEdges.forEach((edge) => {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + edge.weight * 1.6);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + edge.weight * 1.6);
  });

  return degreeMap;
}

function buildNeighborMap(frontier: FrontierInsightBlock) {
  const map = new Map<string, Set<string>>();

  frontier.graphNodes.forEach((node) => {
    map.set(node.id, new Set([node.id]));
  });

  frontier.graphEdges.forEach((edge) => {
    map.get(edge.source)?.add(edge.target);
    map.get(edge.target)?.add(edge.source);
  });

  return map;
}

function buildRadialPositions(frontier: FrontierInsightBlock) {
  const degreeMap = buildDegreeMap(frontier);
  const rankedNodes = [...frontier.graphNodes].sort((left, right) => {
    const leftWeight = (degreeMap.get(left.id) ?? 0) + left.value;
    const rightWeight = (degreeMap.get(right.id) ?? 0) + right.value;
    return rightWeight - leftWeight;
  });

  const positions = new Map<string, Point>();
  const centerNode = rankedNodes[0];

  if (!centerNode) {
    return {
      centerNodeId: null,
      positions,
      degreeMap
    };
  }

  positions.set(centerNode.id, { x: 50, y: 50 });

  const innerRing = rankedNodes.slice(1, 7);
  const outerRing = rankedNodes.slice(7);

  innerRing.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(innerRing.length, 1) - Math.PI / 2;
    positions.set(node.id, {
      x: 50 + Math.cos(angle) * 18,
      y: 50 + Math.sin(angle) * 18
    });
  });

  outerRing.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(outerRing.length, 1) - Math.PI / 2;
    const radius = 31 + (index % 2) * 3.2;
    positions.set(node.id, {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    });
  });

  return {
    centerNodeId: centerNode.id,
    positions,
    degreeMap
  };
}

export function FrontierGraph({ filterSource, frontier }: FrontierGraphProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const { centerNodeId, positions, degreeMap } = useMemo(
    () => buildRadialPositions(frontier),
    [frontier]
  );
  const neighborMap = useMemo(() => buildNeighborMap(frontier), [frontier]);
  const activeNeighbors = activeNodeId ? neighborMap.get(activeNodeId) ?? new Set<string>() : null;
  const focusTerm = activeNodeId
    ? frontier.graphNodes.find((node) => node.id === activeNodeId)?.label
    : null;

  return (
    <div className="graph-card graph-card--page graph-card--radial">
      <div className="graph-card__toolbar">
        <div className="graph-card__meta">
          <strong>前沿图谱</strong>
          <span>
            {activeNodeId && focusTerm
              ? `当前高亮：${focusTerm} 的关联主题`
              : "固定主视觉：中心主题 + 环状辐射"}
          </span>
        </div>

        {activeNodeId ? (
          <button
            className="graph-card__secondary"
            onClick={() => setActiveNodeId(null)}
            type="button"
          >
            清除高亮
          </button>
        ) : null}
      </div>

      <div className="graph-orbit graph-orbit--inner" />
      <div className="graph-orbit graph-orbit--outer" />
      <div className="graph-orbit-core">前沿</div>

      <svg className="graph-lines" viewBox="0 0 1000 560" preserveAspectRatio="none">
        {frontier.graphEdges.map((edge, index) => {
          const source = positions.get(edge.source);
          const target = positions.get(edge.target);

          if (!source || !target) {
            return null;
          }

          const sourceX = source.x * 10;
          const sourceY = source.y * 5.6;
          const targetX = target.x * 10;
          const targetY = target.y * 5.6;
          const isCenterEdge = edge.source === centerNodeId || edge.target === centerNodeId;
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          const controlPull = isCenterEdge ? 0.8 : 0.44;
          const controlX = midX + (500 - midX) * controlPull;
          const controlY = midY + (280 - midY) * controlPull;

          return (
            <path
              key={`${edge.source}-${edge.target}-${index}`}
              className={`graph-line ${isCenterEdge ? "graph-line--center" : ""} ${
                activeNodeId
                  ? edge.source === activeNodeId || edge.target === activeNodeId
                    ? "graph-line--active"
                    : "graph-line--dim"
                  : ""
              }`}
              d={`M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`}
              stroke={`rgba(35, 79, 61, ${isCenterEdge ? 0.24 : Math.min(0.07 + edge.weight * 0.02, 0.15)})`}
              strokeWidth={
                isCenterEdge
                  ? Math.min(1.1 + edge.weight * 0.14, 2)
                  : Math.min(0.55 + edge.weight * 0.1, 1.2)
              }
              fill="none"
            />
          );
        })}
      </svg>

      <div className="graph-nodes">
        {frontier.graphNodes.map((node, index) => {
          const point = positions.get(node.id);

          if (!point) {
            return null;
          }

          const visualWeight = degreeMap.get(node.id) ?? node.value;
          const isCenter = node.id === centerNodeId;
          const isInner = !isCenter && index < 6;
          const label = isCenter
            ? node.label
            : isInner
              ? shortenLabel(node.label, 6)
              : shortenLabel(node.label, 4);

          return (
            <Link
              key={node.id}
              className={`graph-node graph-node--${index % 6} ${
                isCenter ? "graph-node--center" : isInner ? "graph-node--inner" : "graph-node--outer"
              } ${
                activeNodeId
                  ? node.id === activeNodeId
                    ? "graph-node--active"
                    : activeNeighbors?.has(node.id)
                      ? "graph-node--linked"
                      : "graph-node--dim"
                  : ""
              }`}
              href={buildProjectsLink(
                filterSource,
                node.searchText,
                undefined,
                frontier.discipline || undefined
              )}
              onMouseEnter={() => setActiveNodeId(node.id)}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                minHeight: isCenter ? "64px" : `${34 + Math.min(node.value, 5) * 3}px`,
                paddingInline: isCenter ? "22px" : `${10 + Math.min(visualWeight * 0.24, 8)}px`,
                zIndex: node.id === activeNodeId ? 5 : isCenter ? 4 : activeNeighbors?.has(node.id) ? 3 : 2
              }}
            >
              <span>{label}</span>
              <em>{node.value}</em>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
