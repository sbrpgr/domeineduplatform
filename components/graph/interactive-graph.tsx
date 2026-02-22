'use client';

import { useMemo, useState } from 'react';
import ReactFlow, { Controls, MiniMap, Background, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import type { RelationshipEdge } from '@/lib/types';
import { buildHopSubgraph, filterEdgesByKeyword, filterEdgesByRelation, type RelationType } from '@/lib/graph/hops';

const relations: RelationType[] = ['parent', 'sibling', 'child', 'opposite'];

type GraphEdge = RelationshipEdge;

export function InteractiveGraph({
  center,
  edges,
  domain,
  userId = 'demo-user'
}: {
  center: string;
  edges: GraphEdge[];
  domain: string;
  userId?: string;
}) {
  const [query, setQuery] = useState('');
  const [enabledRelations, setEnabledRelations] = useState<RelationType[]>([...relations]);
  const [selectedNode, setSelectedNode] = useState<string>(center);

  const activeEdges = useMemo(() => {
    const hopEdges = buildHopSubgraph(center, edges, 3);
    const relationFiltered = filterEdgesByRelation(hopEdges, enabledRelations);
    return filterEdgesByKeyword(relationFiltered, query);
  }, [center, edges, enabledRelations, query]);

  const { nodes, flowEdges } = useMemo(() => {
    const nodeSet = new Set<string>([center]);
    for (const edge of activeEdges) {
      nodeSet.add(edge.from);
      nodeSet.add(edge.to);
    }

    const allNodes = Array.from(nodeSet);
    const builtNodes: Node[] = allNodes.map((name, idx) => ({
      id: name,
      data: { label: name },
      position: {
        x: (idx % 5) * 220,
        y: Math.floor(idx / 5) * 150
      },
      style: {
        borderRadius: name === center ? 18 : 10,
        border: name === selectedNode ? '2px solid #EA8A18' : name === center ? '2px solid #1A3C5E' : '1px solid #8BA5BF',
        padding: 8,
        background: name === center ? '#E7F0FA' : '#fff'
      }
    }));

    const builtEdges: Edge[] = activeEdges.map((edge, idx) => ({
      id: `${edge.from}-${edge.to}-${idx}`,
      source: edge.from,
      target: edge.to,
      label: edge.relation,
      animated: edge.relation === 'opposite',
      style: {
        stroke:
          edge.relation === 'parent'
            ? '#2E75B6'
            : edge.relation === 'sibling'
              ? '#19A162'
              : edge.relation === 'child'
                ? '#6B7280'
                : '#D83C3C',
        strokeDasharray: edge.relation === 'opposite' ? '5 5' : '0'
      }
    }));

    return { nodes: builtNodes, flowEdges: builtEdges };
  }, [activeEdges, center, selectedNode]);

  const emitGraphEvent = async (termId: string) => {
    try {
      await fetch('/api/learning/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          term_id: termId,
          event_type: 'graph_explore',
          metadata: { domain },
          timestamp: new Date().toISOString()
        })
      });
    } catch {
      // Ignore telemetry failures in UI.
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="그래프 내 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {relations.map((relation) => {
              const active = enabledRelations.includes(relation);
              return (
                <button
                  key={relation}
                  className={`rounded-lg border px-2 py-1 text-xs ${active ? 'border-primary text-primary' : 'border-slate-300 text-slate-500'}`}
                  onClick={() => {
                    setEnabledRelations((prev) =>
                      prev.includes(relation) ? prev.filter((r) => r !== relation) : [...prev, relation]
                    );
                  }}
                  type="button"
                >
                  {relation}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[620px] rounded-xl border border-slate-200">
          <ReactFlow
            nodes={nodes}
            edges={flowEdges}
            fitView
            onNodeClick={(_, node) => {
              const nodeId = String(node.id);
              setSelectedNode(nodeId);
              void emitGraphEvent(nodeId);
            }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-500">노드 패널</h3>
        <p className="mt-2 text-lg font-bold text-primary">{selectedNode}</p>
        <p className="mt-2 text-sm text-slate-600">중심 기준 3-hop 범위에서 관계를 표시합니다.</p>
        <p className="mt-3 text-xs text-slate-500">활성 엣지: {activeEdges.length}개</p>
      </aside>
    </div>
  );
}
