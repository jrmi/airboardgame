import { ZipReader, BlobReader, TextWriter, BlobWriter } from "@zip.js/zip.js";
import X2JS from "x2js";
import pLimit from "p-limit";

import {
  uploadResourceImage as uploadMedia,
  createGame,
  updateGame,
} from "../utils/api";
import { uid } from ".";
import { itemTemplates } from "../gameComponents";

class Decoder {
  constructor(value, delimiter) {
    this.val = value;
    this.delim = delimiter;
    this.start = 0;
    this.stop = value !== null ? value.length : 0;
    this.buf = null;
  }
  hasMoreTokens() {
    return this.val !== null;
  }
  getRemaining() {
    if (!this.hasMoreTokens()) {
      return "";
    }
    return this.val.substring(this.start, this.stop);
  }
  unquote(cs) {
    // strip enclosure by single quotes
    const len = cs.length;
    return len > 1 && cs.at(0) === "'" && cs.at(len - 1) === "'"
      ? cs.substring(1, len - 1)
      : cs;
  }
  nextToken() {
    if (!this.hasMoreTokens()) throw new Error("No more tokens");

    if (this.start === this.stop) {
      // token for "null" is the empty string
      this.val = null;
      return "";
    }

    if (this.buf !== null) {
      this.buf === "";
    }

    let tok = null;
    let i = this.start;
    for (; i < this.stop; ++i) {
      if (this.val.at(i) === this.delim) {
        if (i > 0 && this.val.at(i - 1) == "\\") {
          // escaped delimiter; piece together the token
          if (this.buf == null) {
            this.buf = "";
          }
          this.buf += this.val.substring(this.start, i - 1); // buf.append(val, start, i - 1);
          this.start = i;
        } else {
          // real delimiter
          if (this.buf == null || this.buf.length === 0) {
            // no escapes; take the token whole
            tok = this.val.substring(this.start, i);
          } else {
            // had an earlier escape; cobble on the end
            this.buf += this.val.substring(this.start, i); //buf.append(val, start, i);
          }
          this.start = i + 1;
          break;
        }
      }
    }

    if (this.start < i) {
      // i == stop; we reached the end without a delimiter
      if (this.buf === null || this.buf.length === 0) {
        // no escapes; take the token whole
        tok = this.val.substring(this.start);
      } else {
        // had an earlier escape; cobble on the end
        this.buf += this.val.substring(this.start, this.stop); //buf.append(val, start, stop);
      }
      this.val = null;
    }

    return this.unquote(tok != null ? tok : this.buf);
  }
  getTokens() {
    const tokens = [];
    while (this.hasMoreTokens()) {
      tokens.push(this.nextToken());
    }
    return tokens;
  }
}

/**
 * Recursively explore each command.
 * @param {*} text
 * @returns
 */
const createPiece = (text) => {
  const st = new Decoder(text, "\t");
  const type = st.nextToken();
  const innerType = st.hasMoreTokens() ? st.getTokens() : null;
  if (innerType) {
    return [type].concat(innerType.map((inn) => createPiece(inn)).flat());
  } else {
    return [type];
  }
};

const ADD_PREFIX = "+/";

/**
 * Read the commands from the text content of a Piece element
 * @param {*} text
 * @returns
 */
const getCommands = (text) => {
  if (text.startsWith(ADD_PREFIX)) {
    const noPrefix = text.substring(2);
    const [, data] = new Decoder(noPrefix, "/").getTokens();

    return createPiece(data).map((command) =>
      new Decoder(command, ";").getTokens()
    );
  } else {
    return [];
  }
};

const getList = (value) => {
  return Array.isArray(value) ? value : value ? [value] : [];
};

class FileHandler {
  constructor(entryMap, log = () => {}) {
    this.entryMap = entryMap;
    this.fileCache = {};
    this.log = log;
    this.queue = pLimit(3);
  }

