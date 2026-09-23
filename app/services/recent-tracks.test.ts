import { describe, expect, it } from "vitest";

import {
  collapseRepeats,
  findOverlaps,
  flattenRecentTracks,
  normaliseTitle,
  playKey,
} from "./recent-tracks";
import type { Play } from "./recent-tracks";

const play = (artist: string, track: string, timestamp: number): Play => ({
  artist,
  track,
  album: "",
  timestamp,
});

describe("normaliseTitle", () => {
  it("folds case, accents and curly quotes", () => {
    expect(normaliseTitle("Boys Don’t Cry")).toBe("boys don t cry");
    expect(normaliseTitle("Björk")).toBe("bjork");
    expect(normaliseTitle("Sigur Rós")).toBe(normaliseTitle("sigur ros"));
  });

  it("strips qualifiers that name a pressing, not a recording", () => {
    expect(normaliseTitle("Blue Weekend (Deluxe Edition)")).toBe(
      normaliseTitle("Blue Weekend")
    );
    expect(normaliseTitle("Wish [2011 Remaster]")).toBe(normaliseTitle("Wish"));
    expect(normaliseTitle("Let It Be - Remastered 2009")).toBe(
      normaliseTitle("Let It Be")
    );
  });

  it("keeps brackets that carry meaning", () => {
    expect(normaliseTitle("(Don't Fear) The Reaper")).toContain("don t fear");
    expect(normaliseTitle("Nude (Acoustic)")).not.toBe(normaliseTitle("Nude"));
  });

  it("treats an ampersand and 'and' as the same word", () => {
    expect(
      playKey({ artist: "Florence & the Machine", track: "Dog Days" })
    ).toBe(playKey({ artist: "Florence and the Machine", track: "Dog Days" }));
  });
});

describe("flattenRecentTracks", () => {
  const row = (name: string, uts: string) => ({
    artist: { mbid: "", "#text": "The Cure" },
    album: { mbid: "", "#text": "Boys Don't Cry" },
    name,
    mbid: "",
    url: "",
    streamable: "0",
    image: [],
    date: { uts, "#text": "" },
  });

  it("reads a page of plays", () => {
    const plays = flattenRecentTracks({
      track: [
        row("Boys Don't Cry", "1790029677"),
        row("10:15 Saturday Night", "1790029400"),
      ],
    });

    expect(plays).toHaveLength(2);
    expect(plays[0]).toMatchObject({
      artist: "The Cure",
      track: "Boys Don't Cry",
      timestamp: 1790029677,
    });
  });

  it("accepts a lone play, which the API sends unwrapped", () => {
    expect(
      flattenRecentTracks({ track: row("Lullaby", "1790029677") })
    ).toHaveLength(1);
  });

  it("drops the now-playing row, which has no timestamp to scrobble", () => {
    const plays = flattenRecentTracks({
      track: [
        {
          ...row("Friday I'm In Love", "0"),
          date: undefined,
          "@attr": { nowplaying: "true" },
        },
        row("Lovesong", "1790029677"),
      ],
    });

    expect(plays.map((p) => p.track)).toEqual(["Lovesong"]);
  });

  it("survives an empty or missing response", () => {
    expect(flattenRecentTracks(null)).toEqual([]);
    expect(flattenRecentTracks({ track: [] })).toEqual([]);
  });
});

describe("collapseRepeats", () => {
  it("drops a feed's back-to-back duplicate", () => {
    // Radio 3 really does send these; observed live against the station feed.
    const collapsed = collapseRepeats([
      play("Ludwig Göransson", "Ithaca", 1_000),
      play("Ludwig Göransson", "Ithaca", 1_010),
    ]);

    expect(collapsed).toHaveLength(1);
  });

  it("keeps a genuine replay later in the session", () => {
    const collapsed = collapseRepeats([
      play("The Cure", "Lovesong", 1_000),
      play("The Cure", "Lovesong", 5_000),
    ]);

    expect(collapsed).toHaveLength(2);
  });

  it("returns plays oldest first, whatever order they arrived in", () => {
    const collapsed = collapseRepeats([
      play("B", "Two", 2_000),
      play("A", "One", 1_000),
    ]);

    expect(collapsed.map((p) => p.timestamp)).toEqual([1_000, 2_000]);
  });
});

describe("findOverlaps", () => {
  const existing = [
    play("Wolf Alice", "Delicious Things", 10_000),
    play("Wolf Alice", "Lipstick On The Glass", 10_300),
  ];

  it("flags a track already scrobbled near the same time", () => {
    const overlaps = findOverlaps(
      [{ artist: "Wolf Alice", track: "Delicious Things", timestamp: 10_120 }],
      existing
    );

    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].secondsApart).toBe(120);
  });

  it("matches across a different pressing of the same track", () => {
    const overlaps = findOverlaps(
      [
        {
          artist: "Wolf Alice",
          track: "Delicious Things (Remastered)",
          timestamp: 10_000,
        },
      ],
      existing
    );

    expect(overlaps).toHaveLength(1);
  });

  it("leaves a play outside the tolerance alone", () => {
    const overlaps = findOverlaps(
      [{ artist: "Wolf Alice", track: "Delicious Things", timestamp: 90_000 }],
      existing
    );

    expect(overlaps).toEqual([]);
  });

  it("reports the nearest existing play when there are several", () => {
    const overlaps = findOverlaps(
      [{ artist: "Wolf Alice", track: "Delicious Things", timestamp: 10_500 }],
      [...existing, play("Wolf Alice", "Delicious Things", 10_450)]
    );

    expect(overlaps[0].secondsApart).toBe(50);
  });

  it("has nothing to say about an empty history", () => {
    expect(
      findOverlaps([{ artist: "A", track: "B", timestamp: 1 }], [])
    ).toEqual([]);
  });
});
