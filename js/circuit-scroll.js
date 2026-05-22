const circuitLines = [...document.querySelectorAll(".circuit-energy")];
const circuitTracks = [...document.querySelectorAll(".circuit-track")];
const circuitLayer = document.querySelector(".circuit-scroll");
const circuitSvg = document.querySelector(".circuit-scroll-svg");
const circuitNodes = [...document.querySelectorAll(".circuit-nodes circle")];

if (circuitLines.length && circuitTracks.length && circuitLayer && circuitSvg) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileCircuitMedia = window.matchMedia("(max-width: 768px)");
  const svgNamespace = "http://www.w3.org/2000/svg";
  let documentHeight = 0;
  let exchangeBoostZones = [];
  let circuitSectionProfiles = [];
  let pauseStartY = 0;
  let preProjectLengths = [0, 0];
  let hasStartedScroll = window.scrollY > 0;
  let currentRevealY = 0;
  let targetRevealY = 0;
  let animationFrameId = 0;
  let animationTimeoutId = 0;
  let lastFrameTime = 0;
  let circuitPulseClock = 0;
  let isCompactViewport = false;
  let isCircuitActive = false;
  let lineEntryGroups = {
    tracks: [],
    energy: [],
  };
  let circuitNodeEntries = [];
  let idleMotionUntil = 0;
  const layerValueCache = Object.create(null);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const createSvgElement = (tagName, className) => {
    const element = document.createElementNS(svgNamespace, tagName);
    if (className) element.setAttribute("class", className);
    return element;
  };
  const ensureSvgGroup = (className, beforeSelector = ".circuit-nodes") => {
    const existingGroup = circuitSvg.querySelector(`.${className}`);
    if (existingGroup) return existingGroup;

    const group = createSvgElement("g", className);
    const anchor = beforeSelector ? circuitSvg.querySelector(beforeSelector) : null;
    circuitSvg.insertBefore(group, anchor || null);
    return group;
  };
  const smoothStep = (start, end, value) => {
    const progress = clamp((value - start) / (end - start), 0, 1);
    return progress * progress * (3 - 2 * progress);
  };

  const getGapCenter = (firstSelector, secondSelector, fallbackRatio) => {
    const first = document.querySelector(firstSelector);
    const second = document.querySelector(secondSelector);

    if (!first || !second) return documentHeight * fallbackRatio;

    const firstBottom = first.offsetTop + first.offsetHeight;
    const secondTop = second.offsetTop;
    return firstBottom + Math.max((secondTop - firstBottom) / 2, 42);
  };

  const addCircuitJog = (segments, baseX, y, offset, drop, direction) => {
    const innerX = baseX + offset * 0.55 * direction;
    const outerX = baseX + offset * direction;
    const midY = y + drop * 0.42;

    segments.push(
      `V ${Math.round(y)}`,
      `H ${Math.round(innerX)}`,
      `V ${Math.round(midY)}`,
      `H ${Math.round(outerX)}`,
      `V ${Math.round(y + drop)}`,
      `H ${Math.round(baseX)}`,
    );
  };

  const addCircuitBridge = (segments, fromX, toX, startY, drop, profile = {}) => {
    const xRatios = profile.xRatios || [0.28, 0.58, 0.84];
    const yRatios = profile.yRatios || [0.22, 0.56];
    const stepX1 = fromX + (toX - fromX) * xRatios[0];
    const stepX2 = fromX + (toX - fromX) * xRatios[1];
    const stepX3 = fromX + (toX - fromX) * xRatios[2];
    const stepY1 = startY + drop * yRatios[0];
    const stepY2 = startY + drop * yRatios[1];

    segments.push(
      `V ${Math.round(startY)}`,
      `H ${Math.round(stepX1)}`,
      `V ${Math.round(stepY1)}`,
      `H ${Math.round(stepX2)}`,
      `V ${Math.round(stepY2)}`,
      `H ${Math.round(stepX3)}`,
      `V ${Math.round(startY + drop)}`,
      `H ${Math.round(toX)}`,
    );
  };

  const setPathCollection = (layer, className, paths) => {
    layer.replaceChildren(
      ...paths
        .filter(Boolean)
        .map((d) => {
          const path = createSvgElement("path", className);
          path.setAttribute("d", d);
          return path;
        }),
    );

    return [...layer.querySelectorAll(`.${className}`)];
  };

  const measurePathLength = (d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path.getTotalLength();
  };

  const setLayerValue = (name, value) => {
    if (layerValueCache[name] === value) return;
    circuitLayer.style.setProperty(name, value);
    layerValueCache[name] = value;
  };

  const createLineEntries = (elements, preProjectLengths) =>
    elements.map((line, index) => {
      const length = line.getTotalLength();
      line.style.setProperty("--circuit-length", length);
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;

      return {
        line,
        length,
        preProjectLength: preProjectLengths[index] || 0,
        lastOffset: length,
      };
    });

  const setLineVisibleLength = (entry, visibleLength) => {
    const offset = entry.length - visibleLength;
    if (Math.abs(offset - entry.lastOffset) < 0.2) return;
    entry.line.style.strokeDashoffset = offset;
    entry.lastOffset = offset;
  };

  const syncNodeEntries = () => {
    circuitNodeEntries = circuitNodes.map((node) => ({
      node,
      y: Number(node.getAttribute("cy")) || 0,
      lit: node.classList.contains("is-lit"),
      hot: node.classList.contains("is-hot"),
    }));
  };

  const markCircuitActivity = () => {
    idleMotionUntil = performance.now() + 1400;
  };

  const clearScheduledAnimation = () => {
    if (animationTimeoutId) {
      clearTimeout(animationTimeoutId);
      animationTimeoutId = 0;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
  };

  const scheduleAnimation = (delay = 0) => {
    if (!isCircuitActive || animationFrameId || animationTimeoutId) return;

    if (delay <= 0) {
      animationFrameId = requestAnimationFrame(animateCircuits);
      return;
    }

    animationTimeoutId = window.setTimeout(() => {
      animationTimeoutId = 0;
      animationFrameId = requestAnimationFrame(animateCircuits);
    }, delay);
  };

  const collectSectionProfiles = () =>
    [
      {
        selector: "#home",
        range: 0.76,
        main: 0.72,
        node: 0.82,
        boost: 0.44,
        breath: 0.54,
      },
      {
        selector: "#about",
        range: 0.72,
        main: 0.86,
        node: 0.9,
        boost: 0.66,
        breath: 0.68,
      },
      {
        selector: "#process",
        range: 0.7,
        main: 0.98,
        node: 0.98,
        boost: 0.82,
        breath: 0.8,
      },
      {
        selector: ".stats",
        range: 0.68,
        main: 1,
        node: 1,
        boost: 0.88,
        breath: 0.84,
      },
      {
        selector: "#skills",
        range: 0.6,
        main: 0.58,
        node: 0.66,
        boost: 0.28,
        breath: 0.42,
      },
    ]
      .map((profile) => {
        const section = document.querySelector(profile.selector);
        if (!section) return null;

        return {
          ...profile,
          center:
            section.offsetTop +
            Math.min(section.offsetHeight * 0.34, window.innerHeight * 0.46),
        };
      })
      .filter(Boolean);

  const getSectionLighting = (focusY) => {
    const fallback = {
      main: 0.78,
      node: 0.82,
      boost: 0.48,
      breath: 0.58,
    };

    if (!circuitSectionProfiles.length) return fallback;

    let total = 0;
    const weighted = {
      main: 0,
      node: 0,
      boost: 0,
      breath: 0,
    };

    circuitSectionProfiles.forEach((profile) => {
      const proximity =
        1 -
        clamp(
          Math.abs(focusY - profile.center) / (window.innerHeight * profile.range),
          0,
          1,
        );
      const strength = proximity * proximity * (3 - 2 * proximity);

      if (strength <= 0) return;

      total += strength;
      weighted.main += profile.main * strength;
      weighted.node += profile.node * strength;
      weighted.boost += profile.boost * strength;
      weighted.breath += profile.breath * strength;
    });

    if (!total) return fallback;

    return {
      main: weighted.main / total,
      node: weighted.node / total,
      boost: weighted.boost / total,
      breath: weighted.breath / total,
    };
  };

  const getCircuitBreath = () =>
    reducedMotion.matches
      ? 0
      : (Math.sin(circuitPulseClock * (isCompactViewport ? 0.0019 : 0.00145)) + 1) / 2;

  const buildSidePath = ({
    x,
    targetX,
    direction,
    aboutProcessY,
    processStatsY,
    statsSkillsY,
    bridgeDrop,
    width,
    compact,
  }) => {
    const small = clamp(
      width * (compact ? 0.014 : 0.018),
      compact ? 12 : 16,
      compact ? 22 : 28,
    );
    const medium = clamp(
      width * (compact ? 0.021 : 0.03),
      compact ? 18 : 28,
      compact ? 34 : 48,
    );
    const shortDrop = clamp(
      width * (compact ? 0.014 : 0.017),
      compact ? 14 : 18,
      compact ? 24 : 30,
    );
    const mediumDrop = clamp(
      width * (compact ? 0.021 : 0.027),
      compact ? 20 : 28,
      compact ? 34 : 44,
    );
    const longDrop = clamp(
      width * (compact ? 0.03 : 0.04),
      compact ? 28 : 40,
      compact ? 48 : 62,
    );
    const afterFirstBridgeY = aboutProcessY + bridgeDrop;
    const afterSecondBridgeY = processStatsY + bridgeDrop;
    const middleSpan = Math.max(processStatsY - afterFirstBridgeY, 1);
    const betweenSecondThirdSpan = Math.max(statsSkillsY - afterSecondBridgeY, 1);
    const bridgeProfiles = compact
      ? [
          { xRatios: [0.22, 0.54, 0.82], yRatios: [0.2, 0.58] },
          { xRatios: [0.18, 0.48, 0.76], yRatios: [0.24, 0.62] },
          { xRatios: [0.24, 0.6, 0.86], yRatios: [0.18, 0.54] },
        ]
      : [
          { xRatios: [0.18, 0.46, 0.8], yRatios: [0.18, 0.58] },
          { xRatios: [0.24, 0.56, 0.82], yRatios: [0.26, 0.64] },
          { xRatios: [0.2, 0.5, 0.78], yRatios: [0.22, 0.56] },
        ];
    const segments = [`M ${Math.round(x)} 0`];

    if (compact) {
      addCircuitJog(
        segments,
        x,
        aboutProcessY * 0.34,
        small,
        shortDrop,
        direction,
      );
      addCircuitJog(
        segments,
        x,
        aboutProcessY * 0.72,
        medium,
        mediumDrop,
        -direction,
      );
    } else {
      addCircuitJog(
        segments,
        x,
        aboutProcessY * 0.28,
        small,
        shortDrop,
        direction,
      );
      addCircuitJog(
        segments,
        x,
        aboutProcessY * 0.56,
        medium,
        mediumDrop,
        -direction,
      );
      addCircuitJog(
        segments,
        x,
        aboutProcessY * 0.78,
        medium,
        shortDrop,
        direction,
      );
    }

    addCircuitBridge(segments, x, targetX, aboutProcessY, bridgeDrop, bridgeProfiles[0]);

    if (compact) {
      addCircuitJog(
        segments,
        targetX,
        afterFirstBridgeY + middleSpan * 0.38,
        medium,
        mediumDrop,
        direction,
      );
      addCircuitJog(
        segments,
        targetX,
        afterFirstBridgeY + middleSpan * 0.74,
        small,
        shortDrop,
        -direction,
      );
    } else {
      addCircuitJog(
        segments,
        targetX,
        afterFirstBridgeY + middleSpan * 0.22,
        medium,
        mediumDrop,
        direction,
      );
      addCircuitJog(
        segments,
        targetX,
        afterFirstBridgeY + middleSpan * 0.58,
        small,
        shortDrop,
        -direction,
      );
    }

    addCircuitBridge(segments, targetX, x, processStatsY, bridgeDrop, bridgeProfiles[1]);

    if (compact) {
      addCircuitJog(
        segments,
        x,
        afterSecondBridgeY + betweenSecondThirdSpan * 0.3,
        medium,
        longDrop,
        -direction,
      );
      addCircuitJog(
        segments,
        x,
        afterSecondBridgeY + betweenSecondThirdSpan * 0.72,
        small,
        shortDrop,
        direction,
      );
    } else {
      addCircuitJog(
        segments,
        x,
        afterSecondBridgeY + betweenSecondThirdSpan * 0.18,
        medium,
        longDrop,
        -direction,
      );
      addCircuitJog(
        segments,
        x,
        afterSecondBridgeY + betweenSecondThirdSpan * 0.52,
        medium,
        mediumDrop,
        direction,
      );
    }
    addCircuitBridge(segments, x, targetX, statsSkillsY, bridgeDrop, bridgeProfiles[2]);
    const preProjectPath = segments.join(" ");
    return {
      fullPath: preProjectPath,
      preProjectPath,
    };
  };

  const buildCircuitPaths = () => {
    documentHeight = document.documentElement.scrollHeight;
    const width = document.documentElement.clientWidth;
    const compact = width <= 900;
    isCompactViewport = compact;
    const sideOffset = compact
      ? clamp(width * 0.058, 24, 40)
      : clamp(width * 0.09, 58, 118);
    const bridgeDrop = compact
      ? clamp(width * 0.052, 28, 42)
      : clamp(width * 0.045, 34, 58);
    const leftX = sideOffset;
    const rightX = width - sideOffset;
    const aboutProcessY = getGapCenter("#about", "#process", 0.24);
    const processStatsY = getGapCenter("#process", ".stats", 0.42);
    const statsSkillsY = getGapCenter(".stats", "#skills", 0.52);
    circuitSectionProfiles = collectSectionProfiles();
    const exchangeBoostPadding = window.innerHeight * (compact ? 0.16 : 0.22);
    const leftBridgeX = leftX + (rightX - leftX) * 0.28;
    const rightBridgeX = rightX + (leftX - rightX) * 0.28;
    const leftReturnBridgeX = rightX + (leftX - rightX) * 0.28;
    const rightReturnBridgeX = leftX + (rightX - leftX) * 0.28;
    const leftThirdBridgeX = leftX + (rightX - leftX) * 0.28;
    const rightThirdBridgeX = rightX + (leftX - rightX) * 0.28;
    pauseStartY = statsSkillsY + bridgeDrop;
    exchangeBoostZones = [
      [
        clamp((aboutProcessY - exchangeBoostPadding) / documentHeight, 0, 1),
        clamp(
          (aboutProcessY + bridgeDrop + exchangeBoostPadding) / documentHeight,
          0,
          1,
        ),
      ],
      [
        clamp((processStatsY - exchangeBoostPadding) / documentHeight, 0, 1),
        clamp(
          (processStatsY + bridgeDrop + exchangeBoostPadding) / documentHeight,
          0,
          1,
        ),
      ],
      [
        clamp((statsSkillsY - exchangeBoostPadding) / documentHeight, 0, 1),
        clamp(
          (statsSkillsY + bridgeDrop + exchangeBoostPadding) / documentHeight,
          0,
          1,
        ),
      ],
    ];

    const leftPath = buildSidePath({
      x: leftX,
      targetX: rightX,
      direction: 1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      bridgeDrop,
      width,
      compact,
    });

    const rightPath = buildSidePath({
      x: rightX,
      targetX: leftX,
      direction: -1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      bridgeDrop,
      width,
      compact,
    });
    preProjectLengths = [
      measurePathLength(leftPath.preProjectPath),
      measurePathLength(rightPath.preProjectPath),
    ];

    circuitLayer.style.height = `${documentHeight}px`;
    circuitSvg.setAttribute("viewBox", `0 0 ${width} ${documentHeight}`);
    circuitTracks[0].setAttribute("d", leftPath.fullPath);
    circuitTracks[1].setAttribute("d", rightPath.fullPath);
    circuitLines[0].setAttribute("d", leftPath.fullPath);
    circuitLines[1].setAttribute("d", rightPath.fullPath);
    const nodePositions = [
      [leftX, aboutProcessY * 0.28],
      [leftX, aboutProcessY],
      [leftBridgeX, aboutProcessY],
      [rightX, aboutProcessY + bridgeDrop],
      [rightX, processStatsY],
      [leftReturnBridgeX, processStatsY],
      [leftX, processStatsY + bridgeDrop],
      [leftX, statsSkillsY],
      [leftThirdBridgeX, statsSkillsY],
      [rightX, statsSkillsY + bridgeDrop],
      [rightX, aboutProcessY * 0.28],
      [rightX, aboutProcessY],
      [rightBridgeX, aboutProcessY],
      [leftX, aboutProcessY + bridgeDrop],
      [leftX, processStatsY],
      [rightReturnBridgeX, processStatsY],
      [rightX, processStatsY + bridgeDrop],
      [leftX, statsSkillsY + bridgeDrop],
    ];

    circuitNodes.forEach((node, index) => {
      const position = nodePositions[index];
      if (!position) return;

      node.setAttribute("cx", position[0]);
      node.setAttribute("cy", position[1]);
      node.setAttribute(
        "r",
        compact
          ? clamp(width * 0.0025, 2.6, 4.2)
          : clamp(width * 0.0032, 3.5, 5.5),
      );
    });

    syncNodeEntries();
  };

  const prepareLines = () => {
    lineEntryGroups = {
      tracks: createLineEntries(circuitTracks, preProjectLengths),
      energy: createLineEntries(circuitLines, preProjectLengths),
    };
  };

  const getTargetRevealY = () => {
    if (!hasStartedScroll) return 0;
    if (reducedMotion.matches) return documentHeight;
    return clamp(window.scrollY + window.innerHeight * 0.82, 0, documentHeight);
  };

  const getMinimumVisibleRevealY = () => {
    if (!hasStartedScroll) return 0;
    return clamp(window.scrollY + window.innerHeight * 0.18, 0, documentHeight);
  };

  const getBoostedProgress = (revealY) => {
    const baseProgress = clamp(revealY / documentHeight, 0, 1);
    const exchangeBoost = exchangeBoostZones.reduce((sum, zone) => {
      const [zoneStart, zoneEnd] = zone;
      return sum + smoothStep(zoneStart, zoneEnd, baseProgress) * 0.075;
    }, 0);

    return clamp(baseProgress + exchangeBoost, 0, 1);
  };

  const getVisibleLengthResolver = (revealY) => {
    if (reducedMotion.matches || revealY >= documentHeight) {
      return (entry) => entry.length;
    }

    if (revealY <= 0) {
      return () => 0;
    }

    if (revealY >= pauseStartY) {
      return (entry) => entry.preProjectLength;
    }

    const boostedProgress = getBoostedProgress(revealY);
    const pauseStartProgress = getBoostedProgress(pauseStartY);
    const prePauseProgress =
      pauseStartProgress > 0
        ? clamp(boostedProgress / pauseStartProgress, 0, 1)
        : 0;

    return (entry) => entry.preProjectLength * prePauseProgress;
  };

  const renderCircuits = (revealY) => {
    if (!isCircuitActive) return;
    const focusY = clamp(window.scrollY + window.innerHeight * 0.5, 0, documentHeight);
    const lighting = getSectionLighting(focusY);
    const breath = getCircuitBreath() * lighting.breath;
    const waveBoost = clamp(lighting.boost * (0.58 + breath * 0.34) + breath * 0.06, 0, 1);
    const hotRange = window.innerHeight * (isCompactViewport ? 0.14 : 0.18);
    const mainVisibleLengths = [];
    const resolveVisibleLength = getVisibleLengthResolver(revealY);

    setLayerValue("--circuit-boost", waveBoost.toFixed(3));
    setLayerValue("--circuit-breath", breath.toFixed(3));
    setLayerValue("--circuit-zone-main", lighting.main.toFixed(3));
    setLayerValue("--circuit-zone-node", lighting.node.toFixed(3));

    circuitNodeEntries.forEach((entry) => {
      const isLit = revealY + 30 >= entry.y;
      const isHot = isLit && Math.abs(entry.y - focusY) <= hotRange;

      if (entry.lit !== isLit) {
        entry.node.classList.toggle("is-lit", isLit);
        entry.lit = isLit;
      }

      if (entry.hot !== isHot) {
        entry.node.classList.toggle("is-hot", isHot);
        entry.hot = isHot;
      }
    });

    [...lineEntryGroups.tracks, ...lineEntryGroups.energy].forEach((entry, index) => {
      const visibleLength = resolveVisibleLength(entry);
      if (index >= lineEntryGroups.tracks.length) {
        mainVisibleLengths[index - lineEntryGroups.tracks.length] = visibleLength;
      }
      setLineVisibleLength(entry, visibleLength);
    });
  };

  const animateCircuits = (timestamp = 0) => {
    if (!isCircuitActive) {
      animationFrameId = 0;
      return;
    }
    animationTimeoutId = 0;
    animationFrameId = 0;
    if (!lastFrameTime) lastFrameTime = timestamp;
    const delta = timestamp - lastFrameTime;
    const safeDelta = delta > 120 ? 16 : clamp(delta, 0, 34);
    lastFrameTime = timestamp;
    targetRevealY = getTargetRevealY();

    if (reducedMotion.matches) {
      currentRevealY = targetRevealY;
    } else {
      circuitPulseClock += safeDelta;
      const distance = targetRevealY - currentRevealY;
      const step = clamp(Math.abs(distance) * 0.055, 3.2, 11);

      if (Math.abs(distance) <= step) currentRevealY = targetRevealY;
      else currentRevealY += Math.sign(distance) * step;

      currentRevealY = Math.max(currentRevealY, getMinimumVisibleRevealY());
      currentRevealY = clamp(currentRevealY, 0, documentHeight);
    }

    renderCircuits(currentRevealY);

    const isSettled = Math.abs(targetRevealY - currentRevealY) <= 0.5;
    const isAmbientActive = !reducedMotion.matches && timestamp < idleMotionUntil;

    if (!isSettled || isAmbientActive) {
      scheduleAnimation(isSettled ? 48 : 16);
    }
  };

  const requestDraw = () => {
    if (!isCircuitActive) return;
    targetRevealY = getTargetRevealY();
    scheduleAnimation();
  };

  const disableCircuits = () => {
    isCircuitActive = false;
    clearScheduledAnimation();
    lastFrameTime = 0;
    currentRevealY = 0;
    targetRevealY = 0;
    circuitPulseClock = 0;
    circuitLayer.style.display = "none";
  };

  const enableCircuits = () => {
    circuitLayer.style.removeProperty("display");
    buildCircuitPaths();
    prepareLines();
    isCircuitActive = true;
    currentRevealY = 0;
    targetRevealY = getTargetRevealY();
    lastFrameTime = 0;
    markCircuitActivity();
    renderCircuits(0);
    requestDraw();
  };

  const syncCircuitMode = () => {
    if (mobileCircuitMedia.matches) {
      disableCircuits();
      return;
    }

    if (!isCircuitActive) {
      enableCircuits();
      return;
    }

    circuitLayer.style.removeProperty("display");
    buildCircuitPaths();
    prepareLines();
    currentRevealY = clamp(currentRevealY, 0, documentHeight);
    lastFrameTime = 0;
    markCircuitActivity();
    requestDraw();
  };

  syncCircuitMode();

  window.addEventListener(
    "scroll",
    () => {
      hasStartedScroll = window.scrollY > 0;
      if (!isCircuitActive) return;
      markCircuitActivity();
      requestDraw();
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    hasStartedScroll = window.scrollY > 0;
    syncCircuitMode();
  });
  reducedMotion.addEventListener("change", () => {
    if (!isCircuitActive) return;
    lastFrameTime = 0;
    targetRevealY = getTargetRevealY();
    markCircuitActivity();
    requestDraw();
  });
  mobileCircuitMedia.addEventListener("change", () => {
    hasStartedScroll = window.scrollY > 0;
    syncCircuitMode();
  });
  document.addEventListener("visibilitychange", () => {
    if (!isCircuitActive) return;
    lastFrameTime = 0;
    if (document.hidden) return;
    markCircuitActivity();
    requestDraw();
  });
}
