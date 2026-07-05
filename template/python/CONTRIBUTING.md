# Contributing to __SLUG__

Thanks for looking. __SLUG__ is part of the [.ify](https://ifylab.dev) project.

## Development

Requires [uv](https://docs.astral.sh/uv/).

    uv sync
    uv run ruff check .
    uv run ruff format --check .
    uv run ty check
    uv run pytest

## Terms

Contributions are accepted under the project's Apache 2.0 license (inbound = outbound);
no separate contributor agreement is required. By contributing, you agree the maintainer
may relicense this project at their discretion in future versions.

Add an SPDX header to new source files:

    # SPDX-License-Identifier: Apache-2.0

See [LICENSE](LICENSE) and [NOTICE](NOTICE).
