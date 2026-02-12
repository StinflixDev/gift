function tryStartBackgroundMusic(track = activeMusicTrack) {
  if (!track) {
    return Promise.resolve(false);
  }

  const playPromise = track.play();
  if (playPromise && typeof playPromise.catch === "function") {
    return playPromise
      .then(() => true)
      .catch(() => false);
  }

  return Promise.resolve(!track.paused);
}

function stopHoldMusicFade(restoreVolume = true) {
  if (holdMusicFadeFrame !== null) {
    cancelAnimationFrame(holdMusicFadeFrame);
    holdMusicFadeFrame = null;
  }

  if (restoreVolume && activeMusicTrack) {
    activeMusicTrack.volume = currentMusicVolume;
  }
}

function startHoldMusicFade() {
  if (!activeMusicTrack) {
    return;
  }

  const fadingTrack = activeMusicTrack;
  stopHoldMusicFade(false);
  holdMusicFadeStartedAt = performance.now();
  holdMusicFadeStartVolume = fadingTrack.volume;

  const tick = (now) => {
    if (activeMusicTrack !== fadingTrack) {
      holdMusicFadeFrame = null;
      return;
    }

    const progress = Math.min(1, (now - holdMusicFadeStartedAt) / holdToResetMs);
    fadingTrack.volume = Math.max(0, holdMusicFadeStartVolume * (1 - progress));

    if (progress < 1) {
      holdMusicFadeFrame = requestAnimationFrame(tick);
    } else {
      holdMusicFadeFrame = null;
    }
  };

  holdMusicFadeFrame = requestAnimationFrame(tick);
}

function shuffleTrackSources(trackSources) {
  const shuffled = [...trackSources];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentValue = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = currentValue;
  }

  return shuffled;
}

function setActiveTrackSource(trackSrc, { restart = false, loop = false } = {}) {
  if (!activeMusicTrack || !trackSrc) {
    return Promise.resolve(false);
  }

  if (activeMusicTrack.getAttribute("src") !== trackSrc) {
    activeMusicTrack.src = trackSrc;
    activeMusicTrack.load();
  }

  activeMusicTrack.loop = loop;
  activeMusicTrack.volume = currentMusicVolume;
  if (restart) {
    activeMusicTrack.currentTime = 0;
  }

  musicPausedByUser = false;
  updateBunnyPlayerVolumeControl();
  return tryStartBackgroundMusic(activeMusicTrack);
}

function setCurrentMusicVolume(nextVolume) {
  const normalizedVolume = Math.min(1, Math.max(0, Number(nextVolume) || 0));
  currentMusicVolume = normalizedVolume;

  if (activeMusicTrack) {
    activeMusicTrack.volume = normalizedVolume;
  }

  updateBunnyPlayerVolumeControl();
}

function updateBunnyPlayerPauseButton() {
  if (!bunnyPlayerPauseButton) {
    return;
  }

  const isPaused = !activeMusicTrack || activeMusicTrack.paused;
  bunnyPlayerPauseButton.textContent = isPaused ? "▶" : "⏸";
  bunnyPlayerPauseButton.setAttribute("aria-label", isPaused ? "Play" : "Pause");
}

function updateBunnyPlayerRepeatButton() {
  if (!bunnyPlayerRepeatButton) {
    return;
  }

  bunnyPlayerRepeatButton.classList.toggle("is-active", bunnyTrackRepeatEnabled);
  bunnyPlayerRepeatButton.setAttribute(
    "aria-label",
    bunnyTrackRepeatEnabled ? "Disable repeat track" : "Enable repeat track"
  );
}

function updateBunnyPlayerShushButton() {
  if (!bunnyPlayerShushButton) {
    return;
  }

  bunnyPlayerShushButton.classList.toggle("is-active", bunnyIdleSpeechMuted);
  bunnyPlayerShushButton.setAttribute(
    "aria-label",
    bunnyIdleSpeechMuted ? "Enable idle bunny speech" : "Disable idle bunny speech"
  );
}

