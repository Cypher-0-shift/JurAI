# JurAI – Governance and Compliance Modules (WIP)

This branch contains initial implementations of **governance and compliance-related modules** for JurAI.  
These components are designed as **post-processing layers** and are currently **not integrated** into the main agent or RAG pipeline.

The purpose of this branch is to define stable, standalone building blocks that can be integrated once the core verdict pipeline is finalized.

---

## Included Components

### Compliance Risk Scoring Engine
**Path:** `scoring/compliance.py`

This module converts a structured legal verdict into numeric and categorical compliance indicators.  
It is intended to make legal outputs easier to interpret for business and reporting use cases.

The scoring engine produces:
- A compliance score (0–100)
- A legal risk category
- Regulatory exposure references
- Estimated penalty ranges
- Confidence propagation

This module is deterministic and does not depend on LLMs, RAG, or external services.

---

### Human Override Layer (Legal Governance)
**Path:** `features/govern/human_override.py`

This module implements a basic human-in-the-loop review mechanism for AI-generated legal verdicts.

It supports:
- Mandatory human review for high-risk cases
- Explicit approval, rejection, or modification
- Manual verdict editing
- Audit logging with reviewer identity, timestamp, and reason
