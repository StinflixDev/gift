const pageLoader = document.getElementById("pageLoader");
const pageLoaderBadge = document.getElementById("pageLoaderBadge");
const pageLoaderText = document.getElementById("pageLoaderText");
const pageLoaderBar = document.getElementById("pageLoaderBar");
let tapBurstLayer = null;
let tapBurstEffectBound = false;

function finishPageLoader() {
  if (!pageLoader) {
    return;
  }

  pageLoader.classList.add("is-hiding");
  const hideDelayMs = isReducedMotionPreferred ? 180 : 420;
  window.setTimeout(() => {
    pageLoader.hidden = true;
  }, hideDelayMs);
}

function getLoaderImageSources() {
  const fileCount = Number.isFinite(numberedFileBurstFileCount) ? numberedFileBurstFileCount : 36;

  return Array.from({ length: fileCount }, (_, index) => {
    const fileIndex = index + 1;
    if (typeof getNumberedFileSrc === "function") {
      return getNumberedFileSrc(fileIndex);
    }

    return `content/${fileIndex}.webp`;
  });
}

function getLoaderAudioSources() {
  if (Array.isArray(bunnyRadioTrackSources) && bunnyRadioTrackSources.length > 0) {
    return [...new Set(bunnyRadioTrackSources)];
  }

  return [];
}

function preloadLoaderImageAsset(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

function preloadLoaderAudioAsset(src) {
  return new Promise((resolve) => {
    const audio = new Audio();
    let isSettled = false;

    const cleanup = (wasLoaded) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeoutId);
      audio.removeEventListener("canplaythrough", handleLoaded);
      audio.removeEventListener("loadeddata", handleLoaded);
      audio.removeEventListener("error", handleError);
      resolve(wasLoaded);
    };

    const handleLoaded = () => cleanup(true);
    const handleError = () => cleanup(false);
    const timeoutId = window.setTimeout(() => cleanup(false), 12000);

    audio.preload = "auto";
    audio.src = src;
    audio.addEventListener("canplaythrough", handleLoaded);
    audio.addEventListener("loadeddata", handleLoaded);
    audio.addEventListener("error", handleError);
    audio.load();
  });
}

function createLoaderTasks() {
  const imageTasks = getLoaderImageSources().map((src) => () => preloadLoaderImageAsset(src));
  const audioTasks = getLoaderAudioSources().map((src) => () => preloadLoaderAudioAsset(src));
  return [...imageTasks, ...audioTasks];
}

function ensureTapBurstLayer() {
  if (tapBurstLayer && tapBurstLayer.isConnected) {
    return tapBurstLayer;
  }

  tapBurstLayer = document.createElement("div");
  tapBurstLayer.className = "tap-burst-layer";
  tapBurstLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(tapBurstLayer);
  return tapBurstLayer;
}

function spawnTapBurst(clientX, clientY) {
  const layer = ensureTapBurstLayer();
  const burst = document.createElement("div");
  const burstCount = isReducedMotionPreferred ? 6 : hasCoarsePointer ? 8 : 10;
  const maxDelayMs = isReducedMotionPreferred ? 40 : 80;
  let maxLifetimeMs = 0;

  burst.className = "tap-burst";
  burst.style.left = `${clientX}px`;
  burst.style.top = `${clientY}px`;

  for (let index = 0; index < burstCount; index += 1) {
    const line = document.createElement("span");
    const baseAngle = (360 / burstCount) * index;
    const angleJitter = (Math.random() - 0.5) * (isReducedMotionPreferred ? 12 : 20);
    const angleDeg = baseAngle + angleJitter;
    const distancePx = isReducedMotionPreferred ? 24 + Math.random() * 16 : 32 + Math.random() * 28;
    const lengthPx = isReducedMotionPreferred ? 12 + Math.random() * 5 : 14 + Math.random() * 8;
    const durationMs = isReducedMotionPreferred ? 300 + Math.random() * 120 : 360 + Math.random() * 180;
    const delayMs = Math.random() * maxDelayMs;

    line.className = "tap-burst__line";
    line.style.setProperty("--tap-angle", `${angleDeg}deg`);
    line.style.setProperty("--tap-distance", `${distancePx.toFixed(1)}px`);
    line.style.setProperty("--tap-length", `${lengthPx.toFixed(1)}px`);
    line.style.setProperty("--tap-duration", `${durationMs.toFixed(0)}ms`);
    line.style.setProperty("--tap-delay", `${delayMs.toFixed(0)}ms`);
    burst.appendChild(line);

    const lifetimeMs = durationMs + delayMs;
    if (lifetimeMs > maxLifetimeMs) {
      maxLifetimeMs = lifetimeMs;
    }
  }

  layer.appendChild(burst);
  window.setTimeout(() => {
    burst.remove();
  }, Math.ceil(maxLifetimeMs + 60));
}

function setupTapBurstEffect() {
  if (tapBurstEffectBound) {
    return;
  }

  tapBurstEffectBound = true;
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      if (activeBunnyDrag !== null) {
        return;
      }

      if (event.target instanceof Element && event.target.closest("input[type='range']")) {
        return;
      }

      spawnTapBurst(event.clientX, event.clientY);
    },
    { passive: true }
  );
}

