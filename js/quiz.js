function checkCurrentQuestionAnswer() {
  const quizLocale = getLocalePack().quiz;

  if (!currentQuestionPayload || selectedQuizOption === null) {
    return;
  }

  const isCorrect = currentQuestionPayload.correctAnswers.includes(selectedQuizOption);
  const optionButtons = quizAnswers.querySelectorAll(".quiz-option");
  const isFirstThreeQuestion = currentQuizIndex < 3;

  if (isFirstThreeQuestion && !isCorrect) {
    firstThreeAllCorrect = false;
  }

  optionButtons.forEach((button) => {
    button.disabled = true;
    button.classList.remove("is-selected");
    if (currentQuestionPayload.correctAnswers.includes(button.dataset.value)) {
      button.classList.add("is-correct");
    }
  });

  if (!isCorrect) {
    const selectedButton = quizAnswers.querySelector(`[data-value="${selectedQuizOption}"]`);
    if (selectedButton) {
      selectedButton.classList.add("is-wrong");
    }
  }

  quizResult.textContent = isCorrect ? currentQuestionPayload.successText : currentQuestionPayload.failText;
  if (isCorrect) {
    runHeartBurst(10, 2600);
    if (currentQuestionPayload.accentAnswer && selectedQuizOption === currentQuestionPayload.accentAnswer) {
      addAccentHearts("#ff8c00", 3200);
    }
  }

  if (currentQuestionIsLast) {
    quizNextButton.textContent = quizLocale.nextQuestionShort;
    quizButtonMode = "open-final";
    showQuizNextButton();
    return;
  }

  if (currentQuizIndex === 2 && !firstThreeAllCorrect) {
    quizNextButton.textContent = quizLocale.retry;
  } else {
    quizNextButton.textContent = quizLocale.nextQuestion;
  }

  quizButtonMode = "continue";
  showQuizNextButton();
}

function renderQuizQuestion(prefillResult = "") {
  const quizLocale = getLocalePack().quiz;
  const currentQuestion = quizQuestions[currentQuizIndex];
  const payload = getQuizQuestionPayload(currentQuestion);
  const isLastQuestion = currentQuizIndex === quizQuestions.length - 1;

  resetQuizView();
  currentQuestionPayload = payload;
  currentQuestionIsLast = isLastQuestion;
  quizProgress.textContent = quizLocale.progress(currentQuizIndex + 1, quizQuestions.length);
  quizQuestionElement.textContent = payload.text;

  quizAnswers.innerHTML = "";
  quizResult.textContent = prefillResult;
  hideQuizNextButton();

  payload.options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "quiz-option";
    optionButton.dataset.value = option;
    optionButton.textContent = option;

    optionButton.addEventListener("click", () => {
      const optionButtons = quizAnswers.querySelectorAll(".quiz-option");
      selectedQuizOption = option;

      optionButtons.forEach((button) => {
        button.classList.remove("is-selected");
      });

      optionButton.classList.add("is-selected");
      quizNextButton.textContent = quizLocale.checkAnswer;
      quizButtonMode = "check";
      showQuizNextButton();
    });

    quizAnswers.appendChild(optionButton);
  });
}

const numberedFileBurstDirectory = "content";
const numberedFileBurstFileCount = 45;
const fileBurstMinCount = hasCoarsePointer ? 12 : 20;
const fileBurstMaxCount = hasCoarsePointer ? 24 : 40;
const fileBurstMinCountReducedMotion = 8;
const fileBurstMaxCountReducedMotion = 18;

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomFloat(min, max + 1));
}

function getNumberedFileSrc(index) {
  return `${numberedFileBurstDirectory}/${index}.webp`;
}

function setNumberedFileSource(fileElement, index) {
  fileElement.onerror = () => {
    fileElement.remove();
  };
  fileElement.src = getNumberedFileSrc(index);
}

function pickRandomNumberedFile() {
  const randomIndex = randomInt(1, numberedFileBurstFileCount);
  return {
    index: randomIndex
  };
}

