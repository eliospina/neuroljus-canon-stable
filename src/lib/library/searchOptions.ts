/**
 * MiniSearch options shared by the build script and the runtime loader.
 * They must be identical, otherwise the serialised index cannot be loaded.
 */

import type { Options } from "minisearch";

export const SEARCH_OPTIONS: Options = {
  idField: "id",
  fields: ["title", "abstract", "sheetEn", "seedEn", "journal"],
  storeFields: ["id"],
  searchOptions: {
    boost: { title: 3, seedEn: 2, sheetEn: 1.5 },
    fuzzy: 0.15,
    prefix: true,
  },
};
