import { Fragment } from "react";

export function TriggerAccuracyChart() {
  return (
    <figure className="my-10 p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      <figcaption className="text-sm font-semibold text-slate-200 mb-4">
        Skill Trigger Accuracy & Context Cost Overhead vs. Word Count
      </figcaption>
      <div className="flex flex-wrap gap-4 text-xs mb-4">
        <span className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
          Trigger Accuracy (%)
        </span>
        <span className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />
          Context Cost Overhead (Tokens)
        </span>
      </div>
      <svg viewBox="0 0 600 240" className="w-full h-auto text-slate-100" role="img" aria-label="Trigger Accuracy Chart">
        <line x1="50" y1="30" x2="550" y2="30" stroke="#334155" strokeDasharray="4 4" />
        <line x1="50" y1="80" x2="550" y2="80" stroke="#334155" strokeDasharray="4 4" />
        <line x1="50" y1="130" x2="550" y2="130" stroke="#334155" strokeDasharray="4 4" />
        <line x1="50" y1="180" x2="550" y2="180" stroke="#334155" strokeDasharray="4 4" />

        <line x1="50" y1="180" x2="550" y2="180" stroke="#94a3b8" strokeWidth="2" />
        <line x1="50" y1="30" x2="50" y2="180" stroke="#94a3b8" strokeWidth="2" />

        <text x="70" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">100w (Lean)</text>
        <text x="190" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">300w</text>
        <text x="310" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">500w (Cap)</text>
        <text x="430" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">800w (Bloated)</text>
        <text x="530" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">1200w+</text>

        {/* Trigger Accuracy (Pink) */}
        <path d="M 70 120 Q 190 40, 310 50 T 430 110 T 530 160" fill="none" stroke="#ec4899" strokeWidth="3" />
        <circle cx="70" cy="120" r="4" fill="#ec4899" />
        <circle cx="190" cy="45" r="4" fill="#ec4899" />
        <circle cx="310" cy="50" r="4" fill="#ec4899" />
        <circle cx="430" cy="110" r="4" fill="#ec4899" />
        <circle cx="530" cy="160" r="4" fill="#ec4899" />

        {/* Context Cost (Sky Blue) */}
        <path d="M 70 170 L 190 140 L 310 100 L 430 60 L 530 35" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />
        <circle cx="70" cy="170" r="4" fill="#38bdf8" />
        <circle cx="190" cy="140" r="4" fill="#38bdf8" />
        <circle cx="310" cy="100" r="4" fill="#38bdf8" />
        <circle cx="430" cy="60" r="4" fill="#38bdf8" />
        <circle cx="530" cy="35" r="4" fill="#38bdf8" />
      </svg>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Figure 1: Skills exceeding 500 words experience severe triggering degradation due to context confusion, while token overhead scales linearly.
      </p>
    </figure>
  );
}

export function RetirementCurveChart() {
  return (
    <figure className="my-10 p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      <figcaption className="text-sm font-semibold text-slate-200 mb-4">
        Capability Skill Retirement vs. Base Model Intelligence
      </figcaption>
      <div className="flex flex-wrap gap-4 text-xs mb-4">
        <span className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          Base Model Alone (%)
        </span>
        <span className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
          Model + Capability Skill (%)
        </span>
      </div>
      <svg viewBox="0 0 600 240" className="w-full h-auto text-slate-100" role="img" aria-label="Retirement Curve Chart">
        <line x1="50" y1="30" x2="550" y2="30" stroke="#334155" strokeDasharray="4 4" />
        <line x1="50" y1="100" x2="550" y2="100" stroke="#334155" strokeDasharray="4 4" />
        <line x1="50" y1="170" x2="550" y2="170" stroke="#334155" strokeDasharray="4 4" />

        <line x1="50" y1="170" x2="550" y2="170" stroke="#94a3b8" strokeWidth="2" />
        <line x1="50" y1="30" x2="50" y2="170" stroke="#94a3b8" strokeWidth="2" />

        <text x="100" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 1.5</text>
        <text x="250" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 2.0</text>
        <text x="400" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 3.0</text>
        <text x="500" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 3.5+</text>

        <path d="M 100 150 L 250 110 L 400 55 L 500 45" fill="none" stroke="#22c55e" strokeWidth="3" />
        <path d="M 100 70 L 250 55 L 400 48 L 500 45" fill="none" stroke="#ec4899" strokeWidth="3" />

        <line x1="380" y1="30" x2="380" y2="170" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
        <text x="385" y="42" fill="#f59e0b" fontSize="10" fontWeight="bold">RETIREMENT POINT</text>
      </svg>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Figure 2: Capability skills provide significant uplifts on earlier model generations (+40%), but performance converges as base models mature. Continuous ablation testing identifies the exact point where a skill can be safely retired.
      </p>
    </figure>
  );
}
