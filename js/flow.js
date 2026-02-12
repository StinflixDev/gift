function readBunnyShortcutAvailability() {
  try {
    return window.localStorage.getItem(bunnyShortcutStorageKey) === "1";
  } catch (_error) {
    return false;
  }
}

function saveBunnyShortcutAvailability(isAvailable) {
  try {
    if (isAvailable) {
      window.localStorage.setItem(bunnyShortcutStorageKey, "1");
    } else {
      window.localStorage.removeItem(bunnyShortcutStorageKey);
    }
  } catch (_error) {
    // ignore storage errors in private/incognito modes
  }
}

function updateBunnyShortcutVisibility() {
  if (!bunnyShortcutButton) {
    return;
  }

  const shouldShow = bunnyShortcutAvailable && !isFinalCtaMode && !isBunnyEndingMode;
  bunnyShortcutButton.hidden = !shouldShow;
  bunnyShortcutButton.setAttribute("aria-hidden", String(!shouldShow));
}

function setupBunnyShortcut() {
  if (!bunnyShortcutButton) {
    return;
  }

  bunnyShortcutAvailable = readBunnyShortcutAvailability();
  bunnyShortcutButton.addEventListener("click", () => {
    playWhiteFlash(activateBunnyEndingMode);
  });
  updateBunnyShortcutVisibility();
}

function updateQuizVisibility() {
  if (!quizSection) {
    updateLocalizationVisibility();
    updateBunnyShortcutVisibility();
    return;
  }

  quizSection.classList.toggle("is-locked", !areReasonsUnlocked);
  quizSection.setAttribute("aria-hidden", String(!areReasonsUnlocked));
  updateLocalizationVisibility();
  updateBunnyShortcutVisibility();
}

function revealReasonItem(item) {
  if (!item || item.classList.contains("is-revealed")) {
    return;
  }

  item.classList.add("is-revealed");
  item.setAttribute("aria-expanded", "true");
  item.removeAttribute("role");
  item.removeAttribute("tabindex");
  runHeartBurst(2, 1000);

  const allRevealed = reasonItems.every((reasonItem) => reasonItem.classList.contains("is-revealed"));
  if (!allRevealed) {
    return;
  }

  areReasonsUnlocked = true;
  updateQuizVisibility();
  renderQuizQuestion();
}

function setupReasonSpoilers() {
  if (reasonItems.length === 0) {
    areReasonsUnlocked = true;
    updateQuizVisibility();
    return;
  }

  const revealedCount = reasonItems.filter((item) => item.classList.contains("is-revealed")).length;
  if (revealedCount === reasonItems.length) {
    areReasonsUnlocked = true;
    updateQuizVisibility();
    return;
  }

  areReasonsUnlocked = false;
  reasonItems.forEach((item) => {
    item.classList.add("is-spoiler");
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-expanded", item.classList.contains("is-revealed") ? "true" : "false");
    item.addEventListener("click", () => {
      revealReasonItem(item);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      revealReasonItem(item);
    });
  });

  updateQuizVisibility();
}

function resetQuizView() {
  cancelHoldToReset();
  holdToResetPhase = holdToResetPhaseIdle;
  stopBunnyIdlePhrases();
  if (typeof hideNowPlayingTrack === "function") {
    hideNowPlayingTrack({ immediate: true });
  }
  resetBunniesPosition();
  isFinalCtaMode = false;
  isBunnyEndingMode = false;
  finalCtaStep = "cta";
  ambientHeartFlowMultiplier = 1;
  forcedHeartColor = null;
  forcedHeartRatio = 0;
  currentQuestionPayload = null;
  currentQuestionIsLast = false;
  selectedQuizOption = null;
  quizButtonMode = "hidden";
  document.body.classList.remove("final-cta-mode", "bunnies-ending-mode");
  quizProgress.hidden = false;
  quizQuestionElement.hidden = false;
  quizAnswers.hidden = false;
  quizResult.hidden = false;
  finalLoveText.hidden = true;
  finalLoveText.textContent = "";
  finalBunnies.hidden = true;
  quizNextButton.classList.remove("is-hold-fill");
  quizNextButton.classList.remove("is-holding");
  updateLocalizationVisibility();
  updateBunnyShortcutVisibility();
  if (typeof updateBunnyPlayerControlsVisibility === "function") {
    updateBunnyPlayerControlsVisibility();
  }
}

