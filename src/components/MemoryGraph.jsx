import React, { useState, useMemo } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { MockMemoryService } from '../services/mockMemoryService';

export const MemoryGraph = () => {
  const { memories, setSelectedMemory } = useMemory();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);

  const graphData = useMemo(() => {
    return MockMemoryService.getGraphData(memories);
  }, [memories]);

  // Layout node coordinates
  const positionedNodes = useMemo(() => {
    const width = 900;
    const height = 620;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodePositions = {
      'user': { x: centerX, y: centerY - 40 },
      'project-travel': { x: centerX - 220, y: centerY + 60 },
      'uni-vit': { x: centerX + 260, y: centerY - 100 },
      'hackathon': { x: centerX + 240, y: centerY + 140 },
    };

    let travelIndex = 0;
    let userIndex = 0;

    graphData.nodes.forEach((node) => {
      if (nodePositions[node.id]) return;

      if (node.id.includes('M002') || node.id.includes('M003') || node.id.includes('M004') || node.id.includes('M005') || node.id.includes('M006') || node.id.includes('M010') || node.id.includes('M011')) {
        const angle = (travelIndex * 0.8) + 1.2;
        const radius = node.status === 'SUPERSEDED' ? 240 : 160;
        nodePositions[node.id] = {
          x: nodePositions['project-travel'].x + Math.cos(angle) * radius,
          y: nodePositions['project-travel'].y + Math.sin(angle) * radius,
        };
        travelIndex++;
      } else if (node.id.includes('M001') || node.id.includes('M007') || node.id.includes('M012')) {
        const angle = (userIndex * 0.9) - 2.5;
        const radius = node.status === 'HISTORICAL' ? 230 : 150;
        nodePositions[node.id] = {
          x: nodePositions['user'].x + Math.cos(angle) * radius,
          y: nodePositions['user'].y + Math.sin(angle) * radius,
        };
        userIndex++;
      } else {
        nodePositions[node.id] = {
          x: centerX + (Math.random() * 400 - 200),
          y: centerY + (Math.random() * 300 - 150),
        };
      }
    });

    return nodePositions;
  }, [graphData]);

  const handleNodeClick = (node) => {
    if (node.memoryId) {
      const mem = memories.find(m => m.id === node.memoryId);
      if (mem) setSelectedMemory(mem);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8f5]/60 dark:bg-[#0e0e12] overflow-hidden">
      {/* Graph Toolbar */}
      <div className="h-14 px-6 border-b border-orange-200/50 dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-[#121217]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <Network className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                Relational Memory Graph
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/30">
                {graphData.nodes.length} Nodes · {graphData.links.length} Relations
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Interactive visual topology mapping persistent knowledge & superseded lineage
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-[#181820] p-1 rounded-xl border border-orange-200/50 dark:border-white/5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              className="p-1.5 rounded-lg text-stone-400 hover:text-orange-500 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-white/10"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 rounded-lg text-stone-400 hover:text-orange-500 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-white/10"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-orange-500 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-white/10 ml-1"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="px-6 py-2 border-b border-orange-100 dark:border-white/5 bg-orange-50/20 dark:bg-[#101015]/50 flex items-center justify-between text-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">User Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">Active Project</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">Current Memory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">Superseded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">Superseding Edge</span>
          </div>
        </div>

        <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold hidden sm:block">
          💡 Click any memory node to inspect telemetry
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center cursor-grab active:cursor-grabbing bg-[radial-gradient(#f9731615_1px,transparent_1px)] [background-size:20px_20px]">
        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200"
        >
          <svg width="900" height="620" className="overflow-visible select-none">
            <defs>
              <linearGradient id="grad-user-warm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="grad-project-warm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Connecting Links */}
            {graphData.links.map((link, idx) => {
              const sourcePos = positionedNodes[link.source];
              const targetPos = positionedNodes[link.target];

              if (!sourcePos || !targetPos) return null;

              const isSupersedeLink = link.type === 'supersede';

              return (
                <g key={idx}>
                  <line
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={isSupersedeLink ? '#f97316' : 'rgba(254, 215, 170, 0.25)'}
                    strokeWidth={isSupersedeLink ? 2.5 : 1.5}
                    strokeDasharray={link.dashed ? '4 4' : 'none'}
                    className={isSupersedeLink ? 'animate-pulse' : ''}
                  />
                  {link.label && (
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2 - 4}
                      fill={isSupersedeLink ? '#f97316' : '#9a8d85'}
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {graphData.nodes.map((node) => {
              const pos = positionedNodes[node.id];
              if (!pos) return null;

              const isUser = node.type === 'user';
              const isProject = node.type === 'project';
              const isHovered = hoveredNode === node.id;
              const isCurrent = node.status === 'CURRENT';
              const isSuperseded = node.status === 'SUPERSEDED';

              const nodeColor = isUser ? '#f97316' : isProject ? '#f59e0b' : isCurrent ? '#10b981' : isSuperseded ? '#f43f5e' : '#a8a29e';

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  {/* Glowing background ring */}
                  <circle
                    r={isUser ? 32 : isProject ? 26 : 18}
                    fill={isUser ? '#f9731625' : isProject ? '#f59e0b25' : isCurrent ? '#10b98120' : isSuperseded ? '#f43f5e20' : '#8c827a15'}
                    stroke={nodeColor}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-all duration-200"
                  />

                  {/* Core Node Circle */}
                  <circle
                    r={isUser ? 24 : isProject ? 20 : 12}
                    fill={isUser ? 'url(#grad-user-warm)' : isProject ? 'url(#grad-project-warm)' : nodeColor}
                    className="shadow-lg transition-transform group-hover:scale-110"
                  />

                  {/* Node Icon */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#ffffff"
                    fontSize={isUser ? "12" : isProject ? "10" : "8"}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="pointer-events-none"
                  >
                    {isUser ? '👤' : isProject ? '🚀' : node.status === 'SUPERSEDED' ? '✕' : '✓'}
                  </text>

                  {/* Label Text */}
                  <g transform={`translate(0, ${isUser ? 42 : isProject ? 34 : 24})`}>
                    <rect
                      x="-60"
                      y="-10"
                      width="120"
                      height="20"
                      rx="6"
                      fill="rgba(22, 22, 29, 0.9)"
                      stroke={isHovered ? '#f97316' : 'rgba(254, 215, 170, 0.2)'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={isHovered ? '#fb923c' : '#f5f0eb'}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="sans-serif"
                    >
                      {node.label.length > 20 ? `${node.label.substring(0, 18)}...` : node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
