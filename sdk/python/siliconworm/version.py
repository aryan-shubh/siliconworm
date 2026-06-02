"""Single source of truth for the SDK version.

Read by pyproject.toml via hatchling's dynamic version, and re-exported from
the package namespace so `siliconworm.__version__` always matches the wheel.
"""

__version__ = "0.1.0"