function unlockQuizContainerForFinalModes() {
  if (!quizSection) {
    return;
  }

  quizSection.classList.remove("is-locked");
  quizSection.setAttribute("aria-hidden", "false");
}

function activateFinalCtaMode() {
  const quizLocale = getLocalePack().quiz;

  cancelHoldToReset();
  holdToResetPhase = holdToResetPhaseIdle;
  stopBunnyIdlePhrases();
  if (typeof hideNowPlayingTrack === "function") {
    hideNowPlayingTrack({ immediate: true });
  }
  resetBunniesPosition();
  isFinalCtaMode = true;
  isBunnyEndingMode = false;
  finalCtaStep = "cta";
  ambientHeartFlowMultiplier = 4;
  forcedHeartColor = null;
  forcedHeartRatio = 0;
  quizButtonMode = "final";
  unlockQuizContainerForFinalModes();
  document.body.classList.remove("bunnies-ending-mode");
  document.body.classList.add("final-cta-mode");
  quizProgress.hidden = true;
  quizQuestionElement.hidden = true;
  quizAnswers.hidden = true;
  quizResult.hidden = true;
  quizNextButton.textContent = quizLocale.pressMe;
  finalBunnies.hidden = true;
  quizNextButton.classList.remove("is-hold-fill");
  quizNextButton.classList.remove("is-holding");
  showQuizNextButton();
  updateLocalizationVisibility();
  updateBunnyShortcutVisibility();
  if (typeof updateBunnyPlayerControlsVisibility === "function") {
    updateBunnyPlayerControlsVisibility();
  }
}

function activateBunnyEndingMode() {
  cancelHoldToReset();
  holdToResetPhase = holdToResetPhaseIdle;
  stopBunnyIdlePhrases();
  if (typeof hideNowPlayingTrack === "function") {
    hideNowPlayingTrack({ immediate: true });
  }
  resetBunniesPosition();
  isFinalCtaMode = false;
  isBunnyEndingMode = true;
  quizButtonMode = "hidden";
  ambientHeartFlowMultiplier = 5;
  forcedHeartColor = "#ff8c00";
  forcedHeartRatio = 0.5;

  unlockQuizContainerForFinalModes();
  document.body.classList.remove("final-cta-mode");
  document.body.classList.add("bunnies-ending-mode");

  quizProgress.hidden = true;
  quizQuestionElement.hidden = true;
  quizAnswers.hidden = true;
  quizResult.hidden = true;
  finalLoveText.hidden = true;
  quizNextButton.classList.remove("is-hold-fill");
  quizNextButton.classList.remove("is-holding");
  hideQuizNextButton();
  finalBunnies.hidden = false;
  if (typeof startBunnyRadioMode === "function") {
    startBunnyRadioMode();
  }
  bunnyShortcutAvailable = true;
  saveBunnyShortcutAvailability(true);
  runHeartBurst(10, 5000);
  startBunnyIdlePhrases();
  updateLocalizationVisibility();
  updateBunnyShortcutVisibility();
  if (typeof updateBunnyPlayerControlsVisibility === "function") {
    updateBunnyPlayerControlsVisibility();
  }
}

function setReducedMotionPreference(isReduced) {
  isReducedMotionPreferred = Boolean(isReduced);
  document.body.classList.toggle("reduced-motion", isReducedMotionPreferred);
}

function setupMotionPreferences() {
  if (typeof window.matchMedia !== "function") {
    setReducedMotionPreference(false);
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  setReducedMotionPreference(mediaQuery.matches);

  const onMotionChange = (event) => {
    setReducedMotionPreference(event.matches);
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onMotionChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(onMotionChange);
  }
}

function setupHeartFlowVisibilityHandling() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      heartFlowMultiplier = 1;
      if (heartFlowResetTimeout !== null) {
        clearTimeout(heartFlowResetTimeout);
        heartFlowResetTimeout = null;
      }
      heartFlowAccumulatorMs = 0;
      heartFlowLastFrameTs = 0;
      return;
    }

    heartFlowLastFrameTs = 0;
  });
}

