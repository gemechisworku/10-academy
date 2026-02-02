# Reflection on Copilot Instruction Updates

## What I did

I kept the existing MCP guardrail and trigger-compliance rules unchanged, since they are mandatory for the assessment environment.

On top of that, I added a **capability layer** focused on how the AI agent should think and work once compliance requirements are satisfied. The main additions were:

- A clear **Plan → Execute → Verify** workflow
- Explicit instructions to restate the problem, list assumptions, and ask clarifying questions
- Guidance on incremental code changes and respecting existing patterns
- Verification expectations (tests, correctness checks, explicit limitations)
- Simple learning and feedback guidance to reduce repeated mistakes

The goal was not to loosen guardrails, but to complement them with reasoning and coding guidance.

---

## What worked

- Adding a mandatory **planning step** significantly improved structure and reduced guesswork.
- Explicit **verification requirements** led to more consistent test coverage and correctness checks.
- Clear rules for **when to stop and ask questions** reduced silent assumptions.
- Separating compliance rules from reasoning rules made the instructions easier to follow and more effective.
- The updated instructions worked well even for small, function-only tasks.

---

## What didn’t work

- Overly strict or repetitive enforcement language (outside the mandatory guardrails) reduced clarity and added noise.
- Without concrete guidance on planning and verification, the AI tended to jump straight into implementation.
- Some early drafts tried to do too much at once; simplifying the language improved adherence.

These issues were addressed by removing redundancy, keeping rules declarative, and focusing on practical coding behavior.

---

## Insights gained

- Guardrails define **what the AI must not do**, but they do not define **how the AI should think**.
- Adding structured rules for planning and verification shifts the AI from reactive code generation to deliberate problem-solving.
- Clear stop conditions and clarification rules reduce hallucination more effectively than strict enforcement alone.
- Well-scoped rules align the AI’s behavior with the developer’s intent, expectations, and thought process without increasing complexity.
- Small, explicit workflow rules compound over time and lead to more predictable, higher-quality outputs.

Overall, rules are most effective when they guide reasoning and decision-making, not just compliance.