function updateBunnyPlayerVolumeControl() {
  if (!bunnyPlayerVolumeInput || !activeMusicTrack) {
    return;
  }

  const volumePercent = Math.round(Math.min(1, Math.max(0, activeMusicTrack.volume)) * 100);
  bunnyPlayerVolumeInput.value = String(volumePercent);
}

function applyBunnyPlayerButtonLabels() {
  if (bunnyPlayerPrevButton) {
    bunnyPlayerPrevButton.setAttribute("aria-label", "Previous track");
  }

  if (bunnyPlayerNextButton) {
    bunnyPlayerNextButton.setAttribute("aria-label", "Next track");
  }

  if (bunnyPlayerVolumeInput) {
    bunnyPlayerVolumeInput.setAttribute("aria-label", "Track volume");
  }

  updateBunnyPlayerPauseButton();
  updateBunnyPlayerRepeatButton();
  updateBunnyPlayerVolumeControl();
  updateBunnyPlayerShushButton();
}

function stopBunnyPlayerControlsPeek() {
  if (bunnyPlayerControlsPeekTimeout !== null) {
    clearTimeout(bunnyPlayerControlsPeekTimeout);
    bunnyPlayerControlsPeekTimeout = null;
  }

  if (bunnyPlayerControls) {
    bunnyPlayerControls.classList.remove("is-peek");
  }
}

function startBunnyPlayerControlsPeek() {
  if (!bunnyPlayerControls || hasCoarsePointer) {
    return;
  }

  stopBunnyPlayerControlsPeek();
  bunnyPlayerControls.classList.add("is-peek");
  bunnyPlayerControlsPeekTimeout = window.setTimeout(() => {
    if (bunnyPlayerControls) {
      bunnyPlayerControls.classList.remove("is-peek");
    }
    bunnyPlayerControlsPeekTimeout = null;
  }, bunnyPlayerControlsPeekMs);
}

function updateBunnyPlayerControlsVisibility() {
  if (!bunnyPlayerControls) {
    return;
  }

  const wasHidden = bunnyPlayerControls.hidden;
  const shouldShow = isBunnyEndingMode;
  bunnyPlayerControls.hidden = !shouldShow;
  bunnyPlayerControls.setAttribute("aria-hidden", String(!shouldShow));

  if (!shouldShow) {
    stopBunnyPlayerControlsPeek();
    return;
  }

  updateBunnyPlayerPauseButton();
  updateBunnyPlayerRepeatButton();
  updateBunnyPlayerVolumeControl();
  updateBunnyPlayerShushButton();
  if (wasHidden) {
    startBunnyPlayerControlsPeek();
  }
}

function hideNowPlayingTrack(options = {}) {
  if (!nowPlayingTrackElement) {
    return;
  }

  const immediate = options.immediate === true;

  if (nowPlayingTrackHideTimeout !== null) {
    clearTimeout(nowPlayingTrackHideTimeout);
    nowPlayingTrackHideTimeout = null;
  }

  if (nowPlayingTrackHideTransitionTimeout !== null) {
    clearTimeout(nowPlayingTrackHideTransitionTimeout);
    nowPlayingTrackHideTransitionTimeout = null;
  }

  nowPlayingTrackElement.classList.remove("is-visible");
  if (immediate) {
    nowPlayingTrackElement.hidden = true;
    return;
  }

  nowPlayingTrackHideTransitionTimeout = window.setTimeout(() => {
    if (!nowPlayingTrackElement.classList.contains("is-visible")) {
      nowPlayingTrackElement.hidden = true;
    }
    nowPlayingTrackHideTransitionTimeout = null;
  }, 280);
}

function formatTrackName(trackSrc) {
  if (typeof trackSrc !== "string" || trackSrc.length === 0) {
    return "";
  }

  const rawFileName = trackSrc.split("/").pop() || trackSrc;
  const decodedName = decodeURIComponent(rawFileName);
  return decodedName.replace(/\.[^.]+$/, "");
}