function spawnNumberedFileBurst(sourceElement) {
  if (!sourceElement || !heartsContainer) {
    return;
  }

  const sourceRect = sourceElement.getBoundingClientRect();
  const originX = sourceRect.left + sourceRect.width / 2;
  const originY = sourceRect.top + sourceRect.height / 2;
  const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
  const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
  const maxDistance = Math.max(180, Math.min(viewportWidth, viewportHeight) * (isReducedMotionPreferred ? 0.36 : 0.62));
  const minCount = isReducedMotionPreferred ? fileBurstMinCountReducedMotion : fileBurstMinCount;
  const maxCount = isReducedMotionPreferred ? fileBurstMaxCountReducedMotion : fileBurstMaxCount;
  const burstCount = randomInt(minCount, maxCount);

  for (let index = 0; index < burstCount; index += 1) {
    const fileElement = document.createElement("img");
    const fileAsset = pickRandomNumberedFile();
    const angleDegrees = randomFloat(-155, -25);
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const distance = randomFloat(maxDistance * 0.38, maxDistance);
    const translateX = Math.cos(angleRadians) * distance;
    const translateY = Math.sin(angleRadians) * distance;
    const fileSize = randomFloat(isReducedMotionPreferred ? 34 : 40, isReducedMotionPreferred ? 68 : 90);
    const durationSec = randomFloat(isReducedMotionPreferred ? 4.2 : 4.8, isReducedMotionPreferred ? 5.1 : 6.4);
    const delaySec = randomFloat(0, isReducedMotionPreferred ? 0.12 : 0.26);
    const rotateDeg = randomFloat(-95, 95);

    fileElement.className = "flying-memory-file";
    setNumberedFileSource(fileElement, fileAsset.index);
    fileElement.alt = "";
    fileElement.decoding = "async";
    fileElement.loading = "eager";
    fileElement.style.setProperty("--origin-x", `${originX}px`);
    fileElement.style.setProperty("--origin-y", `${originY}px`);
    fileElement.style.setProperty("--file-translate-x", `${translateX.toFixed(2)}px`);
    fileElement.style.setProperty("--file-translate-y", `${translateY.toFixed(2)}px`);
    fileElement.style.setProperty("--file-size", `${Math.round(fileSize)}px`);
    fileElement.style.setProperty("--file-duration", `${durationSec.toFixed(2)}s`);
    fileElement.style.setProperty("--file-delay", `${delaySec.toFixed(2)}s`);
    fileElement.style.setProperty("--file-rotate", `${rotateDeg.toFixed(2)}deg`);

    const cleanupFile = () => {
      fileElement.remove();
    };

    fileElement.addEventListener("animationend", cleanupFile, { once: true });
    fileElement.addEventListener("animationcancel", cleanupFile, { once: true });
    heartsContainer.appendChild(fileElement);
  }
}

function spawnSingleNumberedFileAtPoint(clientX, clientY) {
  if (!heartsContainer) {
    return;
  }

  const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
  const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
  const clampedX = Math.min(viewportWidth, Math.max(0, clientX));
  const clampedY = Math.min(viewportHeight, Math.max(0, clientY));
  const fileAsset = pickRandomNumberedFile();
  const angleDegrees = randomFloat(-160, -20);
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const distance = randomFloat(52, isReducedMotionPreferred ? 88 : 126);
  const translateX = Math.cos(angleRadians) * distance;
  const translateY = Math.sin(angleRadians) * distance;
  const fileSize = randomFloat(isReducedMotionPreferred ? 52 : 58, isReducedMotionPreferred ? 74 : 88);
  const durationSec = randomFloat(isReducedMotionPreferred ? 2.2 : 1.9, isReducedMotionPreferred ? 3.1 : 2.6);
  const rotateDeg = randomFloat(-48, 48);

  const fileElement = document.createElement("img");
  fileElement.className = "flying-memory-file";
  setNumberedFileSource(fileElement, fileAsset.index);
  fileElement.alt = "";
  fileElement.decoding = "async";
  fileElement.loading = "eager";
  fileElement.style.setProperty("--origin-x", `${clampedX}px`);
  fileElement.style.setProperty("--origin-y", `${clampedY}px`);
  fileElement.style.setProperty("--file-translate-x", `${translateX.toFixed(2)}px`);
  fileElement.style.setProperty("--file-translate-y", `${translateY.toFixed(2)}px`);
  fileElement.style.setProperty("--file-size", `${Math.round(fileSize)}px`);
  fileElement.style.setProperty("--file-duration", `${durationSec.toFixed(2)}s`);
  fileElement.style.setProperty("--file-delay", "0s");
  fileElement.style.setProperty("--file-rotate", `${rotateDeg.toFixed(2)}deg`);

  const cleanupFile = () => {
    fileElement.remove();
  };

  fileElement.addEventListener("animationend", cleanupFile, { once: true });
  fileElement.addEventListener("animationcancel", cleanupFile, { once: true });
  heartsContainer.appendChild(fileElement);
}

