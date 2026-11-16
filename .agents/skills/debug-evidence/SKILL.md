---
name: "debug-evidence"
description: "Investigate reproducible agent tooling or repository failures by tracing causes and testing hypotheses. Use for bugs and failed checks, not routine feature work."
---
# Debug with causal evidence

Capture the exact failure, command, environment, exit status, and relevant logs. Redact secrets. Reproduce with the smallest representative input before editing; if the failure cannot be reproduced, record that limit and collect the missing evidence.

Trace the failing value or state through the relevant boundary. Compare a known working case and inspect recent changes. For multi-component failures, check each boundary rather than assuming the component named in the final error caused it.

State one testable hypothesis. Change or instrument one relevant factor, run the reproduction, and compare the expected observation with the actual result. A different error or a passing unrelated test does not establish a fix. Avoid stacking speculative changes; preserve unrelated user edits.

Once the cause is supported, make a bounded repair. Add a regression check when it captures meaningful failure behavior and is proportionate to the change. Do not weaken existing checks to make the result pass. Run the original reproduction and relevant checks after the fix.

If repeated attempts do not improve the evidence, stop speculative edits and reassess the model of the failure. Ask for missing access or a product decision only when it blocks useful investigation. Do not restart production systems or alter credentials merely because local diagnosis is incomplete.

Report the supported cause, changed behavior, verification, and remaining limits. If only a workaround is established, label it as a workaround. Do not claim a root cause from correlation alone.