function simulatePageLoading() {
  if (!pageLoader || !pageLoaderText || !pageLoaderBar) {
    return Promise.resolve();
  }

  const localeLoader = getLocalePack().loader || {};
  const loadingLabel = localeLoader.label || "Loading";
  const loadingSteps =
    Array.isArray(localeLoader.steps) && localeLoader.steps.length === 3
      ? localeLoader.steps
      : ["Preparing a surprise…", "Filling with hearts", "Almost ready"];

  if (pageLoaderBadge) {
    pageLoaderBadge.textContent = loadingLabel;
  }

  const minDurationMs = isReducedMotionPreferred ? 850 : 1700;
  const loaderTasks = createLoaderTasks();
  const totalTasks = loaderTasks.length;

  return new Promise((resolve) => {
    const startTs = performance.now();
    let completedTasks = 0;
    const progressAnimationDurationMs = isReducedMotionPreferred ? 120 : 320;
    let targetProgress = 0;
    let renderedProgress = 0;
    let animationFrameId = null;
    let animationStartedAt = 0;
    let animationFrom = 0;

    const clampProgress = (value) => Math.max(0, Math.min(1, value));

    const renderProgress = (rawProgress, isComplete = false) => {
      const clampedProgress = clampProgress(rawProgress);
      const easedProgress = isComplete ? 1 : 1 - Math.pow(1 - clampedProgress, 2.2);
      const stepIndex = Math.min(loadingSteps.length - 1, Math.floor(clampedProgress * loadingSteps.length));
      const progressPercent = isComplete ? 100 : Math.min(99, Math.max(0, Math.round(clampedProgress * 100)));
      const stepText = isComplete ? loadingSteps[2] : loadingSteps[stepIndex];
      pageLoaderBar.style.transform = `scaleX(${easedProgress})`;
      pageLoaderText.textContent = `${stepText} ${progressPercent}%`;
    };

    const stopProgressAnimation = () => {
      if (animationFrameId === null) {
        return;
      }

      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      animationStartedAt = 0;
    };

    const renderProgressImmediately = (rawProgress, isComplete = false) => {
      stopProgressAnimation();
      renderedProgress = clampProgress(rawProgress);
      targetProgress = renderedProgress;
      renderProgress(renderedProgress, isComplete);
    };

    const animateProgress = (timestamp) => {
      if (animationStartedAt === 0) {
        animationStartedAt = timestamp;
      }

      const elapsedMs = timestamp - animationStartedAt;
      const linearT = Math.min(1, elapsedMs / progressAnimationDurationMs);
      const easedT = 1 - Math.pow(1 - linearT, 3);
      renderedProgress = animationFrom + (targetProgress - animationFrom) * easedT;
      renderProgress(renderedProgress, false);

      if (linearT < 1) {
        animationFrameId = window.requestAnimationFrame(animateProgress);
        return;
      }

      renderedProgress = targetProgress;
      renderProgress(renderedProgress, renderedProgress >= 1);
      animationFrameId = null;
      animationStartedAt = 0;
    };

    const setProgressTarget = (rawProgress) => {
      const nextTarget = clampProgress(rawProgress);
      if (nextTarget <= targetProgress) {
        return;
      }

      targetProgress = nextTarget;
      animationFrom = renderedProgress;
      animationStartedAt = 0;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(animateProgress);
    };

    const finishLoading = () => {
      renderProgressImmediately(1, true);
      const finishDelayMs = isReducedMotionPreferred ? 70 : 180;
      window.setTimeout(() => {
        finishPageLoader();
        resolve();
      }, finishDelayMs);
    };

    renderProgressImmediately(0);

    if (totalTasks === 0) {
      window.setTimeout(finishLoading, minDurationMs);
      return;
    }

    const onTaskSettled = () => {
      completedTasks += 1;
      setProgressTarget(completedTasks / totalTasks);

      if (completedTasks < totalTasks) {
        return;
      }

      const elapsedMs = performance.now() - startTs;
      const remainingMs = Math.max(0, minDurationMs - elapsedMs);
      window.setTimeout(finishLoading, remainingMs);
    };

    loaderTasks.forEach((runTask) => {
      runTask()
        .catch(() => false)
        .finally(onTaskSettled);
    });
  });
}

function initializeApp() {
  setupTapBurstEffect();
  setupHeartFlowVisibilityHandling();
  startHeartFlow();
  setupBackgroundMusic();
  setupBunnyInteractions();
  setupBunnyShortcut();
  setupBunnyPlayerControls();
  setupLocalizationControls();
  setLocale(currentLocale, false);
  setupReasonSpoilers();
  if (areReasonsUnlocked) {
    renderQuizQuestion();
  }
}

document.documentElement.style.setProperty("--hold-fill-duration", `${holdToResetMs}ms`);
setupMotionPreferences();
simulatePageLoading().finally(() => {
  initializeApp();
});