function runHeartFlowTick() {
  if (activeBunnyDrag !== null) {
    return;
  }

  const accentIsActive = heartFlowAccentColor !== null && Date.now() < heartFlowAccentUntil;
  const forcedColorIsActive = forcedHeartColor !== null && forcedHeartRatio > 0;
  const activeMultiplier = Math.max(heartFlowMultiplier, ambientHeartFlowMultiplier);
  const baseSpawnCount = isReducedMotionPreferred ? Math.max(1, Math.ceil(activeMultiplier * 0.5)) : activeMultiplier;
  const spawnCap = isReducedMotionPreferred ? maxHeartsPerTickReducedMotion : maxHeartsPerTick;
  const spawnCount = Math.min(spawnCap, baseSpawnCount);

  for (let index = 0; index < spawnCount; index += 1) {
    if (forcedColorIsActive && Math.random() < forcedHeartRatio) {
      if (!createHeart(forcedHeartColor)) {
        break;
      }
      continue;
    }

    const heartColor = accentIsActive && Math.random() < 0.65 ? heartFlowAccentColor : null;
    if (!createHeart(heartColor)) {
      break;
    }
  }

  if (heartFlowAccentColor !== null && Date.now() >= heartFlowAccentUntil) {
    heartFlowAccentColor = null;
    heartFlowAccentUntil = 0;
  }
}

function runHeartFlowFrame(frameTs) {
  if (heartFlowRafId === null) {
    return;
  }

  if (heartFlowLastFrameTs === 0) {
    heartFlowLastFrameTs = frameTs;
  }

  const deltaMs = Math.min(80, Math.max(0, frameTs - heartFlowLastFrameTs));
  heartFlowLastFrameTs = frameTs;

  if (!document.hidden) {
    heartFlowAccumulatorMs += deltaMs;
    const dueTicks = Math.min(2, Math.floor(heartFlowAccumulatorMs / heartFlowTickMs));
    if (dueTicks > 0) {
      for (let tick = 0; tick < dueTicks; tick += 1) {
        runHeartFlowTick();
      }
      heartFlowAccumulatorMs -= dueTicks * heartFlowTickMs;
    }
  }

  heartFlowRafId = requestAnimationFrame(runHeartFlowFrame);
}

function startHeartFlow() {
  if (heartFlowRafId !== null) {
    return;
  }

  heartFlowLastFrameTs = 0;
  heartFlowAccumulatorMs = 0;
  heartFlowRafId = requestAnimationFrame(runHeartFlowFrame);
}

function boostHeartFlow(multiplier = 4, durationMs = 1800) {
  heartFlowMultiplier = Math.max(heartFlowMultiplier, multiplier);

  if (heartFlowResetTimeout !== null) {
    clearTimeout(heartFlowResetTimeout);
  }

  heartFlowResetTimeout = setTimeout(() => {
    heartFlowMultiplier = 1;
    heartFlowResetTimeout = null;
  }, durationMs);
}

function addAccentHearts(color, durationMs = 2600) {
  heartFlowAccentColor = color;
  heartFlowAccentUntil = Date.now() + durationMs;
}

function getOrCreateBunnyOffset(bunny) {
  let offset = bunnyOffsets.get(bunny);
  if (!offset) {
    offset = { x: 0, y: 0 };
    bunnyOffsets.set(bunny, offset);
  }

  return offset;
}

function setBunnyOffset(bunny, x, y) {
  const offset = getOrCreateBunnyOffset(bunny);
  if (Math.abs(offset.x - x) < 0.01 && Math.abs(offset.y - y) < 0.01) {
    return;
  }

  offset.x = x;
  offset.y = y;
  bunny.style.translate = `${x}px ${y}px`;
}

