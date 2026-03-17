"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// --- Pixel art character definitions (8x8 grids) ---
// Each character is an 8x8 grid where each cell is a color string or "" for transparent

type PixelGrid = string[][];

interface AgentRole {
  name: string;
  label: string;
  grid: PixelGrid;
  idleFrames?: PixelGrid[];
  description: string;
}

const C = {
  skin: "#ffdbac",
  skinDark: "#e8b88a",
  hair: "#4a3728",
  eye: "#222",
  shirt: "#4a90d9",
  pants: "#2c3e6b",
  shoe: "#333",
  // Role-specific
  crown: "#ffd700",
  crownGem: "#e74c3c",
  glasses: "#87ceeb",
  glassesFrame: "#555",
  labCoat: "#f0f0f0",
  pencil: "#f4c542",
  pencilTip: "#333",
  clipboard: "#d4a574",
  clipboardPaper: "#fff",
  wrench: "#888",
  shield: "#e74c3c",
  shieldStar: "#ffd700",
  searchGlass: "#87ceeb",
  searchFrame: "#666",
  hardhat: "#f39c12",
  beret: "#9b59b6",
  headset: "#27ae60",
};

const _ = ""; // transparent

// Lead agent - has a golden crown
const leadGrid: PixelGrid = [
  [_, C.crown, C.crown, C.crown, C.crown, C.crown, C.crown, _],
  [_, C.crownGem, C.crown, C.crownGem, C.crownGem, C.crown, C.crownGem, _],
  [_, C.hair, C.hair, C.hair, C.hair, C.hair, C.hair, _],
  [_, C.skin, C.eye, C.skin, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, C.shirt, C.shirt, C.shirt, C.shirt, _, _],
  [_, C.skin, C.shirt, C.shirt, C.shirt, C.shirt, C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Researcher - glasses + magnifying glass accent
const researcherGrid: PixelGrid = [
  [_, _, C.hair, C.hair, C.hair, C.hair, _, _],
  [_, C.hair, C.hair, C.hair, C.hair, C.hair, C.hair, _],
  [_, C.skin, C.glassesFrame, C.skin, C.skin, C.glassesFrame, C.skin, _],
  [_, C.skin, C.glasses, C.glassesFrame, C.glassesFrame, C.glasses, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, C.labCoat, C.labCoat, C.labCoat, C.labCoat, _, _],
  [_, C.skin, C.labCoat, C.labCoat, C.labCoat, C.labCoat, C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Analyst - beret + charts vibe (purple beret)
const analystGrid: PixelGrid = [
  [_, C.beret, C.beret, C.beret, C.beret, C.beret, _, _],
  [C.beret, C.beret, C.beret, C.beret, C.beret, C.beret, C.beret, _],
  [_, C.hair, C.hair, C.hair, C.hair, C.hair, _, _],
  [_, C.skin, C.eye, C.skin, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skinDark, C.skin, C.skin, C.skin, _],
  [_, _, "#2ecc71", "#2ecc71", "#2ecc71", "#2ecc71", _, _],
  [_, C.skin, "#2ecc71", "#2ecc71", "#2ecc71", "#2ecc71", C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Writer - pencil behind ear, warm shirt
const writerGrid: PixelGrid = [
  [_, _, C.hair, C.hair, C.hair, C.hair, C.pencil, _],
  [_, C.hair, C.hair, C.hair, C.hair, C.hair, C.pencilTip, _],
  [_, C.hair, C.hair, C.hair, C.hair, C.hair, C.hair, _],
  [_, C.skin, C.eye, C.skin, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, "#e67e22", "#e67e22", "#e67e22", "#e67e22", _, _],
  [_, C.skin, "#e67e22", "#e67e22", "#e67e22", "#e67e22", C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Builder - hard hat, tool belt
const builderGrid: PixelGrid = [
  [_, C.hardhat, C.hardhat, C.hardhat, C.hardhat, C.hardhat, C.hardhat, _],
  [C.hardhat, C.hardhat, C.hardhat, C.hardhat, C.hardhat, C.hardhat, C.hardhat, C.hardhat],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, C.skin, C.eye, C.skin, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, "#e74c3c", "#e74c3c", "#e74c3c", "#e74c3c", _, _],
  [_, C.wrench, "#e74c3c", "#e74c3c", "#e74c3c", "#e74c3c", C.wrench, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Reviewer - headset, green shirt
const reviewerGrid: PixelGrid = [
  [_, _, C.hair, C.hair, C.hair, C.hair, _, _],
  [C.headset, C.hair, C.hair, C.hair, C.hair, C.hair, C.hair, _],
  [C.headset, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, C.skin, C.eye, C.skin, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, C.headset, C.headset, C.headset, C.headset, _, _],
  [_, C.skin, C.headset, C.headset, C.headset, C.headset, C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Security agent - shield emblem, red accents
const securityGrid: PixelGrid = [
  [_, _, "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", _, _],
  [_, "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, C.skin, C.eye, C.skin, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, "#1a1a2e", C.shield, C.shield, "#1a1a2e", _, _],
  [_, C.skin, "#1a1a2e", C.shieldStar, C.shieldStar, "#1a1a2e", C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

// Explorer agent - has a search glass look
const explorerGrid: PixelGrid = [
  [_, _, C.hair, C.hair, C.hair, C.hair, _, _],
  [_, C.hair, C.hair, C.hair, C.hair, C.hair, C.hair, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, C.skin, C.searchFrame, C.searchGlass, C.skin, C.eye, C.skin, _],
  [_, C.skin, C.skin, C.skin, C.skin, C.skin, C.skin, _],
  [_, _, "#8e44ad", "#8e44ad", "#8e44ad", "#8e44ad", _, _],
  [_, C.skin, "#8e44ad", "#8e44ad", "#8e44ad", "#8e44ad", C.skin, _],
  [_, _, C.pants, C.pants, C.pants, C.pants, _, _],
];

const AGENT_ROLES: AgentRole[] = [
  { name: "researcher", label: "Researcher", grid: researcherGrid, description: "Deep investigation & web research" },
  { name: "analyst", label: "Analyst", grid: analystGrid, description: "Data analysis & pattern finding" },
  { name: "writer", label: "Writer", grid: writerGrid, description: "Documentation & content creation" },
  { name: "builder", label: "Builder", grid: builderGrid, description: "Code implementation & fixes" },
  { name: "reviewer", label: "Reviewer", grid: reviewerGrid, description: "Code review & quality checks" },
  { name: "security", label: "Security", grid: securityGrid, description: "Security audit & vulnerability scan" },
  { name: "explorer", label: "Explorer", grid: explorerGrid, description: "Codebase exploration & discovery" },
];

// --- Pixel rendering ---

function PixelCharacter({
  grid,
  size = 6,
  className = "",
  style = {},
}: {
  grid: PixelGrid;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(8, ${size}px)`,
        gridTemplateRows: `repeat(8, ${size}px)`,
        imageRendering: "pixelated",
        ...style,
      }}
    >
      {grid.flat().map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: color || "transparent",
          }}
        />
      ))}
    </div>
  );
}

// --- Break room door ---

function BreakRoomDoor({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Door frame */}
      <div className="relative w-16 h-24 border-4 border-amber-800 bg-amber-900 rounded-t-lg overflow-hidden">
        {/* Door panel */}
        <div
          className="absolute inset-0 bg-amber-700 transition-transform duration-500 origin-left"
          style={{
            transform: isOpen ? "perspective(600px) rotateY(-70deg)" : "perspective(600px) rotateY(0deg)",
          }}
        >
          {/* Door handle */}
          <div className="absolute right-1.5 top-1/2 w-2 h-2 rounded-full bg-yellow-500" />
          {/* Door window */}
          <div className="absolute left-2 top-2 right-2 h-6 bg-amber-500/30 rounded-sm" />
        </div>
        {/* Light from inside when open */}
        {isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 to-transparent" />
        )}
      </div>
      {/* Sign */}
      <div className="mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-[9px] font-mono font-bold text-amber-800 dark:text-amber-200 rounded border border-amber-300 dark:border-amber-700">
        BREAK ROOM
      </div>
    </div>
  );
}

// --- Main component ---

interface TeamAgent {
  id: string;
  role: AgentRole;
  flags: string[];
  state: "entering" | "idle" | "working";
  addedAt: number;
}

interface PixelAgentTeamProps {
  interactionKey?: string;
  onComplete?: (key: string, userInput: string) => void;
  isComplete?: boolean;
}

export function PixelAgentTeam({ interactionKey, onComplete, isComplete }: PixelAgentTeamProps) {
  const [team, setTeam] = useState<TeamAgent[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(AGENT_ROLES[0].name);
  const [flagInput, setFlagInput] = useState("");
  const [doorOpen, setDoorOpen] = useState(false);
  const [leadCalling, setLeadCalling] = useState(false);
  const [leadBobFrame, setLeadBobFrame] = useState(0);
  const teamAreaRef = useRef<HTMLDivElement>(null);

  // Lead agent idle bob animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLeadBobFrame((f) => (f + 1) % 2);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Transition entering agents to idle after animation
  useEffect(() => {
    const entering = team.filter((a) => a.state === "entering");
    if (entering.length === 0) return;

    const timers = entering.map((agent) =>
      setTimeout(() => {
        setTeam((prev) =>
          prev.map((a) => (a.id === agent.id ? { ...a, state: "idle" } : a))
        );
      }, 1200)
    );

    return () => timers.forEach(clearTimeout);
  }, [team]);

  const addAgent = useCallback(() => {
    const role = AGENT_ROLES.find((r) => r.name === selectedRole);
    if (!role) return;

    const flags = flagInput
      .split(/\s+/)
      .filter((f) => f.startsWith("--"))
      .map((f) => f.trim());

    // Lead calling animation
    setLeadCalling(true);
    setTimeout(() => setDoorOpen(true), 300);

    setTimeout(() => {
      const newAgent: TeamAgent = {
        id: `${role.name}-${Date.now()}`,
        role,
        flags,
        state: "entering",
        addedAt: Date.now(),
      };

      setTeam((prev) => [...prev, newAgent]);

      // Close door after agent enters
      setTimeout(() => {
        setDoorOpen(false);
        setLeadCalling(false);
      }, 800);
    }, 600);

    setFlagInput("");
  }, [selectedRole, flagInput]);

  const removeAgent = useCallback((id: string) => {
    setTeam((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const selectedRoleInfo = AGENT_ROLES.find((r) => r.name === selectedRole);

  // Lead agent calling frame - arm raised
  const leadCallingGrid: PixelGrid = leadGrid.map((row, ri) => {
    if (ri === 5) return [_, C.skin, C.shirt, C.shirt, C.shirt, C.shirt, _, _];
    if (ri === 6) return [_, C.skin, C.shirt, C.shirt, C.shirt, C.shirt, _, _];
    return [...row];
  });

  const hasDangerFlag = team.some((a) =>
    a.flags.some((f) => f.includes("dangerously"))
  );

  return (
    <div className="my-8 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 not-prose">
      <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-1">
        Agent Team Builder
      </h3>
      <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
        Build your agent team. The lead calls in specialists from the break room.
      </p>

      {/* Stage area */}
      <div
        ref={teamAreaRef}
        className="relative flex items-end gap-4 p-6 min-h-[160px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden mb-4"
      >
        {/* Floor line */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-t border-slate-400 dark:border-slate-600" />

        {/* Lead agent */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            style={{
              transform: `translateY(${leadBobFrame === 1 ? -2 : 0}px)`,
              transition: "transform 0.4s ease-in-out",
            }}
          >
            <PixelCharacter
              grid={leadCalling ? leadCallingGrid : leadGrid}
              size={6}
              className={leadCalling ? "animate-pulse" : ""}
            />
          </div>
          <span className="mt-1 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
            LEAD
          </span>
          {leadCalling && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-700 text-[9px] font-mono px-1.5 py-0.5 rounded shadow-md border whitespace-nowrap animate-bounce">
              Hey! Need you out here!
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="relative z-10 h-16 w-px bg-slate-400/50 dark:bg-slate-600/50 mx-1" />

        {/* Team agents */}
        <div className="relative z-10 flex items-end gap-3 flex-wrap">
          {team.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => removeAgent(agent.id)}
              title="Click to remove"
              style={{
                animation:
                  agent.state === "entering"
                    ? "slideInFromRight 0.8s ease-out forwards"
                    : undefined,
              }}
            >
              <div
                style={{
                  transform: `translateY(${agent.state === "idle" && (agent.addedAt % 2 === 0 ? leadBobFrame : 1 - leadBobFrame) === 1 ? -2 : 0}px)`,
                  transition: "transform 0.4s ease-in-out",
                }}
              >
                <PixelCharacter grid={agent.role.grid} size={5} />
              </div>
              <span className="mt-0.5 text-[9px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap group-hover:text-red-500 transition-colors">
                {agent.role.label}
              </span>
              {agent.flags.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5 max-w-[80px] justify-center">
                  {agent.flags.map((flag, fi) => (
                    <span
                      key={fi}
                      className={`text-[7px] font-mono px-1 rounded ${
                        flag.includes("dangerously")
                          ? "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}
              {/* Remove X on hover */}
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                x
              </div>
            </div>
          ))}

          {team.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic ml-2 mb-4">
              No agents yet. Add one from the break room!
            </span>
          )}
        </div>

        {/* Break room door */}
        <div className="absolute right-4 bottom-6 z-10">
          <BreakRoomDoor isOpen={doorOpen} />
        </div>
      </div>

      {/* Danger flag warning */}
      {hasDangerFlag && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 font-mono">
          Warning: An agent has <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">--dangerously-skip-permissions</code> enabled. This agent will bypass all permission checks.
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Role selector */}
        <div className="flex-1">
          <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            Agent Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {AGENT_ROLES.map((role) => (
              <option key={role.name} value={role.name}>
                {role.label} — {role.description}
              </option>
            ))}
          </select>
        </div>

        {/* Flags input */}
        <div className="flex-1">
          <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            Flags (e.g. --dangerously-skip-permissions)
          </label>
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="--flag-name"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") addAgent();
            }}
          />
        </div>

        {/* Add button */}
        <div className="flex items-end">
          <button
            onClick={addAgent}
            disabled={leadCalling}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-mono font-bold transition-colors whitespace-nowrap"
          >
            {leadCalling ? "Calling..." : "+ Add Agent"}
          </button>
        </div>
      </div>

      {/* Selected role preview */}
      {selectedRoleInfo && (
        <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <PixelCharacter grid={selectedRoleInfo.grid} size={5} />
          <div>
            <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
              {selectedRoleInfo.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {selectedRoleInfo.description}
            </div>
          </div>
        </div>
      )}

      {/* Team summary */}
      {team.length > 0 && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">
            Team Composition ({team.length} agent{team.length !== 1 ? "s" : ""})
          </div>
          <div className="text-sm font-mono text-indigo-800 dark:text-indigo-200">
            Lead {"->"}{" "}
            {team.map((a, i) => (
              <span key={a.id}>
                {a.role.label}
                {a.flags.length > 0 && (
                  <span className="text-red-500 text-xs"> [{a.flags.join(" ")}]</span>
                )}
                {i < team.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(120px);
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