const bunnyTapSpawnMaxDurationMs = 240;
const bunnyTapSpawnMaxMovePx = 10;
let bunnyTapSpawnGesture = null;

function isBunnyTapSpawnBlockedTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest(".bunny-player, .bunny"));
}

function onBunnyScreenPointerDown(event) {
  if (!isBunnyEndingMode || event.button !== 0) {
    bunnyTapSpawnGesture = null;
    return;
  }

  if (isBunnyTapSpawnBlockedTarget(event.target)) {
    bunnyTapSpawnGesture = null;
    return;
  }

  bunnyTapSpawnGesture = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startedAt: Date.now(),
    moved: false
  };
}

function onBunnyScreenPointerMove(event) {
  if (!bunnyTapSpawnGesture || event.pointerId !== bunnyTapSpawnGesture.pointerId) {
    return;
  }

  const deltaX = event.clientX - bunnyTapSpawnGesture.startX;
  const deltaY = event.clientY - bunnyTapSpawnGesture.startY;
  if (Math.hypot(deltaX, deltaY) > bunnyTapSpawnMaxMovePx) {
    bunnyTapSpawnGesture.moved = true;
  }
}

function onBunnyScreenPointerUp(event) {
  if (!bunnyTapSpawnGesture || event.pointerId !== bunnyTapSpawnGesture.pointerId) {
    return;
  }

  const elapsedMs = Date.now() - bunnyTapSpawnGesture.startedAt;
  const shouldSpawn =
    isBunnyEndingMode &&
    !bunnyTapSpawnGesture.moved &&
    elapsedMs <= bunnyTapSpawnMaxDurationMs &&
    !isBunnyTapSpawnBlockedTarget(event.target);

  bunnyTapSpawnGesture = null;

  if (!shouldSpawn) {
    return;
  }

  spawnSingleNumberedFileAtPoint(event.clientX, event.clientY);
}

function onBunnyScreenPointerCancel(event) {
  if (!bunnyTapSpawnGesture || event.pointerId !== bunnyTapSpawnGesture.pointerId) {
    return;
  }

  bunnyTapSpawnGesture = null;
}

if (quizSection) {
  quizSection.addEventListener("pointerdown", onBunnyScreenPointerDown);
  quizSection.addEventListener("pointermove", onBunnyScreenPointerMove);
  quizSection.addEventListener("pointerup", onBunnyScreenPointerUp);
  quizSection.addEventListener("pointercancel", onBunnyScreenPointerCancel);
}