  getRealPath(main, alternative = "") {
    let alternatives = [];
    if (main.trim() === "" && alternative.trim() === "") {
      return null;
    }
    if (main.trim().length > 0) {
      const noExt = main.replace(/\.[^/.]+$/, "");
      alternatives = alternatives.concat([
        `images/${main}`,
        `images/${main}.gif`,
        `images/${main}.GIF`,
        `images/${noExt}`,
        `images/${noExt}.gif`,
        `images/${noExt}.GIF`,
        `images/${noExt}.jpg`,
        `images/${noExt}.png`,
      ]);
    }
    if (alternative.trim().length > 0) {
      const noExt = alternative.replace(/\.[^/.]+$/, "");
      alternatives = alternatives.concat([
        `images/${alternative}`,
        `images/${alternative}.gif`,
        `images/${alternative}.GIF`,
        `images/${noExt}`,
        `images/${noExt}.gif`,
        `images/${noExt}.GIF`,
        `images/${noExt}.jpg`,
        `images/${noExt}.png`,
      ]);
    }
    for (const alternative of alternatives) {
      if (this.entryMap[alternative]) {
        return alternative;
      }
    }
    this.log("Missing image:", main, alternative);
    return null;
  }

  getFile(fileName) {
    if (fileName === null) {
      return;
    }
    if (!this.fileCache[fileName]) {
      if (!this.entryMap[fileName]) {
        this.log("Missing file:", fileName);
        return;
      } else {
        this.fileCache[fileName] = this.entryMap[fileName]
          .getData(new BlobWriter())
          .then((file) => {
            return new File([file], fileName.replace("images/", ""), {
              type: file.type,
            });
          });
      }
    }
    return this.fileCache[fileName];
  }

  async uploadFile(fileName, uploadHandler, retry = 0) {
    return await this.queue(
      this.uploadFileWithoutQueue.bind(this),
      fileName,
      uploadHandler,
      retry
    );
  }

  async uploadFileWithoutQueue(fileName, uploadHandler, retry = 0) {
    const file = await this.getFile(fileName);
    if (!file) {
      this.log("Missing file:", fileName);
      return { type: "external", content: "/default.png" };
    }
    try {
      const filePath = await uploadHandler(file);
      this.log(`File ${fileName} uploaded!`);
      return {
        type: "local",
        content: filePath,
      };
    } catch (e) {
      if (retry < 5) {
        this.log(`Upload failed for ${fileName}. Retrying`);
        return await this.uploadFileWithoutQueue(
          fileName,
          uploadHandler,
          retry + 1
        );
      } else {
        this.log(`Upload failed for ${fileName}!`);
        this.log("File upload error:", e);
        return { type: "", content: "/default.png" };
      }
    }
  }

  async getImageSize(fileName) {
    const file = await this.getFile(fileName);

    if (!file) {
      return { width: 0, height: 0 };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };

        img.src = e.target.result;
      };
    });
  }
}

class VassalModuleLoader {
  constructor(file, onProgress, debug = false) {
    this.file = file;
    this.onProgress = onProgress;
    if (debug) {
      this.log = console.log;
    } else {
      this.log = () => {};
    }
    this.prototypes = {};
    this.progressAmount = 0;
  }

  async init() {
    this.zipReader = new ZipReader(new BlobReader(this.file));
    const entries = await this.zipReader.getEntries();
    this.entryMap = Object.fromEntries(
      entries.map((entry) => [entry.filename, entry])
    );
    this.log("Files in archive", Object.keys(this.entryMap));
    this.fileHandler = new FileHandler(this.entryMap, this.log);
    this.fileCache = {};
    this.createdGame = null;
    this.boardByName = {};
  }

  progress(amount, message) {
    this.progressAmount += amount;
    this.onProgress(this.progressAmount, message);
  }

  async close() {
    await this.zipReader.close();
  }

  async loadBuildFile() {
    const buildFileName = this.entryMap["buildFile.xml"]
      ? "buildFile.xml"
      : "buildFile";

    const buildFileContent = await this.entryMap[buildFileName].getData(
      new TextWriter()
    );
    const x2js = new X2JS();
    const parsed = x2js.xml2js(buildFileContent);
    let mainKey = Object.keys(parsed)[0];

    this.buildFile = parsed[mainKey];
    this.log("Build file content", this.buildFile);
  }

