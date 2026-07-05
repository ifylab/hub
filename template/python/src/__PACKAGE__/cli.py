# SPDX-License-Identifier: Apache-2.0
"""Command-line entry point for __SLUG__. Remove this module (and
[project.scripts] in pyproject.toml) if the project is a library, not a CLI."""

import argparse

from __PACKAGE__ import __version__


def main() -> int:
    parser = argparse.ArgumentParser(prog="__SLUG__")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.parse_args()
    return 0
