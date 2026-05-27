"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { useKMSStore } from "@/lib/store"
import { Plus, Minus, ArrowsOut } from "@phosphor-icons/react"

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  title: string
  type: string
  status: string
  link_count: number
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode
  target: string | SimNode
  weight: number
}

interface ZoomableSVG extends SVGSVGElement {
  __zoomIn?: () => void
  __zoomOut?: () => void
  __fit?: () => void
}

const statusColors: Record<string, string> = {
  seed: "#52525b",
  growing: "#eab308",
  mature: "#22c55e",
  archived: "#3f3f46",
}

const typeColors: Record<string, string> = {
  note: "#6366f1",
  daily: "#06b6d4",
  source: "#a78bfa",
  project: "#eab308",
}

export default function GraphView() {
  const { graphData, loadGraph, loadNote } = useKMSStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null)

  useEffect(() => { loadGraph() }, [loadGraph])

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [])

  const renderGraph = useCallback(() => {
    if (!graphData || !svgRef.current) return

    const { width, height } = dimensions
    const nodes: SimNode[] = graphData.nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 300,
      y: height / 2 + (Math.random() - 0.5) * 300,
    }))

    const links: SimLink[] = graphData.edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
    }))

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    const g = svg.append("g")

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on("zoom", (event) => { g.attr("transform", event.transform) })
    svg.call(zoom)

    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))
    simulationRef.current = simulation

    // Links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-width", 1)

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(d3.drag<any, SimNode>()
        .on("start", (event: d3.D3DragEvent<any, SimNode, SimNode>, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on("drag", (event: d3.D3DragEvent<any, SimNode, SimNode>, d) => {
          d.fx = event.x; d.fy = event.y
        })
        .on("end", (event: d3.D3DragEvent<any, SimNode, SimNode>, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null; d.fy = null
        })
      )
      // d.id is the note path from the backend graph API (confirmed: graph node id === note path)
    .on("click", (_event, d) => { loadNote(d.id) })

    node.append("circle")
      .attr("r", (d) => Math.max(6, Math.min(18, 4 + d.link_count * 2.5)))
      .attr("fill", (d) => statusColors[d.status] || "#6366f1")
      .attr("stroke", (d) => typeColors[d.type] || "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")

    node.append("text")
      .text((d) => d.title)
      .attr("x", 0)
      .attr("y", (d) => -(Math.max(6, Math.min(18, 4 + d.link_count * 2.5)) + 8))
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11px")
      .style("pointer-events", "none")

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!)
      node.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })

    ;(svg.node() as unknown as ZoomableSVG).__zoomIn = () => svg.transition().call(zoom.scaleBy, 1.5)
    ;(svg.node() as unknown as ZoomableSVG).__zoomOut = () => svg.transition().call(zoom.scaleBy, 0.67)
    ;(svg.node() as unknown as ZoomableSVG).__fit = () => svg.transition().call(zoom.transform, d3.zoomIdentity)
  }, [graphData, dimensions, loadNote])

  useEffect(() => { renderGraph() }, [renderGraph])
  useEffect(() => { return () => { simulationRef.current?.stop() } }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="bg-bg-base" />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-0.5">
        {[
          { handler: () => (svgRef.current as unknown as ZoomableSVG)?.__zoomIn?.(), icon: Plus },
          { handler: () => (svgRef.current as unknown as ZoomableSVG)?.__zoomOut?.(), icon: Minus },
          { handler: () => (svgRef.current as unknown as ZoomableSVG)?.__fit?.(), icon: ArrowsOut },
        ].map(({ handler, icon: Icon }, i) => (
          <button
            key={i}
            onClick={handler}
            className="p-2 bg-bg-elevated/90 border border-border-default rounded-md hover:bg-bg-hover backdrop-blur-sm transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-bg-elevated/90 border border-border-default rounded-lg p-3 text-[11px] space-y-2 backdrop-blur-sm">
        <div className="text-text-ghost font-medium mb-1">状态</div>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-text-muted">{status}</span>
          </div>
        ))}
        <div className="text-text-ghost font-medium mt-2 mb-1">类型</div>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border-[1.5px]" style={{ borderColor: color }} />
            <span className="text-text-muted">{type}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {graphData && graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-text-muted mb-1">暂无知识图谱数据</p>
            <p className="text-xs text-text-ghost">创建笔记并添加 [[双向链接]] 后自动生成</p>
          </div>
        </div>
      )}
    </div>
  )
}