  readSlot(slot) {
    const commands = getCommands(slot.__text);
    const result = { name: slot._entryName || slot._name, altImages: [] };
    if (slot._width) {
      result.with = slot._width;
    }
    if (slot._height) {
      result.height = slot._height;
    }

    for (const [commandName, ...rest] of commands) {
      if (commandName === "piece") {
        const realPath = this.fileHandler.getRealPath(rest[2], rest[3]);
        if (realPath) {
          result.content = realPath;
        }
      }
      if (commandName === "obs" && rest[1]) {
        const realPath = this.fileHandler.getRealPath(rest[1]);
        if (realPath) {
          result.backContent = realPath;
        }
      }
      if (commandName === "immob") {
        result.locked = true;
      }
      if (commandName === "prototype") {
        const prototype = this.prototypes[rest[0]];
        const { altImages, ...restProto } = prototype;

        Object.assign(result, restProto);
        result.altImages.concat(altImages);
      }
      if (commandName === "emb2") {
        /*this.log(
          "Emb2 images",
          rest[15].split(",").map((main) => this.fileHandler.getRealPath(main))
        );*/
        result.altImages = rest[15]
          .split(",")
          .map((main) => this.fileHandler.getRealPath(main));
      }
      if (commandName === "emb") {
        const imagesText = rest.slice(8);

        result.altImages = imagesText.map((im) => {
          const dec = new Decoder(im, ",");
          return this.fileHandler.getRealPath(dec.nextToken());
        });
        // this.log("Emb images", result.altImages);
      }
    }

    result.altImages = result.altImages.filter((im) => im);

    if (!result.content) {
      const [first, second] = result.altImages || [];
      switch (result.altImages.length) {
        case 1:
          result.content = first;
          result.altImages = [];
          break;
        case 2:
          result.content = first;
          result.backContent = second;
          result.altImages = [];
          break;
      }
    }

    return result;
  }

  loadPrototypes() {
    if (this.buildFile["VASSAL.build.module.PrototypesContainer"]) {
      const prototypeElements = getList(
        this.buildFile["VASSAL.build.module.PrototypesContainer"][
          "VASSAL.build.module.PrototypeDefinition"
        ]
      );
      prototypeElements.forEach((proto) => {
        const { name, ...rest } = this.readSlot(proto);
        this.prototypes[name] = rest;
      });
    }
    this.log("Game prototypes", this.prototypes);
  }

  async itemFromSlot(slot, groupId, position) {
    if (slot.altImages.length > 1) {
      const images = slot.altImages.filter((img) => img);
      let imageSize;
      if (slot.content) {
        imageSize = await this.fileHandler.getImageSize(slot.content);
      } else {
        imageSize = await this.fileHandler.getImageSize(images[0]);
      }
      return {
        type: "imageSequence",
        groupId,
        label: slot.name,
        x: position.x - imageSize.width / 2,
        y: position.y - imageSize.height / 2,
        width: imageSize.width,
        height: imageSize.height,
        imageCount: images.length,
        images,
      };
    }
    if (slot.content) {
      const imageSize = await this.fileHandler.getImageSize(slot.content);
      const newItem = {
        type: "image",
        groupId,
        label: slot.name,
        content: slot.content,
        x: position.x - imageSize.width / 2,
        y: position.y - imageSize.height / 2,
        width: imageSize.width,
        height: imageSize.height,
      };
      if (slot.backContent) {
        newItem.backContent = slot.backContent;
      }
      return newItem;
    }
  }

  async loadMapDrawPileElement(drawPile) {
    const x = parseInt(drawPile._x) || 0;
    const y = parseInt(drawPile._y) || 0;
    const pileName = drawPile._name;
    const owningBoard = drawPile._owningBoard;
    let offset = { x: 0, y: 0 };
    if (owningBoard) {
      offset = {
        x: this.boardByName[owningBoard].x,
        y: this.boardByName[owningBoard].y,
      };
    }
    return (
      await Promise.all(
        getList(drawPile["VASSAL.build.widget.CardSlot"]).map(
          async (cardSlot, index) => {
            const slot = this.readSlot(cardSlot);
            const newItem = await this.itemFromSlot(slot, pileName, {
              x: x + index + offset.x,
              y: y - index + offset.y,
            });

            if (newItem && newItem.backContent) {
              newItem.flipped = true;
            }
            return newItem;
          }
        )
      )
    ).filter((item) => item);
  }

  async loadMapSetupStackElement(setupStack) {
    const stackName = setupStack._name;
    const x = parseInt(setupStack._x) || 0;
    const y = parseInt(setupStack._y) || 0;
    //const useGridLocation = setupStack._useGridLocation;
    const owningBoard = setupStack._owningBoard;
    let offset = { x: 0, y: 0 };
    if (owningBoard) {
      offset = {
        x: this.boardByName[owningBoard].x,
        y: this.boardByName[owningBoard].y,
      };
    }
    const pieceSlots = getList(setupStack["VASSAL.build.widget.PieceSlot"]);
    return (
      await Promise.all(
        pieceSlots.map(async (pieceSlot) => {
          const slot = this.readSlot(pieceSlot);
          return await this.itemFromSlot(slot, stackName, {
            x: x + offset.x,
            y: y + offset.y,
          });
        })
      )
    ).filter((item) => item);
  }

