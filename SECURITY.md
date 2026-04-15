# Security Policy

## Scope

Luci is currently designed as a local-first app that runs on one machine and binds to `127.0.0.1`.

Please report security issues involving:

- accidental exposure of IMAP or AI secrets
- request forgery or cross-origin bypasses
- unsafe mailbox actions
- remote access to the local server
- command injection, XSS, or sensitive data leakage

## Reporting

Please do not open public GitHub issues for suspected security problems.

Instead, contact the maintainer privately with:

- a short description of the issue
- affected file(s) or route(s)
- reproduction steps
- impact assessment
- any suggested fix if you have one

If private reporting instructions are not yet listed on the repository homepage, open a minimal issue asking for a private contact path without disclosing the vulnerability details.

## Response goals

- acknowledge receipt as soon as practical
- reproduce and assess severity
- fix or mitigate before public disclosure when possible
- document user-facing remediation steps if secrets may have been exposed
