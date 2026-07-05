// SPDX-License-Identifier: Apache-2.0
using Xunit;

namespace __NAME__.Tests;

public class SmokeTests
{
    [Fact]
    public void VersionIsSet() => Assert.False(string.IsNullOrEmpty(Info.Version));
}
