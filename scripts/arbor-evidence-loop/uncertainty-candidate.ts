import { digestJson, loadObservations, readJson, validateDeclaration, claimQuestion, conditionKey, requireFlag, writeOutput, type Declaration } from "./common.js";

const args = process.argv.slice(2);
try {
  const declarationPath = requireFlag("--declaration", args);
  const declarationValue = readJson(declarationPath);
  validateDeclaration(declarationValue);
  const declaration = declarationValue as Declaration;
  const claimId = requireFlag("--claim-id", args);
  const claim = declaration.claims.find((item) => item.id === claimId);
  if (!claim) throw new Error(`claim not found: ${claimId}`);
  const paths: string[] = [];
  for (let i = 0; i < args.length; i++) if (args[i] === "--telemetry") {
    const path = args[++i];
    if (!path) throw new Error("--telemetry requires a file");
    paths.push(path);
  }
  const observations = loadObservations(paths);
  const skillObservations = observations.filter((observation) => observation.composition.loadedSkills.some((skill) => skill.id === declaration.skill.id && skill.contentSha256 === declaration.skill.contentSha256));
  if (!skillObservations.length) throw new Error("telemetry contains no observation for the declaration skill and exact content digest");
  const groups = new Map<string, typeof skillObservations>();
  for (const observation of skillObservations) { const key = conditionKey(observation); const group = groups.get(key) ?? []; group.push(observation); groups.set(key, group); }
  const groupValues = [...groups.values()];
  const outcomes = new Set(skillObservations.map((observation) => observation.signals.outcome.status));
  const withinConditionVariance = groupValues.some((group) => group.length > 1 && (new Set(group.map((o) => `${o.signals.outcome.status}:${o.metrics.latencyMs}:${o.metrics.tokens?.total ?? "na"}`))).size > 1);
  const acrossConditionMismatch = groupValues.length > 1 && new Set(groupValues.map((group) => group.some((o) => o.signals.outcome.status === "succeeded"))).size > 1;
  const decisionBlock = args.includes("--decision-block");
  if (!decisionBlock && !withinConditionVariance && !acrossConditionMismatch && outcomes.size < 2) { writeOutput(null); process.exit(0); }
  const signal = decisionBlock ? "decision-block" : acrossConditionMismatch || outcomes.size > 1 ? "mismatch" : "variance";
  const affectedConditions = groupValues.map((group) => JSON.parse(conditionKey(group[0]))).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const telemetrySource = { schema: "gaia.research-arbor-telemetry-set/v1", observations: skillObservations };
  const candidate = {
    schema: "gaia.research-arbor-uncertainty-candidate/v1",
    skill: declaration.skill,
    target: { declarationSha256: digestJson(declaration), claimId: claim.id, facet: claim.facet },
    question: claimQuestion(declaration, claim),
    affectedConditions,
    signal,
    telemetrySourceSha256: digestJson(telemetrySource),
    cheapestAdequateTargetedBenchmark: {
      type: "one-question-control-treatment",
      question: claimQuestion(declaration, claim),
      controlCondition: affectedConditions[0],
      treatmentCondition: affectedConditions[1] ?? affectedConditions[0],
      reason: "Reuse the observed conditions and vary only the declared skill treatment; the receipt records observations without interpreting them."
    }
  };
  writeOutput(candidate);
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
