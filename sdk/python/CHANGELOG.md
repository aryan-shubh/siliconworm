# Changelog

All notable changes to the `siliconworm` Python SDK are documented in this
file. The format is loosely based on [Keep a Changelog][kac], and the project
adheres to [Semantic Versioning][semver].

[kac]: https://keepachangelog.com/en/1.1.0/
[semver]: https://semver.org/spec/v2.0.0.html

## [Unreleased]

## [0.1.0] — 2026-06-03

Initial public release.

### Added

- `Run`, `Summary`, and the module-level `init` / `log` / `finish` API.
- Local-first writer — every run produces `~/.siliconworm/runs/<id>/`
  containing `config.json`, `metrics.jsonl`, `summary.json`, `system.json`.
- Optional HTTP ingest via `SILICONWORM_API_URL` / `SILICONWORM_API_KEY`
  (no-op when unset; never blocks training on the network).
- Automatic environment capture: git sha/branch/dirty, hostname, Python
  version, process argv, GPU info (via torch if available).
- ULID-style run ids, auto-generated `adjective-noun-NNN` run names.
- Background batched flusher (every 2 s or after 64 records).
- Context-manager support; exceptions are recorded as `summary._error` /
  `summary._traceback` before re-raising.
- `atexit` backstop so forgetting to call `.finish()` still produces a
  complete summary on disk.
- Torch tensor / numpy scalar coercion inside `.log()`.
- Examples: `examples/quickstart.py` (no deps) and `examples/mnist.py`
  (real PyTorch training).