  async loadMapElements() {
    const rootMaps = [
      ...getList(this.buildFile["VASSAL.build.module.Map"]),
      ...getList(this.buildFile["VASSAL.build.module.PrivateMap"]),
      ...getList(this.buildFile["VASSAL.build.module.PlayerHand"]),
    ];

    const mapWidgets = [];

    const searchMapWidget = (widget) => {
      if (widget["VASSAL.build.widget.MapWidget"]) {
        getList(widget["VASSAL.build.widget.MapWidget"]).forEach(
          (mapWidget) => {
            mapWidgets.push(
              getList(mapWidget["VASSAL.build.widget.WidgetMap"])
            );
          }
        );
      }
      if (widget["VASSAL.build.widget.PanelWidget"]) {
        getList(widget["VASSAL.build.widget.PanelWidget"]).forEach((sub) =>
          searchMapWidget(sub)
        );
      }
      if (widget["VASSAL.build.widget.ListWidget"]) {
        getList(widget["VASSAL.build.widget.ListWidget"]).forEach((sub) =>
          searchMapWidget(sub)
        );
      }
      if (widget["VASSAL.build.widget.BoxWidget"]) {
        getList(widget["VASSAL.build.widget.BoxWidget"]).forEach((sub) =>
          searchMapWidget(sub)
        );
      }
      if (widget["VASSAL.build.widget.TabWidget"]) {
        getList(widget["VASSAL.build.widget.TabWidget"]).forEach((sub) =>
          searchMapWidget(sub)
        );
      }
    };

    getList(
      this.buildFile["VASSAL.build.module.ChartWindow"]
    ).forEach((chartWindow) => searchMapWidget(chartWindow));

    const mapItemList = await Promise.all(
      [...rootMaps, ...mapWidgets.flat()].map((map) => this.loadMapElement(map))
    );

    // Reposition each map item relative to the map position
    const offset = { x: 0, y: 0 };
    let maxHeight = 0;
    return mapItemList
      .map(([size, items]) => {
        const newItems = items.map((item) => {
          return { ...item, x: item.x + offset.x, y: item.y + offset.y };
        });
        if (maxHeight < size.height) {
          maxHeight = size.height;
        }
        offset.x += size.width + 50;
        if (offset.x > 20000) {
          offset.x = 0;
          offset.y += maxHeight + 50;
          maxHeight = 0;
        }

        return newItems;
      })
      .flat();
  }

  async loadMapElement(mapElement) {
    /* Board picker */
    const boardPicker = mapElement["VASSAL.build.module.map.BoardPicker"];
    const boards = getList(
      boardPicker["VASSAL.build.module.map.boardPicker.Board"]
    );
    const boardItems = (
      await Promise.all(
        boards.map(async (board) => {
          if (board._image) {
            const fileName = this.fileHandler.getRealPath(board._image);
            const imgSize = await this.fileHandler.getImageSize(fileName);
            return {
              type: "image",
              label: board._name,
              content: fileName,
              layer: -2,
              locked: true,
              x: 0,
              y: 0,
              ...imgSize,
            };
          } else {
            return {
              type: "zone",
              label: board._name,
              backgroundColor: `rgba(${
                board._color + ",200" || "200,200,200,200"
              })`,
              layer: -2,
              locked: true,
              x: 0,
              y: 0,
              width: parseInt(board._width) || 10,
              height: parseInt(board._height) || 10,
              labelPosition: "top",
            };
          }
        })
      )
    ).filter((item) => item);

    boardItems.forEach((board) => (this.boardByName[board.label] = board));

    let boardOffset = 0;
    boardItems.forEach((board) => {
      board.y += board.y + boardOffset;
      boardOffset += board.height;
    });

    /* Draw piles */
    const drawPileItems = (
      await Promise.all(
        getList(
          mapElement["VASSAL.build.module.map.DrawPile"]
        ).map((drawPile) => this.loadMapDrawPileElement(drawPile))
      )
    ).flat();

    /* Setup Stack */
    const stackItems = (
      await Promise.all(
        getList(
          mapElement["VASSAL.build.module.map.SetupStack"]
        ).map((setupStack) => this.loadMapSetupStackElement(setupStack))
      )
    ).flat();

    // Compute boards size
    const size = boardItems.reduce(
      (acc, item) => {
        if (acc.width < item.width) {
          acc.width = item.width;
        }
        acc.height += item.height;
        return acc;
      },
      {
        width: 0,
        height: 0,
      }
    );

    return [size, [...boardItems, ...drawPileItems, ...stackItems]];
  }