function clearBunnyMotionTimers(bunny) {
  const timers = bunnyMotionTimers.get(bunny);
  if (!timers) {
    return;
  }

  clearTimeout(timers.resetTimeout);
  bunnyMotionTimers.delete(bunny);
}

function resetBunniesPosition() {
  if (bunnyNameRevealTimeout !== null) {
    clearTimeout(bunnyNameRevealTimeout);
    bunnyNameRevealTimeout = null;
  }

  if (bunnyNameRestoreTimeout !== null) {
    clearTimeout(bunnyNameRestoreTimeout);
    bunnyNameRestoreTimeout = null;
  }

  if (activeBunnyDrag) {
    const draggedBunny = activeBunnyDrag.bunny;
    draggedBunny.classList.remove("is-dragging");
    draggedBunny.removeEventListener("pointermove", onBunnyPointerMove);
    draggedBunny.removeEventListener("pointerup", finishBunnyDrag);
    draggedBunny.removeEventListener("pointercancel", finishBunnyDrag);
    if (draggedBunny.hasPointerCapture(activeBunnyDrag.pointerId)) {
      draggedBunny.releasePointerCapture(activeBunnyDrag.pointerId);
    }
    activeBunnyDrag = null;
  }
  document.body.classList.remove("is-bunny-drag-active");
  stopBunnyDragAnimationLoop();

  bunnyElements.forEach((bunny) => {
    clearBunnyMotionTimers(bunny);
    bunny.classList.remove("is-dragging", "is-magnetizing", "is-name-visible");
    restoreBunnyLabel(bunny);
    setBunnyOffset(bunny, 0, 0);
  });
}

function getRandomBunnyPhrase() {
  const cutePhrases = getCurrentBunnyCutePhrases();
  if (cutePhrases.length === 0) {
    return "💖";
  }

  const randomIndex = Math.floor(Math.random() * cutePhrases.length);
  return cutePhrases[randomIndex];
}

function getBunnyLabel(bunny) {
  if (!bunny) {
    return null;
  }

  return bunny.querySelector(".bunny-name");
}

function restoreBunnyLabel(bunny) {
  const label = getBunnyLabel(bunny);
  if (!label) {
    return;
  }

  const defaultName = label.dataset.defaultName;
  if (defaultName) {
    label.textContent = defaultName;
  }
}

function showBunnyNameTemporarily(bunny, text, durationMs = 1100, source = null) {
  if (!bunny) {
    return;
  }

  bunnyElements.forEach((item) => {
    item.classList.remove("is-name-visible");
    restoreBunnyLabel(item);
  });

  if (bunnyNameRevealTimeout !== null) {
    clearTimeout(bunnyNameRevealTimeout);
  }

  if (bunnyNameRestoreTimeout !== null) {
    clearTimeout(bunnyNameRestoreTimeout);
    bunnyNameRestoreTimeout = null;
  }

  const label = getBunnyLabel(bunny);
  if (label && text) {
    label.textContent = text;
  }

  bunnySpeechSource = source;
  bunny.classList.add("is-name-visible");
  bunnyNameRevealTimeout = setTimeout(() => {
    bunny.classList.remove("is-name-visible");
    bunnySpeechSource = null;
    bunnyNameRevealTimeout = null;
    bunnyNameRestoreTimeout = setTimeout(() => {
      restoreBunnyLabel(bunny);
      bunnyNameRestoreTimeout = null;
    }, 220);
  }, durationMs);
}

function hideBunnySpeechNow(onlyIdleSpeech = false) {
  if (onlyIdleSpeech && bunnySpeechSource !== bunnySpeechSourceIdle) {
    return;
  }

  if (bunnyNameRevealTimeout !== null) {
    clearTimeout(bunnyNameRevealTimeout);
    bunnyNameRevealTimeout = null;
  }

  if (bunnyNameRestoreTimeout !== null) {
    clearTimeout(bunnyNameRestoreTimeout);
    bunnyNameRestoreTimeout = null;
  }

  bunnyElements.forEach((bunny) => {
    bunny.classList.remove("is-name-visible");
    restoreBunnyLabel(bunny);
  });

  bunnySpeechSource = null;
}

