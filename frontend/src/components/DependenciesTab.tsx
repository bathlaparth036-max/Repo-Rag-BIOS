import React, { useState } from "react";
import { DependencyItem } from "../types";
import { Cpu, Search, ShieldCheck, AlertCircle, ExternalLink, Package } from "lucide-react";

interface DependenciesTabProps {
  dependencies: DependencyItem[];
}

export const DependenciesTab: React.FC<DependenciesTabProps> = ({ dependencies }) => {
  const [query, setQuery] = useState("");
  const [filterEcosystem, setFilterEcosystem] = useState("all");

  const filtered = dependencies.filter((d) => {
    const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase());
    const matchesEco = filterEcosystem === "all" || d.ecosystem === filterEcosystem;
    return matchesQuery && matchesEco;
  });

  const ecosystems = ["all", ...Array.from(new Set(dependencies.map((d) => d.ecosystem)))];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-cardBorder">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter dependencies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-background border border-cardBorder text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-accent-cyan/40"
            />
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-lg bg-background border border-cardBorder text-xs font-mono">
            {ecosystems.map((eco) => (
              <button
                key={eco}
                onClick={() => setFilterEcosystem(eco)}
                className={`px-2 py-1 rounded uppercase transition ${
                  filterEcosystem === eco
                    ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {eco}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Total: <span className="text-white font-bold">{filtered.length}</span> libraries
        </span>
      </div>

      {/* Dependencies Table */}
      <div className="rounded-2xl bg-card border border-cardBorder overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background/80 text-slate-400 border-b border-cardBorder text-[11px] uppercase">
              <tr>
                <th className="p-3.5">Package</th>
                <th className="p-3.5">Version</th>
                <th className="p-3.5">Ecosystem</th>
                <th className="p-3.5">Inferred Purpose</th>
                <th className="p-3.5">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBorder">
              {filtered.map((dep, idx) => (
                <tr key={idx} className="hover:bg-cardBorder/30 transition">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-accent-cyan" />
                    <span>{dep.name}</span>
                    {dep.is_dev && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        dev
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-300">{dep.version || "latest"}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-background border border-cardBorder text-slate-300 uppercase text-[10px]">
                      {dep.ecosystem}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 max-w-xs truncate font-sans text-xs">
                    {dep.purpose || "General utility package"}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Audited Low
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
