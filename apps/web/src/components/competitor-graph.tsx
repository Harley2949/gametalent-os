'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';

interface Node {
  id: string;
  name: string;
  position: string;
  company: string;
  joinDate: string;
  isKeyPerson: boolean;
  level: number;
  // D3 Simulation properties
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
  vx?: number;
  vy?: number;
}

interface Link {
  source: string;
  target: string;
  type: 'reports-to' | 'same-team';
}

interface CompetitorGraphProps {
  companyId: string;
}

export function CompetitorGraph({ companyId }: CompetitorGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    fetchCompetitorData(companyId).then(setGraphData);
  }, [companyId]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => d.type === 'reports-to' ? 2 : 1);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', (d) => d.isKeyPerson ? 25 : 20)
      .attr('fill', (d) => d.isKeyPerson ? '#f59e0b' : '#3b82f6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((d) => d.name);

    node.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text((d) => d.position);

    node.on('click', (event, d) => setSelectedNode(d));

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [nodes, links]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>竞品组织图谱</CardTitle>
      </CardHeader>
      <CardContent>
        <svg ref={svgRef} style={{ width: '100%', height: '600px', border: '1px solid #e5e7eb' }} />
        {selectedNode && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">{selectedNode.name}</h3>
            <p className="text-sm text-gray-600">{selectedNode.position}</p>
            <p className="text-sm text-gray-600">{selectedNode.company}</p>
            <p className="text-sm text-gray-500">入职时间: {selectedNode.joinDate}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function fetchCompetitorData(companyId: string) {
  const res = await fetch(`/api/competitor-graph/${companyId}`);
  return res.json();
}

function setGraphData(data: any) {
  // Placeholder
}
