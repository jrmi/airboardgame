import React from "react";

import { isMacOS } from "../../utils/deviceInfos";

const otherPointer = (pointers, currentPointer) => {
  const p2 = Object.keys(pointers)
    .map((p) => Number(p))
    .find((pointer) => pointer !== currentPointer);
  return pointers[p2];
};

const computeDistance = ([x1, y1], [x2, y2]) => {
  const distanceX = Math.abs(x1 - x2);
  const distanceY = Math.abs(y1 - y2);

  return Math.hypot(distanceX, distanceY);
};

const Gesture = ({
  children,
  onDrag = () => {},
  onDragStart = () => {},
  onDragEnd = () => {},
  onPan = () => {},
  onTap = () => {},
  onLongTap = () => {},
  onZoom = () => {},
}) => {
  const wrapperRef = React.useRef(null);
  const stateRef = React.useRef({
    moving: false,
    pointers: {},
    mainPointer: undefined,
  });
  const queueRef = React.useRef([]);

  // Queue event to avoid async mess
  const queue = React.useCallback((callback) => {
    queueRef.current.push(async () => {
      await callback();
      queueRef.current.shift();
      if (queueRef.current.length !== 0) {
        await queueRef.current[0]();
      }
    });
    if (queueRef.current.length === 1) {
      queueRef.current[0]();
    }
  }, []);

  const onWheel = React.useCallback(
    (e) => {
      const {
        deltaX,
        deltaY,
        clientX,
        clientY,
        ctrlKey,
        altKey,
        metaKey,
        target,
      } = e;

      // On a MacOs trackpad, the pinch gesture sets the ctrlKey to true.
      // In that situation, we want to use the custom scaling, not the browser default zoom.
      // Hence in this situation we avoid to return immediately.
      if (altKey || (ctrlKey && !isMacOS())) {
        return;
      }

      // On a trackpad, the pinch and pan events are differentiated by the crtlKey value.
      // On a pinch gesture, the ctrlKey is set to true, so we want to have a scaling effect.
      // If we are only moving the fingers in the same direction, a pan is needed.
      // Ref: https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
      if (isMacOS() && !ctrlKey) {
        queue(() =>
          onPan({
            deltaX: -2 * deltaX,
            deltaY: -2 * deltaY,
            button: 1,
            ctrlKey,
            metaKey,
            target,
            event: e,
          })
        );
      } else {
        if (!deltaY) {
          return;
        }
        const scaleMult = 1 - (deltaY > 0 ? 1 : -1) / 5;
        queue(() => onZoom({ scale: scaleMult, clientX, clientY, event: e }));
      }
    },
    [onPan, onZoom, queue]
  );

  const onPointerDown = React.useCallback(
    ({
      target,
      button,
      clientX,
      clientY,
      pointerId,
      altKey,
      ctrlKey,
      metaKey,
    }) => {
      // Add pointer to map
      stateRef.current.pointers[pointerId] = { clientX, clientY };

      if (stateRef.current.mainPointer !== undefined) {
        if (stateRef.current.mainPointer !== pointerId) {
          // This is not the main pointer
          try {
            const { clientX: clientX2, clientY: clientY2 } = otherPointer(
              stateRef.current.pointers,
              pointerId
            );
            const newClientX = (clientX2 + clientX) / 2;
            const newClientY = (clientY2 + clientY) / 2;

            const distance = computeDistance(
              [clientX2, clientY2],
              [clientX, clientY]
            );

            // We update previous position as the new position is the center beetween both finger
            Object.assign(stateRef.current, {
              pressed: true,
              moving: false,
              gestureStart: false,
              startX: clientX,
              startY: clientY,
              prevX: newClientX,
              prevY: newClientY,
              startDistance: distance,
              prevDistance: distance,
            });
          } catch (e) {
            console.log("Error while getting other pointer. Ignoring", e);
            console.log(stateRef.current.pointers, pointerId);
            stateRef.current.mainPointer === undefined;
          }
        }

        return;
      }

      // We set the mainpointer
      stateRef.current.mainPointer = pointerId;

      // And prepare move
      Object.assign(stateRef.current, {
        pressed: true,
        moving: false,
        gestureStart: false,
        startX: clientX,
        startY: clientY,
        prevX: clientX,
        prevY: clientY,
        currentButton: button,
        target,
        timeStart: Date.now(),
        longTapTimeout: setTimeout(async () => {
          stateRef.current.noTap = true;
          queue(() =>
            onLongTap({
              clientX,
              clientY,
              altKey,
              ctrlKey,
              metaKey,
              target,
            })
          );
        }, 750),
      });

      try {
        target.setPointerCapture(pointerId);
      } catch (e) {
        console.log("Fail to capture pointer", e);
      }
    },
    [onLongTap, queue]
  );

  const onPointerMove = React.useCallback(
    (e) => {
      if (stateRef.current.pressed) {
        const {
          pointerId,
          clientX: eventClientX,
          clientY: eventClientY,
          altKey,
          ctrlKey,
          metaKey,
          pointerType,
        } = e;

        if (stateRef.current.mainPointer !== pointerId) {
          // Event from other pointer
          stateRef.current.pointers[pointerId] = {
            clientX: eventClientX,
            clientY: eventClientY,
          };
          return;
        }

        stateRef.current.moving = true;

        // Do we have two finger ?
        const twoFingers = Object.keys(stateRef.current.pointers).length === 2;

        let clientX, clientY, distance;

        if (twoFingers) {
          // Find other pointerId
          const { clientX: clientX2, clientY: clientY2 } = otherPointer(
            stateRef.current.pointers,
            pointerId
          );

          // Update client X with the center of each touch
          clientX = (clientX2 + eventClientX) / 2;
          clientY = (clientY2 + eventClientY) / 2;
          distance = computeDistance(
            [clientX2, clientY2],
            [eventClientX, eventClientY]
          );
        } else {
          clientX = eventClientX;
          clientY = eventClientY;
        }

        // We drag if
        // On non touch device
        //   - Button is 0
        //   - Alt key is no pressed
        // or on touch devices
        //   - We use only one finger
        const shouldDrag =
          pointerType !== "touch"
            ? stateRef.current.currentButton === 0 && !altKey
            : !twoFingers;

        if (shouldDrag) {
          // Send drag start on first move
          if (!stateRef.current.gestureStart) {
            wrapperRef.current.style.cursor = "move";
            stateRef.current.gestureStart = true;
            // Clear tap timeout
            clearTimeout(stateRef.current.longTapTimeout);

            queue(() =>
              onDragStart({
                deltaX: 0,
                deltaY: 0,
                startX: stateRef.current.startX,
                startY: stateRef.current.startY,
                distanceX: 0,
                distanceY: 0,
                button: stateRef.current.currentButton,
                altKey,
                ctrlKey,
                metaKey,
                target: stateRef.current.target,
                event: e,
              })
            );
          }
          // Create closure
          const deltaX = clientX - stateRef.current.prevX;
          const deltaY = clientY - stateRef.current.prevY;
          const distanceX = clientX - stateRef.current.startX;
          const distanceY = clientY - stateRef.current.startY;

          // Drag event
          queue(() =>
            onDrag({
              deltaX,
              deltaY,
              startX: stateRef.current.startX,
              startY: stateRef.current.startY,
              distanceX,
              distanceY,
              button: stateRef.current.currentButton,
              altKey,
              ctrlKey,
              metaKey,
              target: stateRef.current.target,
              event: e,
            })
          );
        } else {
          if (!stateRef.current.gestureStart) {
            wrapperRef.current.style.cursor = "move";
            stateRef.current.gestureStart = true;
            // Clear tap timeout on first move
            clearTimeout(stateRef.current.longTapTimeout);
          }

          // Create closure
          const deltaX = clientX - stateRef.current.prevX;
          const deltaY = clientY - stateRef.current.prevY;
          const target = stateRef.current.target;

          // Pan event
          queue(() =>
            onPan({
              deltaX,
              deltaY,
              button: stateRef.current.currentButton,
              altKey,
              ctrlKey,
              metaKey,
              target,
              event: e,
            })
          );

          if (twoFingers && distance !== stateRef.current.prevDistance) {
            const deltaY = stateRef.current.prevDistance - distance;

            if (Math.abs(deltaY) > 10) {
              const scaleMult = 1 - (deltaY > 0 ? 1 : -1) / 10;
              queue(() =>
                onZoom({
                  scale: scaleMult,
                  clientX,
                  clientY,
                  event: e,
                })
              );
              stateRef.current.prevDistance = distance;
            }
          }
        }

        stateRef.current.prevX = clientX;
        stateRef.current.prevY = clientY;
      }
    },
    [onDrag, onDragStart, onPan, onZoom, queue]
  );

  const onPointerUp = React.useCallback(
    (e) => {
      const {
        clientX,
        clientY,
        altKey,
        ctrlKey,
        metaKey,
        target,
        pointerId,
      } = e;

      // Remove pointer from map
      delete stateRef.current.pointers[pointerId];

      if (stateRef.current.mainPointer !== pointerId) {
        // If this is not the main pointer we quit here
        return;
      }

      if (Object.keys(stateRef.current.pointers).length > 0) {
        // If was main pointer but we have another one, this one become main
        stateRef.current.mainPointer = Number(
          Object.keys(stateRef.current.pointers)[0]
        );
        try {
          stateRef.current.target.setPointerCapture(
            stateRef.current.mainPointer
          );
        } catch (e) {
          console.log("Fails to set pointer capture", e);
        }
        return;
      }

      stateRef.current.mainPointer = undefined;
      stateRef.current.pressed = false;

      // Clear longTap
      clearTimeout(stateRef.current.longTapTimeout);

      if (stateRef.current.moving) {
        // If we were moving, send drag end event
        stateRef.current.moving = false;
        queue(() =>
          onDragEnd({
            deltaX: clientX - stateRef.current.prevX,
            deltaY: clientY - stateRef.current.prevY,
            startX: stateRef.current.startX,
            startY: stateRef.current.startY,
            distanceX: clientX - stateRef.current.startX,
            distanceY: clientY - stateRef.current.startY,
            button: stateRef.current.currentButton,
            altKey,
            ctrlKey,
            metaKey,
            event: e,
          })
        );
        wrapperRef.current.style.cursor = "auto";
      } else {
        const now = Date.now();

        if (stateRef.current.noTap) {
          stateRef.current.noTap = false;
        } else {
          // Send tap event only if time less than 300ms
          if (stateRef.current.timeStart - now < 300) {
            queue(() =>
              onTap({
                clientX,
                clientY,
                altKey,
                ctrlKey,
                metaKey,
                target,
              })
            );
          }
        }
      }
    },
    [onDragEnd, onTap, queue]
  );

  return (
    <div
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: "none" }}
      ref={wrapperRef}
    >
      {children}
    </div>
  );
};

export default Gesture;
