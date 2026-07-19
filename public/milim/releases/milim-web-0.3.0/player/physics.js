const STEP_MS = 1000 / 120;
const STEP_SECONDS = 1 / 120;
const MAX_DELTA_MS = 250;
const EPSILON_MS = 1e-9;

export function createSpringPhysics(definitions = [], { reducedMotion = false } = {}) {
  const chains = definitions.map((definition) => ({
    definition,
    position: 0,
    previousPosition: 0,
    velocity: 0,
  }));
  let accumulatorMs = 0;

  return Object.freeze({
    advance(deltaMs, channels = {}) {
      if (reducedMotion) return neutralOutputs(chains);
      const elapsedMs = Number.isFinite(deltaMs)
        ? Math.min(MAX_DELTA_MS, Math.max(0, deltaMs))
        : 0;
      accumulatorMs += elapsedMs;
      while (accumulatorMs + EPSILON_MS >= STEP_MS) {
        for (const chain of chains) integrate(chain, channels);
        accumulatorMs -= STEP_MS;
        if (Math.abs(accumulatorMs) < EPSILON_MS) accumulatorMs = 0;
      }
      return outputs(chains, accumulatorMs / STEP_MS);
    },

    sample() {
      return reducedMotion ? neutralOutputs(chains) : outputs(chains, accumulatorMs / STEP_MS);
    },
  });
}

function integrate(chain, channels) {
  const { definition } = chain;
  const input = definition.inputs.reduce((sum, channel) => {
    const value = channels[channel];
    return sum + (typeof value === "number" && Number.isFinite(value) ? value : 0);
  }, 0);
  const acceleration = (
    input * definition.gain
    + definition.gravity
    - definition.stiffness * chain.position
    - definition.damping * chain.velocity
  ) / definition.mass;
  chain.previousPosition = chain.position;
  chain.velocity += acceleration * STEP_SECONDS;
  chain.position += chain.velocity * STEP_SECONDS;

  const minimum = -definition.limit - definition.rest;
  const maximum = definition.limit - definition.rest;
  if (chain.position < minimum || chain.position > maximum) {
    chain.position = clamp(chain.position, minimum, maximum);
    chain.velocity = 0;
  }
}

function outputs(chains, interpolation) {
  return Object.fromEntries(chains.map((chain) => {
    const position = interpolation === 0
      ? chain.position
      : lerp(chain.previousPosition, chain.position, clamp(interpolation, 0, 1));
    return [
      chain.definition.output,
      clamp(chain.definition.rest + position, -chain.definition.limit, chain.definition.limit),
    ];
  }));
}

function neutralOutputs(chains) {
  return Object.fromEntries(chains.map(({ definition }) => [definition.output, 0]));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