function postponeBunnyIdlePhrases(hideCurrentPhrase = false, hideOnlyIdlePhrase = false) {
  bunnyIdleReadyAt = Date.now() + bunnyIdleCooldownMs;
  if (hideCurrentPhrase) {
    hideBunnySpeechNow(hideOnlyIdlePhrase);
  }
}

function runBunnyIdlePhraseTick() {
  const idlePhrases = getCurrentBunnyIdlePhrases();

  if (
    !isBunnyEndingMode ||
    bunnyIdleSpeechMuted ||
    activeBunnyDrag ||
    bunnyHoverCount > 0 ||
    bunnyElements.length === 0 ||
    idlePhrases.length === 0 ||
    Date.now() < bunnyIdleReadyAt ||
    bunnyNameRevealTimeout !== null ||
    bunnyNameRestoreTimeout !== null
  ) {
    return;
  }

  const bunny = bunnyElements[bunnyIdleBunnyIndex % bunnyElements.length];
  const phrase = idlePhrases[bunnyIdlePhraseIndex % idlePhrases.length];
  showBunnyNameTemporarily(bunny, phrase, 1300, bunnySpeechSourceIdle);

  bunnyIdleBunnyIndex = (bunnyIdleBunnyIndex + 1) % bunnyElements.length;
  bunnyIdlePhraseIndex = (bunnyIdlePhraseIndex + 1) % idlePhrases.length;
}

function startBunnyIdlePhrases() {
  stopBunnyIdlePhrases();
  bunnyIdlePhraseIndex = 0;
  bunnyIdleBunnyIndex = 0;
  bunnyHoverCount = 0;
  bunnyIdleReadyAt = Date.now() + bunnyIdleCooldownMs;

  bunnyIdleKickoffTimeout = setTimeout(() => {
    bunnyIdleKickoffTimeout = null;
    runBunnyIdlePhraseTick();
  }, 800);

  bunnyIdleInterval = setInterval(() => {
    runBunnyIdlePhraseTick();
  }, 800);
}

function stopBunnyIdlePhrases() {
  if (bunnyIdleKickoffTimeout !== null) {
    clearTimeout(bunnyIdleKickoffTimeout);
    bunnyIdleKickoffTimeout = null;
  }

  if (bunnyIdleInterval !== null) {
    clearInterval(bunnyIdleInterval);
    bunnyIdleInterval = null;
  }

  bunnyHoverCount = 0;
  bunnyIdleReadyAt = 0;
  hideBunnySpeechNow();
}

function stopBunnyDragAnimationLoop() {
  if (bunnyDragRafId === null) {
    return;
  }

  cancelAnimationFrame(bunnyDragRafId);
  bunnyDragRafId = null;
}

function getBunnyDragFollowFactor(frameTs) {
  if (bunnyDragUseDirectFollow) {
    if (activeBunnyDrag) {
      activeBunnyDrag.lastFrameTs = frameTs;
    }
    return 1;
  }

  const lastFrameTs = activeBunnyDrag && typeof activeBunnyDrag.lastFrameTs === "number" ? activeBunnyDrag.lastFrameTs : 0;
  const frameDeltaMs = lastFrameTs > 0 ? Math.min(48, Math.max(8, frameTs - lastFrameTs)) : 16.67;
  const followFactor = 1 - Math.pow(1 - bunnyDragFollowLerp, frameDeltaMs / 16.67);
  if (activeBunnyDrag) {
    activeBunnyDrag.lastFrameTs = frameTs;
  }
  return followFactor;
}

function runBunnyDragAnimationLoop(frameTs) {
  if (!activeBunnyDrag) {
    bunnyDragRafId = null;
    return;
  }

  const { bunny, targetX, targetY } = activeBunnyDrag;
  const currentOffset = getOrCreateBunnyOffset(bunny);
  const followFactor = getBunnyDragFollowFactor(frameTs);
  if (followFactor >= 0.999) {
    setBunnyOffset(bunny, targetX, targetY);
  } else {
    const nextX = currentOffset.x + (targetX - currentOffset.x) * followFactor;
    const nextY = currentOffset.y + (targetY - currentOffset.y) * followFactor;
    const remainingDistance = Math.hypot(targetX - nextX, targetY - nextY);
    if (remainingDistance <= bunnyDragSnapDistance) {
      setBunnyOffset(bunny, targetX, targetY);
    } else {
      setBunnyOffset(bunny, nextX, nextY);
    }
  }

  bunnyDragRafId = requestAnimationFrame(runBunnyDragAnimationLoop);
}