  async exploreWidgetElement(widget) {
    const groupName = widget._entryName;

    const pieceItems = (
      await Promise.all(
        getList(widget["VASSAL.build.widget.PieceSlot"]).map(
          async (pieceSlot) => {
            const slot = this.readSlot(pieceSlot);
            const newItem = await this.itemFromSlot(slot, groupName, {
              x: 0,
              y: 0,
            });
            if (newItem) {
              delete newItem.x;
              delete newItem.y;
            }
            return newItem;
          }
        )
      )
    ).filter((item) => item);

    const panelItems = await Promise.all(
      getList(widget["VASSAL.build.widget.PanelWidget"]).map((subWidget) =>
        this.exploreWidgetElement(subWidget)
      )
    );

    const listItems = await Promise.all(
      getList(widget["VASSAL.build.widget.ListWidget"]).map((subWidget) =>
        this.exploreWidgetElement(subWidget)
      )
    );

    const boxItems = await Promise.all(
      getList(widget["VASSAL.build.widget.BoxWidget"]).map((subWidget) =>
        this.exploreWidgetElement(subWidget)
      )
    );

    const tabItems = await Promise.all(
      getList(widget["VASSAL.build.widget.TabWidget"]).map((subWidget) =>
        this.exploreWidgetElement(subWidget)
      )
    );

    const subItems = [...panelItems, ...listItems, ...boxItems, ...tabItems];

    return {
      name: groupName,
      items: [...pieceItems, ...subItems],
    };
  }

  async loadPieceWindow() {
    return (
      await Promise.all(
        getList(this.buildFile["VASSAL.build.module.PieceWindow"]).map(
          async (pieceWindow) => {
            const { items } = await this.exploreWidgetElement(pieceWindow);
            return items;
          }
        )
      )
    )
      .flat()
      .filter((item) => item);
  }

  cleanAvailableItems(availableItems) {
    const mergeItems = (itemList) => {
      const [endList] = itemList.reduce(
        ([finalList, nameMap], subItem) => {
          if (!subItem.items) {
            finalList.push(subItem);
            return [finalList, nameMap];
          }
          if (subItem.items.length === 0) {
            return [finalList, nameMap];
          }
          const { name, items } = subItem;
          if (!nameMap[name]) {
            const group = { name, items };
            nameMap[name] = group;
            finalList.push(group);
          } else {
            nameMap[name].items = mergeItems([
              ...nameMap[name].items,
              ...items,
            ]);
          }
          return [finalList, nameMap];
        },
        [[], {}]
      );
      return endList;
    };
    return mergeItems(availableItems);
  }

  loadDiceElement() {
    const specialDice = getList(
      this.buildFile["VASSAL.build.module.SpecialDiceButton"]
    )
      .map((specialDieButton) => {
        const specialDie = getList(
          specialDieButton["VASSAL.build.module.SpecialDie"]
        );
        return specialDie.map((specialDice, index) => {
          const faces = getList(
            specialDice["VASSAL.build.module.SpecialDieFace"]
          );

          const images = faces.map(({ _icon }) =>
            this.fileHandler.getRealPath(_icon)
          );
          return {
            ...itemTemplates["diceImage"].template(),
            type: "diceImage",
            images,
            x: -100 - 100 * index,
            y: 0,
          };
        });
      })
      .flat();

    const diceButtons = getList(
      this.buildFile["VASSAL.build.module.DiceButton"]
    )
      .map((diceButton, index) => {
        const sideCount = parseInt(diceButton._nSides) || 6;
        const diceCount = parseInt(diceButton._nDice) || 1;
        const label = diceButton._name;
        if (sideCount === 6) {
          return [...Array(diceCount).keys()].map((diceNumber) => {
            return {
              ...itemTemplates["diceImage"].template(),
              type: "diceImage",
              label,
              x: -100 - 100 * index,
              y: 100 + 100 * diceNumber,
            };
          });
        } else {
          return [...Array(diceCount).keys()].map((diceNumber) => ({
            type: "dice",
            label,
            side: sideCount,
            x: -100 - 100 * index,
            y: 100 + 100 * diceNumber,
          }));
        }
      })
      .flat();
    return [...specialDice, ...diceButtons];
  }

