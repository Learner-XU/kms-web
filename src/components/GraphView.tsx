"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { useKMSStore } from "@/lib/store"
import { GraphNode, GraphEdge } from "@/lib/api"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  title: string
  type: string
  status: string
  link_count: number
  x?: number
  y?: number
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode
  target: string | SimNode
  weight: number
}

const statusColors: Record<string, string> = {
  seed: "#666666",
  growing: "#f59e0b",
  mature: "#22c55e",
  archived: "#636e72",
}

const typeColors: Record<string, string> = {
  note: "#3b82f6",
  daily: "#06b6d4",
  source: "#7c3aed",
  project: "#f59e0b",
}

export default function GraphView() {
  const { graphData, loadGraph, loadNote } = useKMSStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null)

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

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

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })
    svg.call(zoom)

    // Simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))
    simulationRef.current = simulation

    // Links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.6)

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call((d3.drag() as any)
        .on("start", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (event: any, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on("end", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
      .on("click", (_event, d) => {
        loadNote(d.id)
      })

    // Node circles
    node.append("circle")
      .attr("r", (d) => Math.max(8, Math.min(20, 5 + d.link_count * 3)))
      .attr("fill", (d) => statusColors[d.status] || "#3b82f6")
      .attr("stroke", (d) => typeColors[d.type] || "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")

    // Node labels
    node.append("text")
      .text((d) => d.title)
      .attr("x", 0)
      .attr("y", (d) => -(Math.max(8, Math.min(20, 5 + d.link_count * 3)) + 6))
      .attr("text-anchor", "middle")
      .attr("fill", "#a0a0a0")
      .attr("font-size", "11px")
      .style("pointer-events", "none")

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!)

      node.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })

    // Zoom controls
    const handleZoomIn = () => svg.transition().call(zoom.scaleBy, 1.5)
    const handleZoomOut = () => svg.transition().call(zoom.scaleBy, 0.67)
    const handleFit = () => svg.transition().call(zoom.transform, d3.zoomIdentity)

    // Store handlers for buttons
    ;(svg.node() as any).__zoomIn = handleZoomIn
    ;(svg.node() as any).__zoomOut = handleZoomOut
    ;(svg.node() as any).__fit = handleFit
  }, [graphData, dimensions, loadNote])

  useEffect(() => {
    renderGraph()
  }, [renderGraph])

  const handleZoomIn = () => {
    const fn = (svgRef.current as any)?.__zoomIn
    if (fn) fn()
  }
  const handleZoomOut = () => {
    const fn = (svgRef.current as any)?.__zoomOut
    if (fn) fn()
  }
  const handleFit = () => {
    const fn = (svgRef.current as any)?.__fit
    if (fn) fn()
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="bg-bg-primary" />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="p-2 bg-bg-card border border-border-default rounded hover:bg-bg-hover transition-colors">
          <ZoomIn className="w-4 h-4 text-text-tertiary" />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-bg-card border border-border-default rounded hover:bg-bg-hover transition-colors">
          <ZoomOut className="w-4 h-4 text-text-tertiary" />
        </button>
        <button onClick={handleFit} className="p-2 bg-bg-card border border-border-default rounded hover:bg-bg-hover transition-colors">
          <Maximize2 className="w-4 h-4 text-text-tertiary" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-bg-card/90 border border-border-default rounded-md p-3 text-xs space-y-2">
        <div className="text-text-muted font-medium mb-1">状态</div>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-text-tertiary">{status}</span>
          </div>
        ))}
        <div className="text-text-muted font-medium mt-2 mb-1">类型</div>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: color }} />
            <span className="text-text-tertiary">{type}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {graphData && graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-text-muted">
            <p className="text-lg mb-2">暂无知识图谱数据</p>
            <p className="text-sm">创建笔记并添加 [[双向链接]] 后，图谱将自动构建</p>
          </div>
        </div>
      )}
    </div>
  )
}