function ensureBunnyDragAnimationLoop() {
  if (bunnyDragRafId !== null) {
    return;
  }

  bunnyDragRafId = requestAnimationFrame(runBunnyDragAnimationLoop);
}

function finishBunnyDrag(event) {
  if (!activeBunnyDrag || event.pointerId !== activeBunnyDrag.pointerId) {
    return;
  }

  const { bunny: draggedBunny, didMove, targetX, targetY } = activeBunnyDrag;
  activeBunnyDrag = null;
  stopBunnyDragAnimationLoop();

  draggedBunny.classList.remove("is-dragging");
  document.body.classList.remove("is-bunny-drag-active");
  draggedBunny.removeEventListener("pointermove", onBunnyPointerMove);
  draggedBunny.removeEventListener("pointerup", finishBunnyDrag);
  draggedBunny.removeEventListener("pointercancel", finishBunnyDrag);

  if (draggedBunny.hasPointerCapture(event.pointerId)) {
    draggedBunny.releasePointerCapture(event.pointerId);
  }

  if (didMove) {
    setBunnyOffset(draggedBunny, targetX, targetY);
  }

  if (!isBunnyEndingMode) {
    setBunnyOffset(draggedBunny, 0, 0);
    return;
  }

  if (!didMove) {
    setBunnyOffset(draggedBunny, 0, 0);
    postponeBunnyIdlePhrases();
    return;
  }

  const oppositeBunny = bunnyElements.find((bunny) => bunny !== draggedBunny);
  showBunnyNameTemporarily(oppositeBunny, getRandomBunnyPhrase(), 1100, bunnySpeechSourceDrag);
  postponeBunnyIdlePhrases();

  clearBunnyMotionTimers(draggedBunny);
  draggedBunny.classList.add("is-magnetizing");
  requestAnimationFrame(() => {
    if (!draggedBunny.classList.contains("is-magnetizing")) {
      return;
    }

    setBunnyOffset(draggedBunny, 0, 0);
  });

  const resetTimeout = setTimeout(() => {
    draggedBunny.classList.remove("is-magnetizing");
    bunnyMotionTimers.delete(draggedBunny);
  }, bunnyReturnMs + 40);

  bunnyMotionTimers.set(draggedBunny, { resetTimeout });
}

function onBunnyPointerMove(event) {
  if (!activeBunnyDrag || event.pointerId !== activeBunnyDrag.pointerId) {
    return;
  }

  const deltaX = event.clientX - activeBunnyDrag.startX;
  const deltaY = event.clientY - activeBunnyDrag.startY;
  if (!activeBunnyDrag.didMove && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
    activeBunnyDrag.didMove = true;
  }

  const now = performance.now();
  if (
    typeof activeBunnyDrag.lastIdlePostponeTs !== "number" ||
    now - activeBunnyDrag.lastIdlePostponeTs >= bunnyIdlePostponeDuringDragMinIntervalMs
  ) {
    postponeBunnyIdlePhrases();
    activeBunnyDrag.lastIdlePostponeTs = now;
  }
  activeBunnyDrag.targetX = activeBunnyDrag.originX + deltaX;
  activeBunnyDrag.targetY = activeBunnyDrag.originY + deltaY;
}