  async createGame() {
    const newGame = {
      items: [],
      availableItems: [],
      board: {
        translations: [],
        playerCount: [2, 4],
        defaultName: this.buildFile._name,
        defaultLanguage: "en",
        defaultDescription: this.buildFile._description,
        defaultBaseline: "",
        materialLanguage: "Multi-lang",
        minAge: "10",
        duration: [30, 90],
        imageUrl: "/game_assets/default.png",
        published: false,
      },
    };
    this.createdGame = await createGame(newGame);
  }

  async uploadOneFile(fileName, uploadHandler) {
    if (!this.fileCache[fileName]) {
      this.fileCount += 1;
      this.fileCache[fileName] = this.fileHandler
        .uploadFile(fileName, uploadHandler)
        .then((result) => {
          this.fileLoaded += 1;
          const percent = (this.fileLoaded / this.fileCount) * 85;
          this.progressAmount = Math.round(15 + percent);
          this.progress(
            0,
            `File ${fileName} loaded (${this.fileLoaded}/${this.fileCount})`
          );
          return result;
        });
    }
    return this.fileCache[fileName];
  }

  async uploadItemFiles(item, uploadHandler) {
    switch (item.type) {
      case "image": {
        const imageItem = item;
        const addition = {
          content: await this.uploadOneFile(imageItem.content, uploadHandler),
        };

        if (item.backContent) {
          addition.backContent = await this.uploadOneFile(
            imageItem.backContent,
            uploadHandler
          );
        }

        return { ...item, ...addition };
      }
      case "diceImage": {
        if (item.images) {
          const images = await Promise.all(
            item.images.map((imageName) => {
              if (typeof imageName === "string") {
                return this.uploadOneFile(imageName, uploadHandler);
              }
              return imageName;
            })
          );
          return { ...item, images };
        } else {
          return item;
        }
      }
      case "imageSequence": {
        const newItem = { ...item };
        if (item.images) {
          const images = await Promise.all(
            item.images.map((imageName) => {
              if (typeof imageName === "string") {
                return this.uploadOneFile(imageName, uploadHandler);
              }
              return imageName;
            })
          );
          newItem.images = images;
        }
        if (item.backgroundImage) {
          newItem.backgroundImage = await this.uploadOneFile(
            item.backgroundImage,
            uploadHandler
          );
        }
        return newItem;
      }
      default:
        return item;
    }
  }

  /**
   * Progress from 15 -> 95 (80)
   * @param {*} uploadHandler
   * @returns
   */
  async uploadAllItemFiles(uploadHandler) {
    // upload Items image
    this.log("Image upload in progress...");

    this.progress(0, "File upload in progress...");

    this.fileCount = 0;
    this.fileLoaded = 0;

    const itemsWithFile = Promise.all(
      this.items.map((item) => {
        return this.uploadItemFiles(item, uploadHandler);
      })
    );

    // upload availableItems files
    const recursiveUploadItemFiles = async (node) => {
      return await Promise.all(
        node.map(async (subNode) => {
          if (subNode.type) {
            // it's an item
            return await this.uploadItemFiles(subNode, uploadHandler);
          } else {
            // It's a group
            return {
              name: subNode.name,
              items: await recursiveUploadItemFiles(subNode.items),
            };
          }
        })
      );
    };

    const availableItemsWithImage = recursiveUploadItemFiles(
      this.availableItems
    );

    return [await itemsWithFile, await availableItemsWithImage];
  }

