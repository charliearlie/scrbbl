import { describe, expect, it } from "vitest";

import { findUnowned, findUnplayed } from "./shelf-gap";
import type { PlayedAlbum } from "./shelf-gap";
import type { ShelfAlbum } from "./shelf";

const played = (
  artist: string,
  title: string,
  playcount: number
): PlayedAlbum => ({ artist, title, playcount, artworkUrl: null, url: "" });

const shelved = (artist: string, title: string): ShelfAlbum => ({
  id: `${artist}-${title}`,
  artist,
  title,
  year: null,
  artworkUrl: null,
  coverFront: null,
  coverBack: null,
  mbid: null,
  itunesId: null,
  owned: true,
  addedAt: 0,
  review: null,
});

describe("findUnowned", () => {
  it("surfaces what you play and do not own, most played first", () => {
    const result = findUnowned(
      [
        played("Wolf Alice", "Blue Weekend", 40),
        played("The Cure", "Disintegration", 12),
        played("Talk Talk", "Spirit of Eden", 60),
      ],
      [shelved("The Cure", "Disintegration")]
    );

    expect(result.map((a) => a.title)).toEqual([
      "Spirit of Eden",
      "Blue Weekend",
    ]);
  });

  it("counts a different pressing as owned", () => {
    const result = findUnowned(
      [played("Wolf Alice", "Blue Weekend (Deluxe Edition)", 40)],
      [shelved("Wolf Alice", "Blue Weekend")]
    );

    expect(result).toEqual([]);
  });

  it("ignores albums below the threshold", () => {
    const result = findUnowned([played("A", "Barely played", 2)], [], 5);
    expect(result).toEqual([]);
  });

  it("has nothing to say about an empty history", () => {
    expect(findUnowned([], [shelved("A", "B")])).toEqual([]);
  });
});

describe("findUnplayed", () => {
  it("surfaces shelf records you rarely play, least played first", () => {
    const result = findUnplayed(
      [shelved("A", "Untouched"), shelved("B", "Played a lot")],
      [played("B", "Played a lot", 50)]
    );

    expect(result.map((r) => r.album.title)).toEqual(["Untouched"]);
    expect(result[0].playcount).toBe(0);
  });

  it("treats an album missing from the list as barely played, not proven zero", () => {
    // The top-albums list is truncated, so absence is a floor, not a fact.
    const result = findUnplayed([shelved("A", "Missing")], []);
    expect(result[0].playcount).toBe(0);
  });

  it("keeps a record that just scrapes the threshold", () => {
    const result = findUnplayed(
      [shelved("A", "Twice")],
      [played("A", "Twice", 2)],
      2
    );
    expect(result).toHaveLength(1);
  });

  it("drops a record played more than the threshold", () => {
    const result = findUnplayed(
      [shelved("A", "Often")],
      [played("A", "Often", 3)],
      2
    );
    expect(result).toEqual([]);
  });
});