function showNowPlayingTrack(trackSrc) {
  if (!nowPlayingTrackElement || !isBunnyEndingMode) {
    return;
  }

  const trackName = formatTrackName(trackSrc);
  if (!trackName) {
    return;
  }

  nowPlayingTrackElement.textContent = trackName;
  nowPlayingTrackElement.hidden = false;
  window.requestAnimationFrame(() => {
    nowPlayingTrackElement.classList.add("is-visible");
  });

  if (nowPlayingTrackHideTimeout !== null) {
    clearTimeout(nowPlayingTrackHideTimeout);
  }

  if (nowPlayingTrackHideTransitionTimeout !== null) {
    clearTimeout(nowPlayingTrackHideTransitionTimeout);
    nowPlayingTrackHideTransitionTimeout = null;
  }

  nowPlayingTrackHideTimeout = window.setTimeout(() => {
    hideNowPlayingTrack();
    nowPlayingTrackHideTimeout = null;
  }, 5000);
}

function buildBunnyRadioQueue() {
  const remainingTracks = bunnyRadioTrackSources.filter((trackSrc) => trackSrc !== bunnyRadioFirstTrackSrc);
  return shuffleTrackSources(remainingTracks);
}

function playExactBunnyRadioTrack(trackSrc, { remember = true } = {}) {
  return setActiveTrackSource(trackSrc, { restart: true, loop: bunnyTrackRepeatEnabled }).then((started) => {
    if (started) {
      if (remember) {
        const lastTrack = bunnyRadioHistory[bunnyRadioHistory.length - 1];
        if (lastTrack !== trackSrc) {
          bunnyRadioHistory.push(trackSrc);
        }
      }
      showNowPlayingTrack(trackSrc);
      updateBunnyPlayerPauseButton();
    }

    return started;
  });
}

function playNextBunnyRadioTrack() {
  if (!isBunnyRadioMode) {
    return Promise.resolve(false);
  }

  if (bunnyRadioQueue.length === 0) {
    bunnyRadioQueue = buildBunnyRadioQueue();
    return playExactBunnyRadioTrack(bunnyRadioFirstTrackSrc);
  }

  const nextTrackSrc = bunnyRadioQueue.shift();
  return playExactBunnyRadioTrack(nextTrackSrc);
}

function playPreviousBunnyRadioTrack() {
  if (!isBunnyRadioMode || !activeMusicTrack) {
    return;
  }

  if (bunnyRadioHistory.length <= 1) {
    activeMusicTrack.currentTime = 0;
    tryStartBackgroundMusic(activeMusicTrack);
    updateBunnyPlayerPauseButton();
    return;
  }

  bunnyRadioHistory.pop();
  const previousTrackSrc = bunnyRadioHistory[bunnyRadioHistory.length - 1];
  playExactBunnyRadioTrack(previousTrackSrc, { remember: false });
}

function toggleBunnyRadioPlayback() {
  if (!activeMusicTrack || !isBunnyEndingMode) {
    return;
  }

  if (activeMusicTrack.paused) {
    musicPausedByUser = false;
    tryStartBackgroundMusic(activeMusicTrack).then(() => {
      updateBunnyPlayerPauseButton();
    });
    return;
  }

  musicPausedByUser = true;
  activeMusicTrack.pause();
  updateBunnyPlayerPauseButton();
}

function toggleBunnyTrackRepeatMode() {
  bunnyTrackRepeatEnabled = !bunnyTrackRepeatEnabled;
  if (isBunnyRadioMode && activeMusicTrack) {
    activeMusicTrack.loop = bunnyTrackRepeatEnabled;
  }
  updateBunnyPlayerRepeatButton();
}

function toggleBunnyIdleSpeechMute() {
  bunnyIdleSpeechMuted = !bunnyIdleSpeechMuted;
  updateBunnyPlayerShushButton();

  if (bunnyIdleSpeechMuted) {
    if (typeof hideBunnySpeechNow === "function") {
      hideBunnySpeechNow(true);
    }
    return;
  }

  if (isBunnyEndingMode && typeof startBunnyIdlePhrases === "function") {
    startBunnyIdlePhrases();
  }
}