  async loadVassalModuleInGame() {
    await this.init();

    this.progress(5, "File unzipped...");

    await this.loadBuildFile();

    this.progress(5, "Buildfile loaded...");

    // Load prototypes
    this.loadPrototypes();

    /* Handle maps items */
    const mapItems = await this.loadMapElements();

    this.progress(2, "Board elements loaded...");

    /* Piece windows */
    const availablePieceWindowsItems = await this.loadPieceWindow();

    this.progress(2, "Available elements loaded...");

    /* Handle SpecialDie */
    const diceItems = this.loadDiceElement();

    // 15
    this.progress(1, "Dice elements loaded...");

    const items = [...mapItems, ...diceItems];
    const availableItems = this.cleanAvailableItems(availablePieceWindowsItems);

    this.log("Items", items);
    this.log("Available items", availableItems);

    // Early quit for now
    /*if (this.buildFile) {
      return;
    }*/

    await this.createGame();

    // 16
    this.progress(1, "Game created...");

    // Upload all files
    const [itemWFiles, availableItemWFiles] = await this.uploadAllItemFiles(
      items,
      availableItems
    );

    // 95
    this.progress(79, "File uploaded...");

    // Add the updated items and available items
    await updateGame(this.createdGame._id, {
      ...this.createdGame,
      items: itemWFiles,
      availableItems: availableItemWFiles,
    });

    // 100
    this.progress(5, "Game updated...");

    this.log("Game created", this.createdGame._id);

    await this.close();
  }

  /**
   * Progress from 0 -> 15
   * @returns
   */
  async loadVassalModule() {
    await this.init();

    this.progress(5, "File unzipped...");

    await this.loadBuildFile();

    this.progress(5, "Buildfile loaded...");

    // Load prototypes
    this.loadPrototypes();

    /* Handle maps items */
    const mapItems = await this.loadMapElements();

    this.progress(2, "Board elements loaded...");

    /* Piece windows */
    const availablePieceWindowsItems = await this.loadPieceWindow();

    this.progress(2, "Available elements loaded...");

    /* Handle SpecialDie */
    const diceItems = this.loadDiceElement();

    // 15
    this.progress(1, "Dice elements loaded...");

    const items = [...mapItems, ...diceItems];
    const availableItems = this.cleanAvailableItems(availablePieceWindowsItems);

    this.log("Items", items);
    this.log("Available items", availableItems);

    this.items = items;
    this.availableItems = availableItems;
    return {
      name: this.buildFile._name,
      description: this.buildFile._description,
    };
  }

  async uploadFiles(uploadHandler) {
    const [itemWFiles, availableItemWFiles] = await this.uploadAllItemFiles(
      uploadHandler
    );
    await this.close();
    return { items: itemWFiles, availableItems: availableItemWFiles };
  }
}

export const createGameFromVassalModule = async (file) => {
  const moduleLoader = new VassalModuleLoader(file);
  const { name, description } = await moduleLoader.loadVassalModule();

  const newGame = {
    items: [],
    availableItems: [],
    board: {
      translations: [],
      playerCount: [2, 4],
      defaultName: name,
      defaultLanguage: "en",
      defaultDescription: description,
      defaultBaseline: "",
      materialLanguage: "Multi-lang",
      minAge: "10",
      duration: [30, 90],
      imageUrl: "/game_assets/default.png",
      published: false,
    },
  };
  const createdGame = await createGame(newGame);

  const uploadHandler = (file) => {
    return uploadMedia("game", createdGame._id, file);
  };
  const { items, availableItems } = await moduleLoader.uploadFiles(
    uploadHandler
  );

  await updateGame(this.createdGame._id, {
    ...this.createdGame,
    items,
    availableItems,
  });

  this.log("Game created", this.createdGame._id);
};

export const loadVassalModuleInSession = async (
  file,
  sessionId,
  progressCallback = () => {},
  debug = false
) => {
  const moduleLoader = new VassalModuleLoader(file, progressCallback, debug);
  const { name, description } = await moduleLoader.loadVassalModule();

  const uploadHandler = (file) => {
    return uploadMedia("session", sessionId, file);
  };

  // Early quit
  /*if (moduleLoader) {
    throw Error("Interrupted");
  }*/

  const { items, availableItems } = await moduleLoader.uploadFiles(
    uploadHandler
  );

  return {
    items: items.map((item) => ({
      ...item,
      id: uid(),
    })),
    availableItems,
    board: {
      translations: [],
      playerCount: [2, 4],
      defaultName: name,
      defaultLanguage: "en",
      defaultDescription: description,
      defaultBaseline: "",
      materialLanguage: "Multi-lang",
      minAge: "10",
      duration: [30, 90],
      imageUrl: "/game_assets/default.png",
      published: false,
    },
  };
};
