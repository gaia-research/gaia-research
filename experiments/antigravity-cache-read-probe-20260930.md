# Exploratory experiment minutes: Antigravity cache-read probe

**Date:** 2026-09-30

**Status:** Exploratory observations only: the first two probes used model-specific `off`; the streaming-policy repeat used `streaming` while the core warmer remained inactive. No controlled on/off or active-warmer comparison was made.

## Question

Did disabling Pi's cache warmer make reported cache reads zero, and could it explain zero-read responses in an active tool loop?

## Setup

- Pi model: `antigravity/gemini-3.8-flash`; thinking: `low`; provider package: `pi-antigravity` 0.9.0.
- Effective setting: global `cacheWarming: idle`, overridden for `antigravity/*flash*` to `off`.
- Pi's warmer requires a `model.promptCache` entry to determine a retention TTL. Neither the installed Antigravity model definition nor the local model override configures one. Accordingly, the background replay warmer is not expected to run for this model even in idle mode.

## Observations

Eight assistant requests reported `cacheRead` values of `0, 0, 0, 0, 12175, 12171, 0, 0`. The first zero-read response came 1.758 seconds after the second positive read; the final response came 3.607 seconds later (5.365 seconds after the last positive read). Pi showed no cache-miss notice; estimated misses of about 17.4k and 18.4k tokens were below its 20k-token notice threshold.

## Interpretation and limits

Positive reads and later zero reads occurred in this single off-mode probe. The two zero-read events may be provider cache misses or stream-accounting behavior: the provider maps streamed `usageMetadata.cachedContentTokenCount` to `cacheRead`, defaulting an absent field to zero. The initial probe captured no usage-metadata frames; the follow-up field-presence evidence below narrows, but does not resolve, that ambiguity. This probe does not show that `off` fixed, caused, or was compared against cache misses; it cannot establish cache-read frequency or an on/off effect.

## Next evidence needed

The remaining gap is whether zero reads are upstream cache misses or upstream telemetry omission; distinguishing them would require an authoritative upstream cache/usage signal. Continue to avoid logging request or prompt contents. A warmer on/off A/B remains uninformative for this model unless a cache TTL is configured.

## Follow-up: sanitized usage-frame evidence

A fresh ephemeral Pi process used `antigravity/gemini-3.8-flash`, thinking `low`, and the extension-confirmed `Cache Warming [OFF]` policy. It used only read-only tools in an active loop. A temporary instrumented provider copy persisted only whitelisted usage-metadata field presence/counts, candidate finish reason, and final parsed usage. No request/prompt contents, transcript, secrets, credentials, or session identifiers were captured; the instrumented copy was scratch-only, and no source files were changed.

Across 16 assistant requests, 40 streamed `usageMetadata` frames were observed; `cachedContentTokenCount` was absent in 34. Request 7 ended at prompt count 13,173: its first three frames omitted the field; the final `STOP` frame reported 4,060, matching Pi's `cacheRead=4,060`. Requests 8–11 ended at prompt counts 13,385, 14,748, 16,246, and 15,600; all frames in those requests omitted the field, and Pi ended at `cacheRead=0` for each. Request 12 ended at prompt count 22,089 and its final frame reported 16,263 cached tokens. Requests 13–16 reported final-frame cache reads of 16,255, 20,312, 20,302, and 20,294 at final prompt counts from 22,304 to 22,793.

For requests 8–11, the captured frames all omitted the cached-count field, so no later partial usage frame overwrote an earlier positive value within those responses; Pi's parser defaults an absent count to zero. This does not distinguish a true upstream cache miss from upstream telemetry omission. The larger-context requests show cache reads continuing after the 22k prompt-size range. This off-mode trace does not demonstrate a warming effect: no cache TTL is configured, so Pi's replay warmer is not expected to run even in idle mode, and there was no on/off A/B.

## Follow-up: streaming-policy repeat

A fresh ephemeral Pi process used `antigravity/gemini-3.8-flash`, thinking `low`, read-only tools, and the same active tool-loop sequence. The model-specific `antigravity/*flash*` policy was changed from `off` to `streaming`, which Pi visibly confirmed as `Cache Warming [STREAMING]`.

The repeat had 14 assistant requests and 34 usage-metadata frames. The cached-count field was present in 4 frames and absent in 30. Requests 1–10 ended at `cacheRead=0`. Requests 11–14 ended at `cacheRead=12,172`, `16,261`, `20,317`, and `20,309`, at final prompt counts 16,597, 22,388, 22,517, and 22,644. Pi's `/session` summary showed 3 computed misses totaling 8,527 tokens; no cache-miss notice was visibly rendered during the tool loop.

The `/session` summary also showed global core `cacheWarming: idle` and warmer status `Inactive (cache lifetime unavailable)`. The Antigravity model has no configured prompt-cache TTL, so the background replay warmer was not expected to run even though the model-specific policy was `streaming`. These observations do not test an active warmer or demonstrate an effect of `streaming` versus `off`; do not infer causation from the difference between runs. Upstream actual cache misses versus telemetry omission remain unresolved. These minutes contain no prompt/request contents, transcript, secrets, credentials, or session identifiers.

## Follow-up: controlled medium-thinking replay

A further visible Pi run used `antigravity/gemini-3.8-flash` at thinking `medium`, the unchanged streaming model policy, and a bounded sequence of 12 read-only tool calls in one session. Pi's core warmer remained inactive because the model has no prompt-cache TTL. The instrumented scratch provider recorded only whitelisted usage metadata; each request had two usage frames, and the last frame was marked as the final candidate frame.

| Request | Final prompt tokens | Final cached-count field | Pi `cacheRead` |
|---:|---:|---:|---:|
| 1 | 1,580 | absent | 0 |
| 2 | 2,106 | absent | 0 |
| 3 | 5,013 | absent | 0 |
| 4 | 5,213 | absent | 0 |
| 5 | 5,308 | absent | 0 |
| 6 | 11,895 | absent | 0 |
| 7 | 13,153 | absent | 0 |
| 8 | 14,613 | absent | 0 |
| 9 | 20,369 | absent | 0 |
| 10 | 20,503 | 16,271 | 16,271 |
| 11 | 20,599 | 16,263 | 16,263 |
| 12 | 20,695 | 16,256 | 16,256 |
| 13 | 20,791 | 16,249 | 16,249 |

The first nine final frames omitted `cachedContentTokenCount`; requests 10–13 reported positive values that matched Pi's final `cacheRead` exactly. This rules against a Pi mapping loss for the observed positive values, but cannot distinguish actual upstream misses from omitted telemetry on the first nine requests. The first positive appeared between prompt totals of 20,369 and 20,503 tokens; total prompt size is not the shared-prefix size, so this does not establish a threshold or cause. The transition resembles the earlier medium long-run (first hit on request 11, then 15 positive requests).

No visible cache-miss notice was found in the pane output checked. The replay made 13 model requests and accumulated 161,838 `promptTokenCount` tokens, exceeding the planned 100,000-token cap before completion; no further model calls were made. The conditional 90-second idle-gap check was not run. The raw scratch trace was not committed. No prompts, transcripts, request bodies, credentials, secrets, or source contents were recorded.
