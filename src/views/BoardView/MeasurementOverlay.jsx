import React from "react";
import {
  useBoardConfig,
  useBoardPosition,
  useBoardState,
  useItems,
} from "react-sync-board";

const getDistance = (start, end) =>
  Math.hypot(end.x - start.x, end.y - start.y);

export const formatBoardDistance = (pixels, config = {}) => {
  const mode = config.measurementUnit || "centimeters";
  const pixelsPerUnit =
    mode === "inches"
      ? 96
      : mode === "free"
        ? Number(config.pixelsPerUnit) || 1
        : 96 / 2.5;
  const value = pixels / pixelsPerUnit;
  const unit =
    mode === "inches"
      ? "in"
      : mode === "free"
        ? config.unitLabel || "units"
        : "cm";
  return `${Number(value.toFixed(2))} ${unit}`;
};

const MeasurementOverlay = ({ enabled, onToggle, mode, setMode }) => {
  const [config] = useBoardConfig();
  const items = useItems();
  const camera = useBoardState((state) => state);
  const { fromWrapperToBoard } = useBoardPosition();
  const [measurement, setMeasurement] = React.useState(null);
  const measurementRef = React.useRef(null);
  const movingStarts = React.useRef(new Map());

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      )
        return;
      if (event.key.toLowerCase() === "m") onToggle();
      if (event.key.toLowerCase() === "l")
        setMode((current) => (current === "measure" ? "los" : "measure"));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onToggle, setMode]);

  const getPoint = (event) => {
    const rect = event.currentTarget
      .closest(".sync-board")
      .getBoundingClientRect();
    return fromWrapperToBoard(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  };
  const start = (event) => {
    if (!enabled || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const point = getPoint(event);
    measurementRef.current = { start: point, end: point, drawing: true };
    setMeasurement(measurementRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event) => {
    const current = measurementRef.current;
    if (!current?.drawing) return;
    measurementRef.current = { ...current, end: getPoint(event) };
    setMeasurement(measurementRef.current);
  };
  const stop = () => {
    if (!measurementRef.current?.drawing) return;
    measurementRef.current = { ...measurementRef.current, drawing: false };
    setMeasurement(measurementRef.current);
  };

  const movingItems = items.filter(
    (item) => item.moving && item.showMoveDistance
  );
  items.forEach((item) => {
    if (item.moving && !movingStarts.current.has(item.id))
      movingStarts.current.set(item.id, { x: item.x, y: item.y });
    if (!item.moving) movingStarts.current.delete(item.id);
  });
  return (
    <svg
      aria-label={mode === "los" ? "Line of sight" : "Measure distance"}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: enabled ? "auto" : "none",
        cursor: enabled ? "crosshair" : "default",
        zIndex: 10000,
      }}
    >
      {measurement && (
        <g pointerEvents="none">
          <line
            x1={measurement.start.x}
            y1={measurement.start.y}
            x2={measurement.end.x}
            y2={measurement.end.y}
            stroke="#ff3b30"
            strokeWidth={config.measurementLineWidth || 1}
          />
          <text
            x={(measurement.start.x + measurement.end.x) / 2}
            y={(measurement.start.y + measurement.end.y) / 2 - 8}
            fill="#ff3b30"
            fontSize="16"
            textAnchor="middle"
            stroke="white"
            strokeWidth="3"
            paintOrder="stroke"
          >
            {formatBoardDistance(
              getDistance(measurement.start, measurement.end),
              config
            )}
          </text>
        </g>
      )}
      {movingItems.map((item) => {
        const origin = movingStarts.current.get(item.id) || {
          x: item.x,
          y: item.y,
        };
        const center = { x: item.x, y: item.y };
        return (
          <g key={item.id} pointerEvents="none">
            <line
              x1={origin.x}
              y1={origin.y}
              x2={center.x}
              y2={center.y}
              stroke="#ff3b30"
              strokeWidth={config.measurementLineWidth || 1}
            />
            <text
              x={center.x}
              y={center.y - 12}
              fill="#ff3b30"
              fontSize="16"
              textAnchor="middle"
              stroke="white"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {formatBoardDistance(getDistance(origin, center), config)}
            </text>
          </g>
        );
      })}
      <metadata>{`${camera.translateX},${camera.translateY},${camera.scale},${camera.rotate}`}</metadata>
    </svg>
  );
};

export default MeasurementOverlay;