function onBunnyPointerDown(event) {
  if (!isBunnyEndingMode || event.button !== 0) {
    return;
  }

  const bunny = event.currentTarget;
  event.preventDefault();
  postponeBunnyIdlePhrases(true);

  clearBunnyMotionTimers(bunny);
  stopBunnyDragAnimationLoop();
  bunny.classList.remove("is-magnetizing");

  const currentOffset = getOrCreateBunnyOffset(bunny);
  activeBunnyDrag = {
    bunny,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: currentOffset.x,
    originY: currentOffset.y,
    targetX: currentOffset.x,
    targetY: currentOffset.y,
    lastFrameTs: 0,
    lastIdlePostponeTs: performance.now(),
    didMove: false
  };

  bunny.classList.add("is-dragging");
  document.body.classList.add("is-bunny-drag-active");
  bunny.setPointerCapture(event.pointerId);
  ensureBunnyDragAnimationLoop();
  bunny.addEventListener("pointermove", onBunnyPointerMove);
  bunny.addEventListener("pointerup", finishBunnyDrag);
  bunny.addEventListener("pointercancel", finishBunnyDrag);
}

function setupBunnyInteractions() {
  bunnyElements.forEach((bunny) => {
    const label = getBunnyLabel(bunny);
    if (label && !label.dataset.defaultName) {
      label.dataset.defaultName = label.textContent.trim();
    }

    bunnyOffsets.set(bunny, { x: 0, y: 0 });
    bunny.style.translate = "0px 0px";
    bunny.style.setProperty("--bunny-return-ms", `${bunnyReturnMs}ms`);
    bunny.addEventListener("pointerdown", onBunnyPointerDown);
    bunny.addEventListener("pointerenter", () => {
      bunnyHoverCount += 1;
      postponeBunnyIdlePhrases(true, true);
    });
    bunny.addEventListener("pointerleave", () => {
      bunnyHoverCount = Math.max(0, bunnyHoverCount - 1);
      postponeBunnyIdlePhrases();
    });
  });
}

function showQuizNextButton() {
  quizNextButton.classList.remove("is-invisible");
  quizNextButton.setAttribute("aria-hidden", "false");
}

function hideQuizNextButton() {
  quizNextButton.classList.add("is-invisible");
  quizNextButton.setAttribute("aria-hidden", "true");
}

function setHoldVisualActive(isActive) {
  if (!quizNextButton.classList.contains("is-hold-fill")) {
    quizNextButton.classList.remove("is-holding");
    return;
  }

  if (isActive) {
    quizNextButton.classList.add("is-holding");
  } else {
    quizNextButton.classList.remove("is-holding");
  }
}

function cancelHoldToReset() {
  const isCompletingHold = holdToResetPhase === holdToResetPhaseCompleting;

  if (holdToResetTimeout !== null) {
    clearTimeout(holdToResetTimeout);
    holdToResetTimeout = null;
  }

  setHoldVisualActive(false);
  stopHoldMusicFade(!isCompletingHold);

  if (!isCompletingHold) {
    holdToResetPhase = holdToResetPhaseIdle;
  }
}

function startHoldToReset(event) {
  if (!isFinalCtaMode || finalCtaStep !== "accepted") {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (holdToResetTimeout !== null) {
    return;
  }

  holdToResetPhase = holdToResetPhaseHolding;
  setHoldVisualActive(true);
  startHoldMusicFade();
  holdToResetTimeout = setTimeout(() => {
    holdToResetTimeout = null;
    holdToResetPhase = holdToResetPhaseCompleting;
    playWhiteFlash(activateBunnyEndingMode);
  }, holdToResetMs);
}

function playWhiteFlash(onComplete) {
  if (!flashOverlay) {
    if (onComplete) {
      onComplete();
    }
    return;
  }

  if (flashSwitchTimeout !== null) {
    clearTimeout(flashSwitchTimeout);
    flashSwitchTimeout = null;
  }

  if (flashCleanupTimeout !== null) {
    clearTimeout(flashCleanupTimeout);
    flashCleanupTimeout = null;
  }

  flashOverlay.classList.remove("is-active");
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add("is-active");

  flashSwitchTimeout = setTimeout(() => {
    flashSwitchTimeout = null;
    if (onComplete) {
      onComplete();
    }
  }, 170);

  flashCleanupTimeout = setTimeout(() => {
    flashCleanupTimeout = null;
    flashOverlay.classList.remove("is-active");
  }, 560);
}
