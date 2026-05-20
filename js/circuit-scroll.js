const circuitLines = [...document.querySelectorAll(".circuit-energy")];
const circuitTracks = [...document.querySelectorAll(".circuit-track")];
const circuitLayer = document.querySelector(".circuit-scroll");
const circuitSvg = document.querySelector(".circuit-scroll-svg");
const circuitNodes = [...document.querySelectorAll(".circuit-nodes circle")];

if (circuitLines.length && circuitTracks.length && circuitLayer && circuitSvg) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const svgNamespace = "http://www.w3.org/2000/svg";
  let documentHeight = 0;
  let exchangeBoostZones = [];
  let circuitSectionProfiles = [];
  let pauseStartY = 0;
  let pauseEndY = 0;
  let preProjectLengths = [0, 0];
  let preProjectGhostLengths = [0, 0];
  let preProjectDetailLengths = [0, 0];
  let preProjectAccentLengths = [0, 0];
  let hasStartedScroll = window.scrollY > 0;
  let currentRevealY = 0;
  let targetRevealY = 0;
  let animationFrameId = 0;
  let lastFrameTime = 0;
  let circuitPulseClock = 0;
  let isCompactViewport = false;
  let isPhoneViewport = false;
  let circuitDetailPaths = [];
  let circuitDetailNodes = [];
  let circuitGhostPaths = [];
  let circuitAccentPaths = [];
  let circuitMicroNodes = [];
  let circuitPulseSprites = [];
  let circuitPulseDescriptors = [];

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
  const circuitGhostLayer = ensureSvgGroup("circuit-ghosts");
  const circuitDetailLayer = ensureSvgGroup("circuit-details");
  const circuitAccentLayer = ensureSvgGroup("circuit-accents");
  const circuitDetailNodeLayer = ensureSvgGroup("circuit-detail-nodes");
  const circuitMicroNodeLayer = ensureSvgGroup("circuit-micro-nodes");
  const circuitPulseLayer = ensureSvgGroup("circuit-pulses", null);

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

  const setNodeCollection = (layer, className, positions, radius) => {
    layer.replaceChildren(
      ...positions.map(([x, y]) => {
        const node = createSvgElement("circle", className);
        node.setAttribute("cx", Math.round(x));
        node.setAttribute("cy", Math.round(y));
        node.setAttribute("r", radius);
        return node;
      }),
    );

    return [...layer.querySelectorAll(`.${className}`)];
  };

  const setPulseCollection = (layer, descriptors) => {
    layer.replaceChildren(
      ...descriptors.map(() => {
        const group = createSvgElement("g", "circuit-pulse");
        const shadow = createSvgElement("circle", "circuit-pulse-shadow");
        const veil = createSvgElement("circle", "circuit-pulse-veil");
        const halo = createSvgElement("circle", "circuit-pulse-halo");
        const core = createSvgElement("circle", "circuit-pulse-core");

        shadow.setAttribute("fill", "url(#circuitPulseShadow)");
        veil.setAttribute("fill", "url(#circuitPulseVeil)");
        halo.setAttribute("fill", "url(#circuitPulseHalo)");
        core.setAttribute("fill", "url(#circuitPulseCore)");
        group.append(shadow, veil, halo, core);
        return group;
      }),
    );

    return [...layer.querySelectorAll(".circuit-pulse")].map((group) => ({
      group,
      shadow: group.querySelector(".circuit-pulse-shadow"),
      veil: group.querySelector(".circuit-pulse-veil"),
      halo: group.querySelector(".circuit-pulse-halo"),
      core: group.querySelector(".circuit-pulse-core"),
    }));
  };

  const measurePathLength = (d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path.getTotalLength();
  };

  const collectSectionProfiles = () =>
    [
      {
        selector: "#home",
        range: 0.76,
        main: 0.72,
        ghost: 0.78,
        accent: 0.68,
        detail: 0.72,
        node: 0.82,
        pulse: 0.76,
        boost: 0.44,
        breath: 0.54,
      },
      {
        selector: "#about",
        range: 0.72,
        main: 0.86,
        ghost: 0.82,
        accent: 0.84,
        detail: 0.88,
        node: 0.9,
        pulse: 0.88,
        boost: 0.66,
        breath: 0.68,
      },
      {
        selector: "#process",
        range: 0.7,
        main: 0.98,
        ghost: 0.88,
        accent: 0.98,
        detail: 0.94,
        node: 0.98,
        pulse: 0.98,
        boost: 0.82,
        breath: 0.8,
      },
      {
        selector: ".stats",
        range: 0.68,
        main: 1,
        ghost: 0.9,
        accent: 1,
        detail: 0.98,
        node: 1,
        pulse: 1,
        boost: 0.88,
        breath: 0.84,
      },
      {
        selector: "#skills",
        range: 0.6,
        main: 0.58,
        ghost: 0.52,
        accent: 0.48,
        detail: 0.54,
        node: 0.66,
        pulse: 0.54,
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
      ghost: 0.72,
      accent: 0.74,
      detail: 0.76,
      node: 0.82,
      pulse: 0.8,
      boost: 0.48,
      breath: 0.58,
    };

    if (!circuitSectionProfiles.length) return fallback;

    let total = 0;
    const weighted = {
      main: 0,
      ghost: 0,
      accent: 0,
      detail: 0,
      node: 0,
      pulse: 0,
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
      weighted.ghost += profile.ghost * strength;
      weighted.accent += profile.accent * strength;
      weighted.detail += profile.detail * strength;
      weighted.node += profile.node * strength;
      weighted.pulse += profile.pulse * strength;
      weighted.boost += profile.boost * strength;
      weighted.breath += profile.breath * strength;
    });

    if (!total) return fallback;

    return {
      main: weighted.main / total,
      ghost: weighted.ghost / total,
      accent: weighted.accent / total,
      detail: weighted.detail / total,
      node: weighted.node / total,
      pulse: weighted.pulse / total,
      boost: weighted.boost / total,
      breath: weighted.breath / total,
    };
  };

  const getCircuitBreath = () =>
    reducedMotion.matches
      ? 0
      : (Math.sin(circuitPulseClock * (isCompactViewport ? 0.0019 : 0.00145)) + 1) / 2;

  const addCircuitTap = (segments, x, y, length, direction) => {
    segments.push(
      `M ${Math.round(x)} ${Math.round(y)}`,
      `H ${Math.round(x + length * direction)}`,
    );
  };

  const addCircuitBranch = (
    segments,
    nodes,
    x,
    y,
    reach,
    drop,
    tail,
    direction,
  ) => {
    const elbowX = x + reach * direction;
    const endY = y + drop;
    const endX = elbowX + tail * direction;

    segments.push(
      `M ${Math.round(x)} ${Math.round(y)}`,
      `H ${Math.round(elbowX)}`,
      `V ${Math.round(endY)}`,
      `H ${Math.round(endX)}`,
    );
    nodes.push([endX, endY]);
  };

  const addCircuitDetailSpan = (
    segments,
    nodes,
    x,
    direction,
    startY,
    endY,
    width,
    emphasis = 1,
    invertPattern = false,
    compact = false,
  ) => {
    const span = endY - startY;
    if (span < 56) return;

    const shortReach = clamp(
      width * (compact ? 0.01 : 0.013) * emphasis,
      compact ? 8 : 12,
      compact ? 16 : 20,
    );
    const mediumReach = clamp(
      width * (compact ? 0.014 : 0.018) * emphasis,
      compact ? 14 : 18,
      compact ? 22 : 30,
    );
    const longReach = clamp(
      width * (compact ? 0.018 : 0.024) * emphasis,
      compact ? 18 : 24,
      compact ? 28 : 40,
    );
    const tapShort = clamp(width * (compact ? 0.0045 : 0.0065), 4, compact ? 8 : 10);
    const tapLong = clamp(width * (compact ? 0.006 : 0.009), 6, compact ? 10 : 14);
    const dropSmall = clamp(
      width * (compact ? 0.0095 : 0.012),
      compact ? 9 : 12,
      compact ? 15 : 20,
    );
    const dropMedium = clamp(
      width * (compact ? 0.014 : 0.018),
      compact ? 14 : 18,
      compact ? 22 : 28,
    );
    const branchPattern = compact
      ? span > 220
        ? [
            [0.24, shortReach, dropSmall, tapShort],
            [0.56, longReach * 0.86, dropMedium, tapLong * 0.82],
            [0.82, mediumReach, dropSmall, tapShort * 0.9],
          ]
        : [
            [0.32, shortReach, dropSmall, tapShort],
            [0.72, mediumReach, dropMedium * 0.9, tapShort],
          ]
      : span > 260
        ? [
            [0.16, shortReach, dropSmall, tapShort],
            [0.35, longReach, dropMedium, tapLong],
            [0.61, mediumReach, dropSmall, tapShort],
            [0.82, longReach * 0.78, dropMedium * 0.92, tapShort],
          ]
        : [
            [0.22, shortReach, dropSmall, tapShort],
            [0.56, longReach * 0.88, dropMedium, tapLong * 0.88],
            [0.8, mediumReach, dropSmall, tapShort],
          ];

    addCircuitTap(
      segments,
      x,
      startY + span * (compact ? 0.12 : 0.08),
      tapShort * 0.92,
      direction,
    );
    if (!compact) {
      addCircuitTap(segments, x, startY + span * 0.72, tapLong * 0.72, direction);
    }

    branchPattern.forEach(([ratio, reach, drop, tail], index) => {
      const branchDirection =
        direction * ((index + Number(invertPattern)) % 2 === 0 ? 1 : -1);

      addCircuitBranch(
        segments,
        nodes,
        x,
        startY + span * ratio,
        reach,
        drop,
        tail,
        branchDirection,
      );
    });
  };

  const buildCircuitDetailPath = ({
    x,
    targetX,
    direction,
    aboutProcessY,
    processStatsY,
    statsSkillsY,
    projectsResumeY,
    bridgeDrop,
    width,
    compact,
  }) => {
    const afterFirstBridgeY = aboutProcessY + bridgeDrop;
    const afterSecondBridgeY = processStatsY + bridgeDrop;
    const segments = [];
    const nodes = [];

    addCircuitDetailSpan(
      segments,
      nodes,
      x,
      direction,
      20,
      aboutProcessY * 0.92,
      width,
      1,
      false,
      compact,
    );
    addCircuitDetailSpan(
      segments,
      nodes,
      targetX,
      -direction,
      afterFirstBridgeY + 20,
      processStatsY - 12,
      width,
      0.94,
      true,
      compact,
    );
    addCircuitDetailSpan(
      segments,
      nodes,
      x,
      direction,
      afterSecondBridgeY + 16,
      statsSkillsY - 10,
      width,
      1.08,
      true,
      compact,
    );
    const preProjectPath = segments.join(" ");

    return {
      fullPath: preProjectPath,
      preProjectPath,
      nodes,
    };
  };

  const addAccentRun = (segments, nodes, x, y, vertical, lip, direction) => {
    const endY = y + vertical;
    const lipX = x + lip * direction;

    segments.push(
      `M ${Math.round(x)} ${Math.round(y)} V ${Math.round(endY)}`,
      `M ${Math.round(x)} ${Math.round(endY)} H ${Math.round(lipX)}`,
    );
    nodes.push([lipX, endY]);
  };

  const addAccentBridge = (segments, nodes, x1, x2, y) => {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const inset = (right - left) * 0.4;
    const fromX = left + inset;
    const toX = right - inset;

    segments.push(`M ${Math.round(fromX)} ${Math.round(y)} H ${Math.round(toX)}`);
    nodes.push([toX, y]);
  };

  const addGhostFragment = (segments, x, y, reach, drop, direction) => {
    segments.push(
      `M ${Math.round(x)} ${Math.round(y)}`,
      `H ${Math.round(x + reach * direction)}`,
      `V ${Math.round(y + drop)}`,
    );
  };

  const addGhostBridge = (segments, x1, x2, y, offset) => {
    const span = x2 - x1;
    const firstX = x1 + span * 0.34;
    const secondX = x1 + span * 0.66;

    segments.push(
      `M ${Math.round(firstX)} ${Math.round(y)}`,
      `H ${Math.round(secondX)}`,
      `V ${Math.round(y + offset)}`,
    );
  };

  const buildCircuitAccentPath = ({
    x,
    targetX,
    direction,
    aboutProcessY,
    processStatsY,
    statsSkillsY,
    projectsResumeY,
    bridgeDrop,
    width,
    compact,
    phone,
  }) => {
    const afterFirstBridgeY = aboutProcessY + bridgeDrop;
    const afterSecondBridgeY = processStatsY + bridgeDrop;
    const afterThirdBridgeY = statsSkillsY + bridgeDrop;
    const middleSpan = Math.max(processStatsY - afterFirstBridgeY, 1);
    const betweenSecondThirdSpan = Math.max(statsSkillsY - afterSecondBridgeY, 1);
    const lowerSpan = Math.max(documentHeight - projectsResumeY, 1);
    const accentShort = clamp(width * (compact ? 0.014 : 0.018), compact ? 12 : 16, compact ? 22 : 28);
    const accentLong = clamp(width * (compact ? 0.02 : 0.026), compact ? 18 : 24, compact ? 30 : 42);
    const accentLip = clamp(width * (compact ? 0.008 : 0.011), compact ? 7 : 9, compact ? 12 : 18);
    const segments = [];
    const nodes = [];

    addAccentRun(
      segments,
      nodes,
      x,
      aboutProcessY * (compact ? 0.18 : 0.12),
      accentLong,
      accentLip,
      direction,
    );

    if (!phone) {
      addAccentBridge(
        segments,
        nodes,
        x,
        targetX,
        aboutProcessY + bridgeDrop * 0.46,
      );
    }

    addAccentRun(
      segments,
      nodes,
      targetX,
      afterFirstBridgeY + middleSpan * (compact ? 0.16 : 0.12),
      accentShort,
      accentLip * 1.1,
      -direction,
    );

    addAccentRun(
      segments,
      nodes,
      x,
      afterSecondBridgeY + betweenSecondThirdSpan * (compact ? 0.54 : 0.48),
      accentLong,
      accentLip,
      direction,
    );

      if (!phone) {
        addAccentBridge(
          segments,
          nodes,
          x,
          targetX,
          statsSkillsY + bridgeDrop * 0.4,
        );
      }
    const preProjectPath = segments.join(" ");

    return {
      fullPath: preProjectPath,
      preProjectPath,
      nodes,
    };
  };

  const buildCircuitGhostPath = ({
    x,
    targetX,
    direction,
    aboutProcessY,
    processStatsY,
    statsSkillsY,
    projectsResumeY,
    bridgeDrop,
    width,
    compact,
    phone,
  }) => {
    const afterFirstBridgeY = aboutProcessY + bridgeDrop;
    const afterSecondBridgeY = processStatsY + bridgeDrop;
    const middleSpan = Math.max(processStatsY - afterFirstBridgeY, 1);
    const betweenSecondThirdSpan = Math.max(statsSkillsY - afterSecondBridgeY, 1);
    const lowerSpan = Math.max(documentHeight - projectsResumeY, 1);
    const shortReach = clamp(width * (compact ? 0.008 : 0.012), compact ? 8 : 12, compact ? 14 : 20);
    const longReach = clamp(width * (compact ? 0.012 : 0.018), compact ? 12 : 18, compact ? 22 : 30);
    const shortDrop = clamp(width * (compact ? 0.008 : 0.011), compact ? 8 : 11, compact ? 13 : 18);
    const longDrop = clamp(width * (compact ? 0.012 : 0.016), compact ? 12 : 16, compact ? 20 : 24);
    const segments = [];

    addGhostFragment(
      segments,
      x,
      aboutProcessY * (compact ? 0.16 : 0.12),
      shortReach,
      shortDrop,
      -direction,
    );
    addGhostFragment(
      segments,
      x,
      aboutProcessY * (compact ? 0.62 : 0.58),
      longReach,
      longDrop,
      direction,
    );
    if (!phone) {
      addGhostBridge(segments, x, targetX, aboutProcessY + bridgeDrop * 0.72, shortDrop);
    }

    addGhostFragment(
      segments,
      targetX,
      afterFirstBridgeY + middleSpan * (compact ? 0.34 : 0.26),
      shortReach,
      shortDrop,
      direction,
    );
    addGhostFragment(
      segments,
      x,
      afterSecondBridgeY + betweenSecondThirdSpan * (compact ? 0.58 : 0.5),
      longReach,
      longDrop,
      -direction,
    );
    if (!phone) {
      addGhostBridge(segments, x, targetX, statsSkillsY + bridgeDrop * 0.64, shortDrop);
    }
    const preProjectPath = segments.join(" ");

    return {
      fullPath: preProjectPath,
      preProjectPath,
    };
  };

  const buildSidePath = ({
    x,
    targetX,
    direction,
    aboutProcessY,
    processStatsY,
    statsSkillsY,
    projectsResumeY,
    bridgeDrop,
    width,
    compact,
    phone,
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
    const lowerSpan = Math.max(documentHeight - projectsResumeY, 1);
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
        phone ? small : medium,
        mediumDrop,
        direction,
      );
      if (!phone) {
        addCircuitJog(
          segments,
          targetX,
          afterFirstBridgeY + middleSpan * 0.74,
          small,
          shortDrop,
          -direction,
        );
      }
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
      if (!phone) {
        addCircuitJog(
          segments,
          x,
          afterSecondBridgeY + betweenSecondThirdSpan * 0.72,
          small,
          shortDrop,
          direction,
        );
      }
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
    const phone = width <= 640;
    isCompactViewport = compact;
    isPhoneViewport = phone;
    const sideOffset = phone
      ? clamp(width * 0.048, 16, 24)
      : compact
        ? clamp(width * 0.058, 24, 40)
        : clamp(width * 0.09, 58, 118);
    const bridgeDrop = phone
      ? clamp(width * 0.06, 22, 30)
      : compact
        ? clamp(width * 0.052, 28, 42)
        : clamp(width * 0.045, 34, 58);
    const leftX = sideOffset;
    const rightX = width - sideOffset;
    const aboutProcessY = getGapCenter("#about", "#process", 0.24);
    const processStatsY = getGapCenter("#process", ".stats", 0.42);
    const statsSkillsY = getGapCenter(".stats", "#skills", 0.52);
    circuitSectionProfiles = collectSectionProfiles();
    const projectsSection = document.querySelector("#projects");
    const projectsResumeY = projectsSection
      ? projectsSection.offsetTop + Math.min(projectsSection.offsetHeight * 0.12, 110)
      : documentHeight * 0.72;
    const exchangeBoostPadding = window.innerHeight * (compact ? 0.16 : 0.22);
    const leftBridgeX = leftX + (rightX - leftX) * 0.28;
    const rightBridgeX = rightX + (leftX - rightX) * 0.28;
    const leftReturnBridgeX = rightX + (leftX - rightX) * 0.28;
    const rightReturnBridgeX = leftX + (rightX - leftX) * 0.28;
    const leftThirdBridgeX = leftX + (rightX - leftX) * 0.28;
    const rightThirdBridgeX = rightX + (leftX - rightX) * 0.28;
    pauseStartY = statsSkillsY + bridgeDrop;
    pauseEndY = projectsResumeY;

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
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
      phone,
    });

    const rightPath = buildSidePath({
      x: rightX,
      targetX: leftX,
      direction: -1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
      phone,
    });
    const leftAccentPath = buildCircuitAccentPath({
      x: leftX,
      targetX: rightX,
      direction: 1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
      phone,
    });
    const rightAccentPath = buildCircuitAccentPath({
      x: rightX,
      targetX: leftX,
      direction: -1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
      phone,
    });
    const leftGhostPath = buildCircuitGhostPath({
      x: leftX,
      targetX: rightX,
      direction: 1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
      phone,
    });
    const rightGhostPath = buildCircuitGhostPath({
      x: rightX,
      targetX: leftX,
      direction: -1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
      phone,
    });
    const leftDetailPath = buildCircuitDetailPath({
      x: leftX,
      targetX: rightX,
      direction: 1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
    });
    const rightDetailPath = buildCircuitDetailPath({
      x: rightX,
      targetX: leftX,
      direction: -1,
      aboutProcessY,
      processStatsY,
      statsSkillsY,
      projectsResumeY,
      bridgeDrop,
      width,
      compact,
    });

    preProjectLengths = [
      measurePathLength(leftPath.preProjectPath),
      measurePathLength(rightPath.preProjectPath),
    ];
    preProjectGhostLengths = [
      leftGhostPath.preProjectPath ? measurePathLength(leftGhostPath.preProjectPath) : 0,
      rightGhostPath.preProjectPath ? measurePathLength(rightGhostPath.preProjectPath) : 0,
    ];
    preProjectAccentLengths = [
      leftAccentPath.preProjectPath ? measurePathLength(leftAccentPath.preProjectPath) : 0,
      rightAccentPath.preProjectPath
        ? measurePathLength(rightAccentPath.preProjectPath)
        : 0,
    ];
    preProjectDetailLengths = [
      leftDetailPath.preProjectPath ? measurePathLength(leftDetailPath.preProjectPath) : 0,
      rightDetailPath.preProjectPath
        ? measurePathLength(rightDetailPath.preProjectPath)
        : 0,
    ];

    circuitLayer.style.height = `${documentHeight}px`;
    circuitSvg.setAttribute("viewBox", `0 0 ${width} ${documentHeight}`);
    circuitTracks[0].setAttribute("d", leftPath.fullPath);
    circuitTracks[1].setAttribute("d", rightPath.fullPath);
    circuitLines[0].setAttribute("d", leftPath.fullPath);
    circuitLines[1].setAttribute("d", rightPath.fullPath);
    circuitGhostPaths = setPathCollection(circuitGhostLayer, "circuit-ghost-path", [
      leftGhostPath.fullPath,
      rightGhostPath.fullPath,
    ]);
    circuitAccentPaths = setPathCollection(circuitAccentLayer, "circuit-accent-path", [
      leftAccentPath.fullPath,
      rightAccentPath.fullPath,
    ]);
    circuitDetailPaths = setPathCollection(circuitDetailLayer, "circuit-detail-path", [
      leftDetailPath.fullPath,
      rightDetailPath.fullPath,
    ]);
    circuitMicroNodes = setNodeCollection(
      circuitMicroNodeLayer,
      "circuit-micro-node",
      [...leftAccentPath.nodes, ...rightAccentPath.nodes],
      phone
        ? clamp(width * 0.0038, 2.6, 4.6)
        : compact
          ? clamp(width * 0.0014, 1.3, 2.2)
          : clamp(width * 0.0018, 1.8, 2.8),
    );
    circuitDetailNodes = setNodeCollection(
      circuitDetailNodeLayer,
      "circuit-detail-node",
      [...leftDetailPath.nodes, ...rightDetailPath.nodes],
      phone
        ? clamp(width * 0.0044, 3.2, 5.8)
        : compact
          ? clamp(width * 0.0018, 1.8, 2.8)
          : clamp(width * 0.0022, 2.2, 3.6),
    );
    circuitPulseDescriptors = phone
      ? [
          { pathType: "main", index: 0, seed: 0, speed: 0.05, halo: 24, core: 6.2, minVisible: 68 },
          { pathType: "main", index: 1, seed: 520, speed: 0.046, halo: 23, core: 6, minVisible: 72 },
          { pathType: "detail", index: 0, seed: 220, speed: 0.032, halo: 16, core: 4, minVisible: 58 },
          { pathType: "detail", index: 1, seed: 860, speed: 0.03, halo: 15.4, core: 3.8, minVisible: 60 },
        ]
      : [
          { pathType: "main", index: 0, seed: 0, speed: 0.054, halo: 20, core: 5.1, minVisible: 88 },
          { pathType: "main", index: 1, seed: 620, speed: 0.05, halo: 19, core: 4.9, minVisible: 92 },
          { pathType: "detail", index: 0, seed: 220, speed: 0.034, halo: 13, core: 3.2, minVisible: 68 },
          { pathType: "detail", index: 1, seed: 860, speed: 0.032, halo: 13, core: 3.1, minVisible: 70 },
        ];
    circuitPulseSprites = setPulseCollection(circuitPulseLayer, circuitPulseDescriptors);
    circuitPulseSprites.forEach((pulse, index) => {
      const descriptor = circuitPulseDescriptors[index];
      if (!descriptor) return;

      pulse.shadow.setAttribute("r", (descriptor.halo * 1.18).toFixed(2));
      pulse.veil.setAttribute("r", (descriptor.halo * 0.96).toFixed(2));
      pulse.halo.setAttribute("r", descriptor.halo);
      pulse.core.setAttribute("r", descriptor.core);
    });

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
        phone
          ? clamp(width * 0.0062, 4.6, 7.4)
          : compact
            ? clamp(width * 0.0025, 2.6, 4.2)
            : clamp(width * 0.0032, 3.5, 5.5),
      );
    });
  };

  const prepareLines = () => {
    [
      ...circuitTracks,
      ...circuitLines,
      ...circuitGhostPaths,
      ...circuitAccentPaths,
      ...circuitDetailPaths,
    ].forEach(
      (line) => {
        const length = line.getTotalLength();
        line.style.setProperty("--circuit-length", length);
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
      },
    );
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

  const getVisibleLength = (totalLength, preProjectLength, revealY) => {
    if (reducedMotion.matches || revealY >= documentHeight) return totalLength;
    if (revealY <= 0) return 0;

    const boostedProgress = getBoostedProgress(revealY);
    const pauseStartProgress = getBoostedProgress(pauseStartY);

    if (revealY < pauseStartY) {
      const prePauseProgress =
        pauseStartProgress > 0
          ? clamp(boostedProgress / pauseStartProgress, 0, 1)
          : 0;

      return preProjectLength * prePauseProgress;
    }

    return preProjectLength;
  };

  const renderPulses = (
    mainVisibleLengths,
    detailVisibleLengths,
    sectionBoost,
    breath,
    lighting,
  ) => {
    circuitPulseSprites.forEach((pulse, index) => {
      const descriptor = circuitPulseDescriptors[index];
      if (!descriptor) return;

      const pathCollection =
        descriptor.pathType === "detail" ? circuitDetailPaths : circuitLines;
      const visibleLengths =
        descriptor.pathType === "detail" ? detailVisibleLengths : mainVisibleLengths;
      const path = pathCollection[descriptor.index];
      const visibleLength = visibleLengths[descriptor.index] || 0;

      if (!path || visibleLength <= descriptor.minVisible || !hasStartedScroll) {
        pulse.group.style.opacity = "0";
        return;
      }

      const pulseStart = descriptor.pathType === "detail" ? 12 : 18;
      const usableLength = Math.max(visibleLength - pulseStart, 1);
      const travel =
        pulseStart + ((circuitPulseClock * descriptor.speed + descriptor.seed) % usableLength);
      const point = path.getPointAtLength(clamp(travel, 0, visibleLength));
      const boostBase =
        (descriptor.pathType === "detail" ? sectionBoost * 0.82 : sectionBoost) *
        lighting.pulse;
      const boost = clamp(boostBase * (0.7 + breath * 0.3) + breath * 0.08, 0, 1);
      const haloRadius =
        descriptor.halo *
        (isPhoneViewport ? 1.12 : isCompactViewport ? 0.9 : 1) *
        (1 + boost * 0.18);
      const coreRadius =
        descriptor.core *
        (isPhoneViewport ? 1.08 : isCompactViewport ? 0.94 : 1) *
        (1 + boost * 0.12);
      const shadowRadius = haloRadius * 1.2;
      const veilRadius = haloRadius * 0.98;

      pulse.group.setAttribute(
        "transform",
        `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
      );
      pulse.group.style.opacity = (
        descriptor.pathType === "detail" ? 0.34 + boost * 0.2 : 0.5 + boost * 0.24
      ).toFixed(3);
      pulse.shadow.setAttribute("r", shadowRadius.toFixed(2));
      pulse.veil.setAttribute("r", veilRadius.toFixed(2));
      pulse.halo.setAttribute("r", haloRadius.toFixed(2));
      pulse.core.setAttribute("r", coreRadius.toFixed(2));
    });
  };

  const renderCircuits = (revealY) => {
    const focusY = clamp(window.scrollY + window.innerHeight * 0.5, 0, documentHeight);
    const lighting = getSectionLighting(focusY);
    const breath = getCircuitBreath() * lighting.breath;
    const waveBoost = clamp(lighting.boost * (0.58 + breath * 0.34) + breath * 0.06, 0, 1);
    const hotRange = window.innerHeight * (isPhoneViewport ? 0.12 : isCompactViewport ? 0.14 : 0.18);
    const mainVisibleLengths = [];
    const detailVisibleLengths = [];

    circuitLayer.style.setProperty("--circuit-boost", waveBoost.toFixed(3));
    circuitLayer.style.setProperty("--circuit-breath", breath.toFixed(3));
    circuitLayer.style.setProperty("--circuit-zone-main", lighting.main.toFixed(3));
    circuitLayer.style.setProperty("--circuit-zone-ghost", lighting.ghost.toFixed(3));
    circuitLayer.style.setProperty("--circuit-zone-accent", lighting.accent.toFixed(3));
    circuitLayer.style.setProperty("--circuit-zone-detail", lighting.detail.toFixed(3));
    circuitLayer.style.setProperty("--circuit-zone-node", lighting.node.toFixed(3));

    [...circuitNodes, ...circuitDetailNodes, ...circuitMicroNodes].forEach((node) => {
      const nodeY = Number(node.getAttribute("cy"));
      const isLit = revealY + 30 >= nodeY;
      node.classList.toggle("is-lit", isLit);
      node.classList.toggle("is-hot", isLit && Math.abs(nodeY - focusY) <= hotRange);
    });

    [...circuitTracks, ...circuitLines].forEach((line, index) => {
      const length = line.getTotalLength();
      const visibleLength = getVisibleLength(
        length,
        preProjectLengths[index % 2] || 0,
        revealY,
      );
      if (index < circuitLines.length) mainVisibleLengths[index] = visibleLength;
      line.style.strokeDashoffset = length - visibleLength;
    });

    circuitGhostPaths.forEach((line, index) => {
      const length = line.getTotalLength();
      const visibleLength =
        getVisibleLength(length, preProjectGhostLengths[index] || 0, revealY) * 0.88;
      line.style.strokeDashoffset = length - visibleLength;
    });

    circuitAccentPaths.forEach((line, index) => {
      const length = line.getTotalLength();
      const visibleLength = getVisibleLength(
        length,
        preProjectAccentLengths[index] || 0,
        revealY,
      );
      line.style.strokeDashoffset = length - visibleLength;
    });

    circuitDetailPaths.forEach((line, index) => {
      const length = line.getTotalLength();
      const visibleLength = getVisibleLength(
        length,
        preProjectDetailLengths[index] || 0,
        revealY,
      );
      detailVisibleLengths[index] = visibleLength;
      line.style.strokeDashoffset = length - visibleLength;
    });

    renderPulses(mainVisibleLengths, detailVisibleLengths, lighting.boost, breath, lighting);
  };

  const animateCircuits = (timestamp = 0) => {
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

    if (
      (hasStartedScroll && !reducedMotion.matches) ||
      Math.abs(targetRevealY - currentRevealY) > 0.5
    ) {
      animationFrameId = requestAnimationFrame(animateCircuits);
    }
  };

  const requestDraw = () => {
    targetRevealY = getTargetRevealY();
    if (animationFrameId) return;
    animationFrameId = requestAnimationFrame(animateCircuits);
  };

  buildCircuitPaths();
  prepareLines();
  renderCircuits(0);

  window.addEventListener(
    "scroll",
    () => {
      hasStartedScroll = window.scrollY > 0;
      requestDraw();
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    buildCircuitPaths();
    prepareLines();
    currentRevealY = clamp(currentRevealY, 0, documentHeight);
    lastFrameTime = 0;
    requestDraw();
  });
  reducedMotion.addEventListener("change", () => {
    lastFrameTime = 0;
    targetRevealY = getTargetRevealY();
    requestDraw();
  });
  document.addEventListener("visibilitychange", () => {
    lastFrameTime = 0;
    if (document.hidden) return;
    requestDraw();
  });
}
