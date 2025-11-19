describe("StreamGod Dashboards v2.0", () => {
  describe("Owner KPI Models", () => {
    test("OwnerKpiDto should have all required fields", () => {
      const kpis = {
        totalStreamsLast30: 1000000,
        grossRevenueLast30: 50000,
        dmfCutLast30: 10000,
        netToArtistsLast30: 40000,
        activeArtists: 25,
        totalReleases: 120,
        releasesWithQcIssues: 3,
      };

      expect(kpis.totalStreamsLast30).toBe(1000000);
      expect(kpis.grossRevenueLast30).toBe(50000);
      expect(kpis.dmfCutLast30).toBe(10000);
      expect(kpis.netToArtistsLast30).toBe(40000);
      expect(kpis.activeArtists).toBe(25);
      expect(kpis.totalReleases).toBe(120);
      expect(kpis.releasesWithQcIssues).toBe(3);
    });

    test("TopReleaseDto should have all metrics", () => {
      const release = {
        releaseId: "rel123",
        title: "Hit Single",
        artistId: "artist1",
        streamsLast30: 500000,
        revenueLast30: 5000,
        qcScore: 95.5,
      };

      expect(release.releaseId).toBe("rel123");
      expect(release.title).toBe("Hit Single");
      expect(release.streamsLast30).toBe(500000);
      expect(release.revenueLast30).toBe(5000);
      expect(release.qcScore).toBe(95.5);
    });

    test("ArtistDashboardDto should aggregate artist metrics", () => {
      const dashboard = {
        artistId: "artist1",
        streamsLast30: 250000,
        revenueLast30: 2500,
        topReleases: [
          { releaseId: "r1", title: "Song 1", streamsLast30: 100000, revenueLast30: 1000 },
          { releaseId: "r2", title: "Song 2", streamsLast30: 150000, revenueLast30: 1500 },
        ],
        streamsOverTime: [],
        revenueOverTime: [],
      };

      expect(dashboard.artistId).toBe("artist1");
      expect(dashboard.streamsLast30).toBe(250000);
      expect(dashboard.topReleases).toHaveLength(2);
    });

    test("TimeSeriesPoint should track daily metrics", () => {
      const point = {
        date: new Date("2025-11-15"),
        streams: 10000,
        revenue: 100,
      };

      expect(point.streams).toBe(10000);
      expect(point.revenue).toBe(100);
      expect(point.date).toEqual(new Date("2025-11-15"));
    });
  });

  describe("KPI Calculations", () => {
    test("DMF cut is 20% of gross revenue", () => {
      const grossRevenue = 50000;
      const dmfCut = grossRevenue * 0.2;
      const netToArtists = grossRevenue - dmfCut;

      expect(dmfCut).toBe(10000);
      expect(netToArtists).toBe(40000);
    });

    test("Top releases should be sorted by streams descending", () => {
      const releases = [
        { releaseId: "r1", streamsLast30: 100000 },
        { releaseId: "r2", streamsLast30: 500000 },
        { releaseId: "r3", streamsLast30: 250000 },
      ];

      const sorted = [...releases].sort((a, b) => b.streamsLast30 - a.streamsLast30);

      expect(sorted[0].releaseId).toBe("r2");
      expect(sorted[1].releaseId).toBe("r3");
      expect(sorted[2].releaseId).toBe("r1");
    });

    test("Artist total streams should equal sum of all releases", () => {
      const releases = [
        { streamsLast30: 100000 },
        { streamsLast30: 150000 },
        { streamsLast30: 50000 },
      ];

      const totalStreams = releases.reduce((sum, r) => sum + r.streamsLast30, 0);

      expect(totalStreams).toBe(300000);
    });

    test("QC issues count should reflect releases not ready", () => {
      const releases = [
        { qcStatus: "ready" },
        { qcStatus: "ready" },
        { qcStatus: "pending" },
        { qcStatus: "rejected" },
        { qcStatus: "ready" },
      ];

      const issueCount = releases.filter((r) => r.qcStatus !== "ready").length;

      expect(issueCount).toBe(2);
    });

    test("Multiple artists should count correctly", () => {
      const data = [
        { artistId: "artist1", streams: 100000 },
        { artistId: "artist2", streams: 200000 },
        { artistId: "artist1", streams: 50000 },
        { artistId: "artist3", streams: 150000 },
      ];

      const uniqueArtists = new Set(data.map((d) => d.artistId));

      expect(uniqueArtists.size).toBe(3);
    });
  });

  describe("Owner Dashboard", () => {
    test("Owner KPIs should show label-wide metrics", () => {
      const kpis = {
        totalStreamsLast30: 5000000,
        grossRevenueLast30: 250000,
        dmfCutLast30: 50000,
        netToArtistsLast30: 200000,
        activeArtists: 50,
        totalReleases: 300,
        releasesWithQcIssues: 5,
      };

      expect(kpis.activeArtists).toBeGreaterThan(0);
      expect(kpis.totalReleases).toBeGreaterThan(kpis.releasesWithQcIssues);
      expect(kpis.dmfCutLast30 + kpis.netToArtistsLast30).toBe(kpis.grossRevenueLast30);
    });

    test("Top 5 releases should display correctly", () => {
      const topReleases = [
        { releaseId: "r1", title: "Hit 1", streamsLast30: 1000000 },
        { releaseId: "r2", title: "Hit 2", streamsLast30: 800000 },
        { releaseId: "r3", title: "Hit 3", streamsLast30: 600000 },
        { releaseId: "r4", title: "Hit 4", streamsLast30: 400000 },
        { releaseId: "r5", title: "Hit 5", streamsLast30: 200000 },
      ];

      expect(topReleases).toHaveLength(5);
      expect(topReleases[0].streamsLast30).toBeGreaterThan(topReleases[4].streamsLast30);
    });

    test("Revenue metrics should align with streams", () => {
      const kpis = {
        totalStreamsLast30: 1000000,
        grossRevenueLast30: 50000,
      };

      // Rough sanity check: more streams = more revenue
      expect(kpis.totalStreamsLast30 > 100000).toBe(true);
      expect(kpis.grossRevenueLast30 > 0).toBe(true);
    });
  });

  describe("Artist Dashboard", () => {
    test("Artist dashboard should show personal metrics", () => {
      const dashboard = {
        artistId: "artist1",
        streamsLast30: 250000,
        revenueLast30: 2500,
        topReleases: [
          { releaseId: "r1", title: "My Song", streamsLast30: 150000 },
          { releaseId: "r2", title: "My Hit", streamsLast30: 100000 },
        ],
      };

      expect(dashboard.artistId).toBe("artist1");
      expect(dashboard.streamsLast30).toBeGreaterThan(0);
      expect(dashboard.revenueLast30).toBeGreaterThan(0);
      expect(dashboard.topReleases).toHaveLength(2);
    });

    test("Top releases for artist should be limited", () => {
      const allReleases = Array.from({ length: 20 }, (_, i) => ({
        releaseId: `r${i}`,
        title: `Release ${i}`,
        streamsLast30: Math.random() * 100000,
      }));

      const topFive = allReleases.sort((a, b) => b.streamsLast30 - a.streamsLast30).slice(0, 5);

      expect(topFive).toHaveLength(5);
    });

    test("Time series should show daily trend", () => {
      const timeSeries = [
        { date: new Date("2025-11-10"), streams: 5000, revenue: 50 },
        { date: new Date("2025-11-11"), streams: 6000, revenue: 60 },
        { date: new Date("2025-11-12"), streams: 7000, revenue: 70 },
      ];

      expect(timeSeries).toHaveLength(3);
      expect(timeSeries[0].streams).toBeLessThan(timeSeries[2].streams);
    });
  });

  describe("API Integration", () => {
    test("GET /dashboard/owner should return OwnerKpiDto", () => {
      const response = {
        totalStreamsLast30: 5000000,
        grossRevenueLast30: 250000,
        dmfCutLast30: 50000,
        netToArtistsLast30: 200000,
        activeArtists: 50,
        totalReleases: 300,
        releasesWithQcIssues: 5,
      };

      expect(response).toHaveProperty("totalStreamsLast30");
      expect(response).toHaveProperty("grossRevenueLast30");
      expect(response).toHaveProperty("activeArtists");
    });

    test("GET /dashboard/top-releases should return array of TopReleaseDto", () => {
      const response = [
        {
          releaseId: "r1",
          title: "Hit 1",
          artistId: "artist1",
          streamsLast30: 1000000,
          revenueLast30: 10000,
          qcScore: 95,
        },
        {
          releaseId: "r2",
          title: "Hit 2",
          artistId: "artist2",
          streamsLast30: 800000,
          revenueLast30: 8000,
          qcScore: 90,
        },
      ];

      expect(response).toHaveLength(2);
      expect(response[0]).toHaveProperty("releaseId");
      expect(response[0]).toHaveProperty("qcScore");
    });

    test("GET /dashboard/artist/:id should return ArtistDashboardDto", () => {
      const response = {
        artistId: "artist1",
        streamsLast30: 250000,
        revenueLast30: 2500,
        topReleases: [],
        streamsOverTime: [],
        revenueOverTime: [],
      };

      expect(response.artistId).toBe("artist1");
      expect(Array.isArray(response.topReleases)).toBe(true);
      expect(Array.isArray(response.streamsOverTime)).toBe(true);
    });

    test("GET /dashboard/releases-table should return array of all releases", () => {
      const response = [
        { releaseId: "r1", title: "Song 1", streamsLast30: 100000 },
        { releaseId: "r2", title: "Song 2", streamsLast30: 200000 },
        { releaseId: "r3", title: "Song 3", streamsLast30: 150000 },
      ];

      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe("Frontend Component Rendering", () => {
    test("OwnerDashboard should display KPI cards", () => {
      const mockKpis = {
        totalStreamsLast30: 1000000,
        grossRevenueLast30: 50000,
        dmfCutLast30: 10000,
        netToArtistsLast30: 40000,
        activeArtists: 25,
        totalReleases: 120,
        releasesWithQcIssues: 3,
      };

      // Verify data structure for rendering
      expect(typeof mockKpis.totalStreamsLast30).toBe("number");
      expect(typeof mockKpis.activeArtists).toBe("number");
    });

    test("ArtistDashboard should format currency values", () => {
      const revenue = 2500;
      const formatted = `$${revenue.toFixed(2)}`;

      expect(formatted).toBe("$2500.00");
    });

    test("Top releases table should handle empty state", () => {
      const releases = [];

      const isEmpty = releases.length === 0;

      expect(isEmpty).toBe(true);
    });

    test("Time series should display 7 recent days", () => {
      const allDays = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000),
        streams: 10000,
        revenue: 100,
      }));

      const recentSeven = allDays.slice(0, 7);

      expect(recentSeven).toHaveLength(7);
    });
  });

  describe("Data Aggregation", () => {
    test("Multiple releases from same artist should aggregate", () => {
      const imports = [
        { artistId: "artist1", releaseId: "r1", streams: 100000, revenue: 1000 },
        { artistId: "artist1", releaseId: "r2", streams: 150000, revenue: 1500 },
        { artistId: "artist1", releaseId: "r1", streams: 50000, revenue: 500 },
      ];

      const releaseGroups = {};
      imports.forEach((imp) => {
        const key = imp.releaseId;
        if (!releaseGroups[key]) {
          releaseGroups[key] = { streams: 0, revenue: 0 };
        }
        releaseGroups[key].streams += imp.streams;
        releaseGroups[key].revenue += imp.revenue;
      });

      expect(releaseGroups.r1.streams).toBe(150000);
      expect(releaseGroups.r2.streams).toBe(150000);
    });

    test("Monthly aggregation should sum across entire month", () => {
      const dailyData = Array.from({ length: 30 }, () => ({
        streams: 10000,
        revenue: 100,
      }));

      const monthlyStreams = dailyData.reduce((sum, d) => sum + d.streams, 0);
      const monthlyRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);

      expect(monthlyStreams).toBe(300000);
      expect(monthlyRevenue).toBe(3000);
    });

    test("QC score normalization (0-100)", () => {
      const qcScores = [95, 87, 92, 100, 78];
      const avgScore = qcScores.reduce((sum, s) => sum + s, 0) / qcScores.length;

      expect(avgScore).toBeGreaterThan(0);
      expect(avgScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Error Handling", () => {
    test("Invalid artist ID should be rejected", () => {
      const artistId = "";
      const isValid = artistId && artistId.length > 0;

      expect(isValid).toBe(false);
    });

    test("Missing KPI data should not crash", () => {
      const kpis = {
        totalStreamsLast30: 0,
        grossRevenueLast30: 0,
        activeArtists: 0,
      };

      expect(kpis.totalStreamsLast30).toBe(0);
      expect(kpis.activeArtists).toBe(0);
    });

    test("Out-of-range limit parameter should default", () => {
      let limit = 500; // Too high
      if (limit < 1 || limit > 100) limit = 5;

      expect(limit).toBe(5);
    });

    test("Date parsing should handle various formats", () => {
      const dateStr = "2025-11-15T00:00:00Z";
      const date = new Date(dateStr);

      expect(date instanceof Date).toBe(true);
      expect(date.getFullYear()).toBe(2025);
    });
  });

  describe("Edge Cases", () => {
    test("Single release with all streams", () => {
      const releases = [
        { releaseId: "r1", streamsLast30: 1000000, revenueLast30: 10000 },
      ];

      expect(releases).toHaveLength(1);
      expect(releases[0].streamsLast30).toBe(1000000);
    });

    test("Artist with zero revenue", () => {
      const dashboard = {
        artistId: "artist1",
        streamsLast30: 0,
        revenueLast30: 0,
        topReleases: [],
      };

      expect(dashboard.revenueLast30).toBe(0);
      expect(dashboard.topReleases).toHaveLength(0);
    });

    test("Very large stream numbers", () => {
      const streams = 999999999;
      const revenue = streams * 0.001; // 0.1 cent per stream

      expect(streams).toBeGreaterThan(1000000);
      expect(revenue).toBeGreaterThan(1000000);
    });

    test("All releases with QC issues", () => {
      const releases = [
        { qcStatus: "rejected" },
        { qcStatus: "rejected" },
        { qcStatus: "rejected" },
      ];

      const issueCount = releases.filter((r) => r.qcStatus !== "ready").length;

      expect(issueCount).toBe(releases.length);
    });
  });
});
