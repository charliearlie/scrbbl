import { afterEach, describe, expect, it, vi } from "vitest";

import { lastfm } from "./lastfm.server";
import { findDuplicatePlays } from "./recent-tracks.server";

// Hoisted above the imports, so the factory cannot close over anything
// declared here — the spy is reached through the mocked module instead.
vi.mock("./lastfm.server", () => ({
  lastfm: { user: { getRecentTracks: vi.fn() } },
}));

const getRecentTracks = lastfm.user.getRecentTracks as unknown as ReturnType<
  typeof vi.fn
>;

const page = (rows: Array<{ artist: string; name: string; uts: number }>) => ({
  track: rows.map((row) => ({
    artist: { mbid: "", "#text": row.artist },
    album: { mbid: "", "#text": "" },
    name: row.name,
    mbid: "",
    url: "",
    streamable: "0",
    image: [],
    date: { uts: String(row.uts), "#text": "" },
  })),
  "@attr": {
    user: "charlie",
    page: "1",
    perPage: "200",
    totalPages: "1",
    total: String(rows.length),
  },
});

afterEach(() => {
  getRecentTracks.mockReset();
});

describe("findDuplicatePlays", () => {
  it("warns about a track already in the history", async () => {
    getRecentTracks.mockImplementation((_params, callback) =>
      callback(
        null,
        page([{ artist: "Wolf Alice", name: "The Beach", uts: 10_000 }])
      )
    );

    const duplicates = await findDuplicatePlays({
      username: "charlie",
      tracks: [{ artist: "Wolf Alice", track: "The Beach", timestamp: 10_060 }],
    });

    expect(duplicates).toEqual([
      { artist: "Wolf Alice", track: "The Beach", playedAt: 10_000 },
    ]);
  });

  it("says nothing about a track that is not there", async () => {
    getRecentTracks.mockImplementation((_params, callback) =>
      callback(
        null,
        page([{ artist: "Someone Else", name: "Other", uts: 10_000 }])
      )
    );

    await expect(
      findDuplicatePlays({
        username: "charlie",
        tracks: [
          { artist: "Wolf Alice", track: "The Beach", timestamp: 10_000 },
        ],
      })
    ).resolves.toEqual([]);
  });

  it("never blocks a scrobble when Last.FM cannot be reached", async () => {
    getRecentTracks.mockImplementation((_params, callback) =>
      callback({ message: "Service temporarily unavailable", code: 16 })
    );

    // The whole point: a warning we could not compute is not a reason to
    // stand between the user and a scrobble.
    await expect(
      findDuplicatePlays({
        username: "charlie",
        tracks: [
          { artist: "Wolf Alice", track: "The Beach", timestamp: 10_000 },
        ],
      })
    ).resolves.toEqual([]);
  });

  it("does not call Last.FM when there is nothing timestamped to check", async () => {
    await expect(
      findDuplicatePlays({ username: "charlie", tracks: [] })
    ).resolves.toEqual([]);
    expect(getRecentTracks).not.toHaveBeenCalled();
  });

  it("asks only for the window the batch spans, padded by the tolerance", async () => {
    getRecentTracks.mockImplementation((_params, callback) =>
      callback(null, page([]))
    );

    await findDuplicatePlays({
      username: "charlie",
      tracks: [
        { artist: "A", track: "one", timestamp: 50_000 },
        { artist: "A", track: "two", timestamp: 50_600 },
      ],
      toleranceSeconds: 100,
    });

    expect(getRecentTracks).toHaveBeenCalledWith(
      expect.objectContaining({ user: "charlie", from: 49_900, to: 50_700 }),
      expect.any(Function)
    );
  });
});
