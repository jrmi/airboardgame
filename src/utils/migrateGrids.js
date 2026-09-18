// Compatibility belongs at the loading boundary; Syncboard only sees `grid`.
const gridTypes = new Set(["grid", "hexH", "hexV"]);
const legacyFields = {
  gridType: "type",
  gridSize: "size",
  gridOffset: "offset",
  showGrid: "show",
  gridColor: "color",
  gridOpacity: "opacity",
};

export const migrateBoardGrid = (board = {}) => {
  const migrated = { ...board };
  if (!Object.hasOwn(board, "grid")) {
    const grid = {};
    for (const [legacy, canonical] of Object.entries(legacyFields)) {
      if (Object.hasOwn(board, legacy)) grid[canonical] = board[legacy];
    }
    if (!Object.hasOwn(grid, "type") && Object.hasOwn(grid, "size")) {
      grid.type = Number(grid.size) > 0 ? "grid" : "none";
    }
    // Before grid overlays existed, visibility was not stored. Keep the
    // previous behaviour for saved games instead of using Syncboard's visible
    // by default fallback.
    if (Object.keys(grid).length && !Object.hasOwn(grid, "show")) {
      grid.show = false;
    }
    if (Object.keys(grid).length) migrated.grid = grid;
  }
  for (const legacy of Object.keys(legacyFields)) delete migrated[legacy];
  return migrated;
};

const migrateItem = (item) => {
  if (!item || typeof item !== "object") return item;
  const migrated = { ...item };
  // Item grids existed before their overlay preference. A missing preference
  // therefore means an existing game and must retain the former hidden state.
  if (item.grid && !Object.hasOwn(item.grid, "show")) {
    migrated.grid = { ...item.grid, show: false };
  }
  if (item.grid && !gridTypes.has(item.grid.type)) {
    migrated.grid = { ...migrated.grid };
    delete migrated.grid.type;
    delete migrated.grid.size;
    delete migrated.grid.offset;
  }
  // Available-item folders, nested collections, and generator templates.
  for (const key of ["items", "availableItems"]) {
    if (Array.isArray(item[key])) migrated[key] = item[key].map(migrateItem);
  }
  for (const key of ["item", "template"]) {
    if (item[key] && typeof item[key] === "object") {
      migrated[key] = migrateItem(item[key]);
    }
  }
  return migrated;
};

export const migrateGrids = (data) => ({
  ...data,
  board: migrateBoardGrid(data.board),
  items: (data.items || []).map(migrateItem),
  availableItems: (data.availableItems || []).map(migrateItem),
});
