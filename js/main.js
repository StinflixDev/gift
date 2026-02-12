const pageLoader = document.getElementById("pageLoader");
const pageLoaderBadge = document.getElementById("pageLoaderBadge");
const pageLoaderText = document.getElementById("pageLoaderText");
const pageLoaderBar = document.getElementById("pageLoaderBar");

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

    const renderProgress = (rawProgress, isComplete = false) => {
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      const easedProgress = isComplete ? 1 : 1 - Math.pow(1 - clampedProgress, 2.2);
      const stepIndex = Math.min(loadingSteps.length - 1, Math.floor(clampedProgress * loadingSteps.length));
      const progressPercent = isComplete ? 100 : Math.min(99, Math.max(0, Math.round(clampedProgress * 100)));
      const stepText = isComplete ? loadingSteps[2] : loadingSteps[stepIndex];
      pageLoaderBar.style.transform = `scaleX(${easedProgress})`;
      pageLoaderText.textContent = `${stepText} ${progressPercent}%`;
    };

    const finishLoading = () => {
      renderProgress(1, true);
      const finishDelayMs = isReducedMotionPreferred ? 70 : 180;
      window.setTimeout(() => {
        finishPageLoader();
        resolve();
      }, finishDelayMs);
    };

    renderProgress(0);

    if (totalTasks === 0) {
      window.setTimeout(finishLoading, minDurationMs);
      return;
    }

    const onTaskSettled = () => {
      completedTasks += 1;
      renderProgress(completedTasks / totalTasks);

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