function setupBunnyPlayerControls() {
  if (!bunnyPlayerControls || bunnyPlayerControlsInitialized) {
    return;
  }

  bunnyPlayerControlsInitialized = true;
  applyBunnyPlayerButtonLabels();
  updateBunnyPlayerControlsVisibility();

  if (bunnyPlayerPrevButton) {
    bunnyPlayerPrevButton.addEventListener("click", () => {
      playPreviousBunnyRadioTrack();
    });
  }

  if (bunnyPlayerPauseButton) {
    bunnyPlayerPauseButton.addEventListener("click", () => {
      toggleBunnyRadioPlayback();
    });
  }

  if (bunnyPlayerNextButton) {
    bunnyPlayerNextButton.addEventListener("click", () => {
      playNextBunnyRadioTrack();
    });
  }

  if (bunnyPlayerRepeatButton) {
    bunnyPlayerRepeatButton.addEventListener("click", () => {
      toggleBunnyTrackRepeatMode();
    });
  }

  if (bunnyPlayerVolumeInput) {
    bunnyPlayerVolumeInput.addEventListener("input", () => {
      const volumePercent = Number(bunnyPlayerVolumeInput.value);
      if (!Number.isFinite(volumePercent)) {
        return;
      }

      setCurrentMusicVolume(volumePercent / 100);
    });
  }

  if (bunnyPlayerShushButton) {
    bunnyPlayerShushButton.addEventListener("click", () => {
      toggleBunnyIdleSpeechMute();
    });
  }

  activeMusicTrack.addEventListener("play", updateBunnyPlayerPauseButton);
  activeMusicTrack.addEventListener("pause", updateBunnyPlayerPauseButton);
  activeMusicTrack.addEventListener("volumechange", updateBunnyPlayerVolumeControl);
}

function startBunnyRadioMode() {
  if (!activeMusicTrack || !bunnyRadioFirstTrackSrc) {
    return;
  }

  stopHoldMusicFade(false);
  isBunnyRadioMode = true;
  bunnyRadioQueue = buildBunnyRadioQueue();
  bunnyRadioHistory = [];
  playExactBunnyRadioTrack(bunnyRadioFirstTrackSrc).then((started) => {
    if (started) {
      return;
    }

    if (!started) {
      playNextBunnyRadioTrack();
    }
  });
}

function setupBackgroundMusic() {
  if (!activeMusicTrack) {
    return;
  }

  activeMusicTrack.addEventListener("ended", () => {
    if (!isBunnyRadioMode) {
      return;
    }

    playNextBunnyRadioTrack();
  });

  setActiveTrackSource(initialBackgroundTrackSrc, { loop: true });
  updateBunnyPlayerPauseButton();

  const resumeFromGesture = () => {
    tryStartBackgroundMusic().then((started) => {
      if (!started) {
        return;
      }

      document.removeEventListener("pointerdown", resumeFromGesture);
      document.removeEventListener("keydown", resumeFromGesture);
      document.removeEventListener("touchstart", resumeFromGesture);
    });
  };

  document.addEventListener("pointerdown", resumeFromGesture);
  document.addEventListener("keydown", resumeFromGesture);
  document.addEventListener("touchstart", resumeFromGesture, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && activeMusicTrack.paused && !musicPausedByUser) {
      tryStartBackgroundMusic();
    }
  });

  window.addEventListener("focus", () => {
    if (activeMusicTrack.paused && !musicPausedByUser) {
      tryStartBackgroundMusic();
    }
  });
}

function getLocalePack() {
  return localeContent[currentLocale] || localeContent.en;
}

function getBunnyPhrasePack() {
  return bunnyPhrasesByLocale[currentLocale] || bunnyPhrasesByLocale.en || { cute: [], idle: [] };
}

function getCurrentBunnyCutePhrases() {
  return getBunnyPhrasePack().cute || [];
}

function getCurrentBunnyIdlePhrases() {
  return getBunnyPhrasePack().idle || [];
}

function formatDaysLabel(days) {
  if (currentLocale === "ua") {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    const suffix =
      lastDigit === 1 && lastTwoDigits !== 11
        ? "день"
        : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
          ? "дні"
          : "днів";
    return `${days} ${suffix}`;
  }

  if (currentLocale === "fn") {
    return `${days} ${days === 1 ? "päivä" : "päivää"}`;
  }

  return `${days} ${days === 1 ? "day" : "days"}`;
}

