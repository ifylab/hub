# SPDX-License-Identifier: Apache-2.0
import __PACKAGE__
from __PACKAGE__.cli import main


def test_version() -> None:
    assert __PACKAGE__.__version__


def test_cli_runs() -> None:
    assert main() == 0