quizNextButton.addEventListener("click", () => {
  const quizLocale = getLocalePack().quiz;

  if (isFinalCtaMode) {
    if (finalCtaStep === "cta") {
      ambientHeartFlowMultiplier = 1;
      finalLoveText.textContent = quizLocale.valentineQuestion;
      finalLoveText.hidden = false;
      quizNextButton.textContent = quizLocale.yesButton;
      finalBunnies.hidden = true;
      quizNextButton.classList.remove("is-hold-fill");
      quizNextButton.classList.remove("is-holding");
      finalCtaStep = "question";
      runHeartBurst();
      return;
    }

    if (finalCtaStep === "question") {
      finalLoveText.textContent = quizLocale.valentineAccepted;
      quizNextButton.textContent = quizLocale.loveBackButton;
      quizNextButton.classList.add("is-hold-fill");
      finalBunnies.hidden = true;
      finalCtaStep = "accepted";
      spawnNumberedFileBurst(quizNextButton);
      runHeartBurst(8, 5000);
      return;
    }

    return;
  }

  cancelHoldToReset();
  if (quizButtonMode === "hidden") {
    return;
  }

  if (quizButtonMode === "check") {
    checkCurrentQuestionAnswer();
    return;
  }

  if (quizButtonMode === "open-final") {
    activateFinalCtaMode();
    return;
  }

  if (currentQuizIndex === quizQuestions.length - 1) {
    firstThreeAllCorrect = true;
    currentQuizIndex = 0;
  } else if (currentQuizIndex === 2 && !firstThreeAllCorrect) {
    firstThreeAllCorrect = true;
    currentQuizIndex = 0;
    renderQuizQuestion(quizLocale.unlockFourthHint);
    return;
  } else {
    currentQuizIndex += 1;
  }

  renderQuizQuestion();
});

quizNextButton.addEventListener("pointerdown", (event) => {
  startHoldToReset(event);
});

quizNextButton.addEventListener("pointerup", () => {
  cancelHoldToReset();
});

quizNextButton.addEventListener("pointercancel", () => {
  cancelHoldToReset();
});

quizNextButton.addEventListener("pointerleave", () => {
  cancelHoldToReset();
});

function createHeart(color = null, options = {}) {
  if (!heartsContainer) {
    return false;
  }

  const heartLimit = isReducedMotionPreferred ? maxActiveHeartsReducedMotion : maxActiveHearts;
  if (activeHeartsCount >= heartLimit) {
    return false;
  }

  const heart = document.createElement("span");
  heart.classList.add("heart");

  const hasOriginPoint = Number.isFinite(options.originX) && Number.isFinite(options.originY);
  const spreadPx = Number.isFinite(options.spreadPx) ? Math.max(0, options.spreadPx) : 0;
  const durationMin = Number.isFinite(options.durationMin)
    ? Math.max(0.2, options.durationMin)
    : isReducedMotionPreferred
      ? 5.2
      : 4;
  const durationMax = Number.isFinite(options.durationMax)
    ? Math.max(durationMin, options.durationMax)
    : isReducedMotionPreferred
      ? 8.6
      : 7;
  const duration = durationMin + Math.random() * (durationMax - durationMin);
  const size = 10 + Math.random() * 14;
  const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
  const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);

  if (hasOriginPoint) {
    const jitterX = (Math.random() * 2 - 1) * spreadPx;
    const jitterY = (Math.random() * 2 - 1) * spreadPx;
    const originX = Math.min(viewportWidth, Math.max(0, options.originX + jitterX));
    const originY = Math.min(viewportHeight, Math.max(0, options.originY + jitterY));
    heart.style.left = `${originX - size / 2}px`;
    heart.style.bottom = `${Math.max(-20, viewportHeight - originY - size / 2)}px`;
  } else {
    const left = Math.random() * 100;
    heart.style.left = `${left}%`;
    heart.style.bottom = "-20px";
  }

  heart.style.animationDuration = `${duration}s`;
  heart.style.width = `${size}px`;
  heart.style.height = `${size}px`;
  heart.style.backgroundColor = color || "#ff7cae";

  activeHeartsCount += 1;
  heartsContainer.appendChild(heart);

  let isCleanedUp = false;
  const cleanupHeart = () => {
    if (isCleanedUp) {
      return;
    }

    isCleanedUp = true;
    activeHeartsCount = Math.max(0, activeHeartsCount - 1);
    heart.remove();
  };

  heart.addEventListener("animationend", cleanupHeart, { once: true });
  heart.addEventListener("animationcancel", cleanupHeart, { once: true });
  return true;
}

function runHeartBurst(multiplier = 4, durationMs = 1800) {
  if (!isReducedMotionPreferred) {
    boostHeartFlow(multiplier, durationMs);
    return;
  }

  const reducedMultiplier = Math.max(1, Math.ceil(multiplier * 0.5));
  const reducedDuration = Math.max(900, Math.floor(durationMs * 0.75));
  boostHeartFlow(reducedMultiplier, reducedDuration);
}