function updateLocaleButtonsState() {
  localeButtons.forEach((button) => {
    const isActive = button.dataset.locale === currentLocale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyLocalizedStaticTexts() {
  const locale = getLocalePack();

  document.title = "❤️❤️❤️";
  if (badgeElement) {
    badgeElement.textContent = locale.badge;
  }
  if (heroTitleElement) {
    heroTitleElement.textContent = locale.heroTitle;
  }
  if (reasonsTitleElement) {
    reasonsTitleElement.textContent = locale.reasonsTitle;
  }
  if (bunnyShortcutButton) {
    bunnyShortcutButton.textContent = locale.bunnyShortcut || "To bunnies 🐰";
  }
  if (bunnyPlayerShushButton) {
    bunnyPlayerShushButton.textContent = locale.bunnyPlayerShush || "Shush ♡";
  }

  reasonItems.forEach((item, index) => {
    item.textContent = locale.reasons[index] || "";
    item.dataset.revealHint = locale.revealHint;
  });

  applyBunnyPlayerButtonLabels();
}

function setLocale(nextLocale, rerenderQuiz = true) {
  if (!localeContent[nextLocale]) {
    return;
  }

  currentLocale = nextLocale;
  applyLocalizedStaticTexts();
  updateLocaleButtonsState();

  if (rerenderQuiz && areReasonsUnlocked && !isFinalCtaMode && !isBunnyEndingMode) {
    renderQuizQuestion();
  }
}

function updateLocalizationVisibility() {
  if (!localizationControls) {
    return;
  }

  const showDuringQuiz = !isFinalCtaMode && !isBunnyEndingMode;
  localizationControls.hidden = !showDuringQuiz;
  localizationControls.setAttribute("aria-hidden", String(!showDuringQuiz));
}

function setupLocalizationControls() {
  localeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLocale(button.dataset.locale);
    });
  });

  updateLocaleButtonsState();
  updateLocalizationVisibility();
}

function getDaysTogether(startDate) {
  const [year, month, day] = startDate.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) {
    return 0;
  }

  const startUtcDay = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayUtcDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const diffMs = todayUtcDay - startUtcDay;
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  return days;
}

function buildQuizOptions(correctAnswer) {
  const options = new Set([correctAnswer]);
  const offsets = [-16, -7, -3, 2, 5, 9, 14, 21];
  let offsetIndex = 0;

  while (options.size < 4) {
    const candidate = correctAnswer + offsets[offsetIndex % offsets.length];
    if (candidate >= 0 && candidate !== correctAnswer) {
      options.add(candidate);
    }
    offsetIndex += 1;
  }

  return [...options].sort(() => Math.random() - 0.5);
}

function shuffleOptions(options) {
  return [...options].sort(() => Math.random() - 0.5);
}

function getQuizQuestionPayload(quizQuestion) {
  const quizLocale = getLocalePack().quiz;

  if (quizQuestion.type === "days") {
    const correctDays = getDaysTogether(relationshipStartDate);
    const correctLabel = formatDaysLabel(correctDays);
    const options = buildQuizOptions(correctDays).map((days) => formatDaysLabel(days));

    return {
      key: quizQuestion.key,
      text: quizLocale[quizQuestion.questionKey],
      options,
      correctAnswers: [correctLabel],
      successText: quizLocale.daysCorrect(correctLabel),
      failText: `${quizLocale.almostRightPrefix} ${correctLabel} 💘`
    };
  }

  const options = [...quizLocale[quizQuestion.optionsKey]];
  const correctAnswers = quizQuestion.allAnswersCorrect ? [...options] : [options[quizQuestion.correctIndex]];
  const successText = quizQuestion.allAnswersCorrect
    ? quizLocale.allAnswersCorrect
    : quizLocale[quizQuestion.successTextKey] || quizLocale.genericCorrect;
  const failText = `${quizLocale.almostRightPrefix} ${correctAnswers[0]} 💘`;

  return {
    key: quizQuestion.key,
    text: quizLocale[quizQuestion.questionKey],
    options: shuffleOptions(options),
    correctAnswers,
    successText,
    failText,
    accentAnswer: quizQuestion.key === "color" ? options[quizQuestion.correctIndex] : null
  };
}
