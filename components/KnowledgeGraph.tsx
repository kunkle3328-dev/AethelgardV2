
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { VaultEntry } from '../schemas/vault.schema';

interface KnowledgeGraphProps {
  items: VaultEntry[];
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ items }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'supports': return '#22c55e'; // green
      case 'contradicts': return '#ef4444'; // red
      case 'questions': return '#eab308'; // yellow
      case 'expands': return '#3b82f6'; // blue
      default: return '#52525b'; // zinc
    }
  };

  useEffect(() => {
    if (!svgRef.current || items.length === 0) return;

    const width = 1000;
    const height = 800;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = items.map(item => ({ 
      id: item.id, 
      label: item.summary,
      type: item.metadata.type,
      group: 1
    }));

    const links: any[] = [];
    items.forEach(item => {
      if (item.metadata.links) {
        item.metadata.links.forEach(link => {
          // Verify target exists in current set
          if (items.some(i => i.id === link.targetId)) {
            links.push({
              source: item.id,
              target: link.targetId,
              relation: link.relation
            });
          }
        });
      }
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Arrow markers for relationships
    svg.append("defs").selectAll("marker")
      .data(['supports', 'contradicts', 'questions', 'expands', 'derived_from'])
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => getRelationColor(d))
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => getRelationColor(d.relation))
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .attr("marker-end", d => `url(#arrow-${d.relation})`);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", d => d.type === 'summary' ? 12 : 8)
      .attr("fill", d => d.type === 'summary' ? '#dc2626' : '#18181b')
      .attr("stroke", "#fafafa")
      .attr("stroke-width", 1.5)
      .style("filter", "drop-shadow(0 0 5px rgba(220, 38, 38, 0.4))");

    node.append("text")
      .text(d => d.label)
      .attr("x", 16)
      .attr("y", 4)
      .attr("fill", "#fafafa")
      .style("font-size", "10px")
      .style("font-family", "Orbitron")
      .style("font-weight", "black")
      .style("text-transform", "uppercase");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [items]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black orbitron text-zinc-100 uppercase">NEURAL MAPPING</h1>
          <p className="text-zinc-500 text-[10px] orbitron tracking-widest uppercase mt-1">Semantic clusters and semantic relationship graph.</p>
        </div>
        <div className="flex gap-4">
           {['supports', 'contradicts', 'expands'].map(rel => (
             <div key={rel} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRelationColor(rel) }}></div>
                <span className="orbitron text-[8px] text-zinc-500 font-black uppercase tracking-tighter">{rel}</span>
             </div>
           ))}
        </div>
      </div>
      <div className="flex-1 glass rounded-[2.5rem] border border-red-900/20 relative overflow-hidden flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full cursor-move" viewBox="0 0 1000 800" />
        <div className="absolute bottom-6 right-6 p-6 glass rounded-2xl border border-red-900/20 space-y-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
            <span className="text-[9px] orbitron text-zinc-100 font-black uppercase tracking-widest">ACTIVE NEURONS: {items.length}</span>
          </div>
          <div className="text-[7px] orbitron text-zinc-600 font-black uppercase tracking-widest">Inference Engine: Online</div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
