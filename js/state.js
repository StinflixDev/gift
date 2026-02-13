const relationshipStartDate = "2024-08-20";

const heartsContainer = document.querySelector(".hearts");
const badgeElement = document.querySelector(".badge");
const heroTitleElement = document.querySelector("h1");
const reasonsTitleElement = document.querySelector(".reasons h2");
const quizQuestionElement = document.querySelector(".quiz-question");
const quizAnswers = document.getElementById("quizAnswers");
const quizResult = document.getElementById("quizResult");
const quizProgress = document.getElementById("quizProgress");
const quizNextButton = document.getElementById("quizNextBtn");
const quizSection = document.querySelector(".quiz");
const nowPlayingTrackElement = document.getElementById("nowPlayingTrack");
const bunnyPlayerControls = document.getElementById("bunnyPlayerControls");
const bunnyPlayerPrevButton = document.getElementById("bunnyPlayerPrevBtn");
const bunnyPlayerPauseButton = document.getElementById("bunnyPlayerPauseBtn");
const bunnyPlayerNextButton = document.getElementById("bunnyPlayerNextBtn");
const bunnyPlayerRepeatButton = document.getElementById("bunnyPlayerRepeatBtn");
const bunnyPlayerVolumeInput = document.getElementById("bunnyPlayerVolume");
const bunnyPlayerShushButton = document.getElementById("bunnyPlayerShushBtn");
const localizationControls = document.getElementById("localeControls");
const localeButtons = Array.from(document.querySelectorAll(".locale-btn"));
const finalLoveText = document.getElementById("finalLoveText");
const finalBunnies = document.getElementById("finalBunnies");
const bunnyShortcutButton = document.getElementById("bunnyShortcutBtn");
const flashOverlay = document.getElementById("flashOverlay");
const bunnyElements = Array.from(document.querySelectorAll(".bunny"));
const reasonItems = Array.from(document.querySelectorAll(".reasons li"));

const quizQuestions = [
  {
    key: "days",
    questionKey: "daysQuestion",
    type: "days"
  },
  {
    key: "color",
    questionKey: "colorQuestion",
    optionsKey: "colorOptions",
    correctIndex: 0,
    successTextKey: "colorCorrect"
  },
  {
    key: "meetingDay",
    questionKey: "meetingDayQuestion",
    optionsKey: "meetingDayOptions",
    correctIndex: 0
  },
  {
    key: "love",
    questionKey: "loveQuestion",
    optionsKey: "loveOptions",
    allAnswersCorrect: true
  }
];

const localeContent = {
  ua: {
    pageTitle: "Для моєї любові ❤️",
    badge: "З Днем святого Валентина",
    heroTitle: "Ти — моя найулюбленіша людина 💕",
    reasonsTitle: "Чому я тебе кохаю",
    bunnyShortcut: "До кроликів 🐰",
    bunnyPlayerShush: "Циць ♡",
    reasons: [
      "Твоя усмішка робить мій день світлішим.",
      "Ти моя \"уті-путі\".",
      "Ти надихаєш мене ставати кращим.",
      "З тобою все стає особливим."
    ],
    revealHint: "Натисни, щоб відкрити ✨",
    loader: {
      label: "Завантаження",
      steps: ["Готуємо сюрприз…", "Наповнюємо сердечками", "Майже готово"]
    },
    quiz: {
      progress: (current, total) => `Питання ${current} з ${total}`,
      daysQuestion: "Скільки ми знаємо одне одного?",
      colorQuestion: "Який мій улюблений колір?",
      meetingDayQuestion: "У який день ми познайомилися?",
      loveQuestion: "Ти мене кохаєш?",
      colorOptions: ["Помаранчевий", "Синій", "Фіолетовий", "Зелений"],
      meetingDayOptions: ["Вівторок", "П'ятниця", "Субота", "Понеділок"],
      loveOptions: [
        "Так, дуже-дуже 💖",
        "Щодня ще сильніше 🫶",
        "До місяця й назад 🌙",
        "Безкінечно і назавжди 💞"
      ],
      daysCorrect: (label) => `Так, правильно! Ми знаємо одне одного ${label} 💖`,
      almostRightPrefix: "Майже! Правильна відповідь:",
      genericCorrect: "Так, правильно! Ти чудово знаєш нас 💖",
      colorCorrect: "Так, я люблю помаранчевий. Але тебе я кохаю ще більше 🍊💞",
      allAnswersCorrect: "І я кохаю тебе в кожному всесвіті, люба 💞",
      checkAnswer: "Перевірити відповідь",
      nextQuestion: "Наступне питання →",
      nextQuestionShort: "Наступне питання",
      retry: "Спробувати знову ↺",
      unlockFourthHint: "Щоб відкрити 4-те питання, потрібно відповісти правильно на перші 3 💡",
      pressMe: "натисни мене",
      valentineQuestion: "Будеш моєю валентинкою? 💌",
      yesButton: "Так 💖",
      valentineAccepted: "Ура! Ти моя валентинка ✨ Я тебе дуже кохаю 💞",
      loveBackButton: "І я тебе теж кохаю"
    }
  },
  en: {
    pageTitle: "For My Love ❤️",
    badge: "Happy Valentine’s Day",
    heroTitle: "You are my favorite person 💕",
    reasonsTitle: "Why I Love You",
    bunnyShortcut: "To bunnies 🐰",
    reasons: [
      "Your smile makes my day brighter.",
      "You are my little cutie.",
      "You inspire me to be better.",
      "Everything feels special with you."
    ],
    revealHint: "Tap to reveal ✨",
    loader: {
      label: "Loading",
      steps: ["Preparing a surprise…", "Filling with hearts", "Almost ready"]
    },
    quiz: {
      progress: (current, total) => `Question ${current} of ${total}`,
      daysQuestion: "How long have we known each other?",
      colorQuestion: "What is my favorite color?",
      meetingDayQuestion: "What day did we meet?",
      loveQuestion: "Do you love me?",
      colorOptions: ["Orange", "Blue", "Purple", "Green"],
      meetingDayOptions: ["Tuesday", "Friday", "Saturday", "Monday"],
      loveOptions: [
        "Yes, so so much 💖",
        "More every single day 🫶",
        "To the moon and back 🌙",
        "Forever and endlessly 💞"
      ],
      daysCorrect: (label) => `Yes, correct! We’ve known each other for ${label} 💖`,
      almostRightPrefix: "Almost! Correct answer:",
      genericCorrect: "Yes, correct! You know us so well 💖",
      colorCorrect: "Yes, I love orange 🍊 But I love you more 💞",
      allAnswersCorrect: "And I love you in every universe, dear 💞",
      checkAnswer: "Check answer",
      nextQuestion: "Next question →",
      nextQuestionShort: "Next question",
      retry: "Try again ↺",
      unlockFourthHint: "To unlock question 4, answer the first 3 correctly 💡",
      pressMe: "press me",
      valentineQuestion: "Will you be my valentine? 💌",
      yesButton: "Yes 💖",
      valentineAccepted: "Yay! You are my valentine ✨ I love you so much 💞",
      loveBackButton: "I love you too"
    }
  },
  fn: {
    pageTitle: "Rakkaalleni ❤️",
    badge: "Hyvää ystävänpäivää",
    heroTitle: "Sinä olet rakkain ihmiseni 💕",
    reasonsTitle: "Miksi rakastan sinua",
    bunnyShortcut: "Pupuihin 🐰",
    reasons: [
      "Hymysi tekee päivästäni valoisamman.",
      "Olet minun pikku söpöläiseni.",
      "Innostat minua olemaan parempi.",
      "Kaikki tuntuu erityiseltä, kun olen kanssasi."
    ],
    revealHint: "Avaa napauttamalla ✨",
    loader: {
      label: "Ladataan",
      steps: ["Valmistelemme yllätystä…", "Täytämme sydämillä", "Melkein valmis"]
    },
    quiz: {
      progress: (current, total) => `Kysymys ${current}/${total}`,
      daysQuestion: "Kuinka kauan olemme tunteneet toisemme?",
      colorQuestion: "Mikä on lempivärini?",
      meetingDayQuestion: "Milloin tapasimme?",
      loveQuestion: "Rakastatko minua?",
      colorOptions: ["Oranssi", "Sininen", "Violetti", "Vihreä"],
      meetingDayOptions: ["Tiistai", "Perjantai", "Lauantai", "Maanantai"],
      loveOptions: [
        "Kyllä, todella paljon 💖",
        "Yhä enemmän joka päivä 🫶",
        "Kuuhun ja takaisin 🌙",
        "Loputtomasti ja aina 💞"
      ],
      daysCorrect: (label) => `Kyllä, oikein! Olemme tunteneet toisemme ${label} 💖`,
      almostRightPrefix: "Melkein! Oikea vastaus:",
      genericCorrect: "Kyllä, oikein! Tunnet meidät loistavasti 💖",
      colorCorrect: "Kyllä, pidän oranssista 🍊 Mutta rakastan sinua enemmän 💞",
      allAnswersCorrect: "Rakastan sinua kaikissa universumeissa, rakas 💞",
      checkAnswer: "Tarkista vastaus",
      nextQuestion: "Seuraava kysymys →",
      nextQuestionShort: "Seuraava kysymys",
      retry: "Yritä uudelleen ↺",
      unlockFourthHint: "Avaa 4. kysymys vastaamalla kolmeen ensimmäiseen oikein 💡",
      pressMe: "paina minua",
      valentineQuestion: "Olisitko minun ystävänpäiväni? 💌",
      yesButton: "Kyllä 💖",
      valentineAccepted: "Jes! Olethan minun ystävänpäiväni ✨ Rakastan sinua niin paljon 💞",
      loveBackButton: "Minäkin rakastan sinua"
    }
  }
};

const bunnyPhrasesByLocale = {
  ua: {
    cute: [
      "Нас не розлучити 💞",
      "Йди сюди <3",
      "Ти мій зайчик 🐰",
      "Ми ідеальна пара ✨",
      "Любовне тяжіння 💘",
      "Обіймашки, терміново 🤗",
      "Завжди поруч 💖",
      "Ти моє щастя 🌸",
      "Люблю тебе безмежно ♾️",
      "Поцілунок уже летить 😘",
      "Разом тепліше ☀️",
      "Тільки ти і я 💫",
      "Серце до серця ❤️",
      "Не відпущу тебе 🫶",
      "Давай танцювати"
    ],
    idle: [
      "Я тебе кохаю 💗",
      "Я кохаю тебе ще більше 💞",
      "Ні, я кохаю сильніше 🫶",
      "Покажи мені як 💖",
      "Йди до мене, зайчику",
      "Вже біжу 💗",
      "Ти моє серденько ❤️",
      "А ти моє щастя ✨",
      "Ми ідеальна пара",
      "Згодна на всі 100% 🌸",
      "Обіймемось? 🤗",
      "Міцно-міцно! 💘",
      "Я голодний",
      "Покусаємося?",
      "Так, будь ласка!",
      "Рааавр :3",
      "Моя Генрика 💖",
      "Мій Антон 💖",
    ]
  },
  en: {
    cute: [
      "We can’t be separated 💞",
      "Come here <3",
      "You are my bunny 🐰",
      "We’re a perfect pair ✨",
      "Love attraction 💘",
      "Hugs. Now 🤗",
      "Always by your side 💖",
      "You are my happiness 🌸",
      "I love you endlessly ♾️",
      "A kiss is on the way 😘",
      "Together is warmer ☀️",
      "Just you and me 💫",
      "Heart to heart ❤️",
      "I won’t let you go 🫶",
      "Let’s dance"
    ],
    idle: [
      "I love you 💗",
      "I love you more 💞",
      "No, I love you more 🫶",
      "Show me how 💖",
      "Come here, bunny",
      "Already running to you",
      "You are my sweetheart ❤️",
      "And you are my happiness ✨",
      "We are a perfect pair",
      "Agreed, 100% 🌸",
      "Hug time? 🤗",
      "Super tight! 💘",
      "I'm hungry",
      "Wanna bite me?",
      "Yes, please!",
      "Raaawr :3",
      "My Henrika 💖",
      "My Anton 💖"
    ]
  },
  fn: {
    cute: [
      "Meitä ei voi erottaa 💞",
      "Tule tänne <3",
      "Olet minun pupuni 🐰",
      "Olemme täydellinen pari ✨",
      "Rakkauden vetovoima 💘",
      "Tarvitsen halin nyt 🤗",
      "Aina vierelläsi 💖",
      "Olet minun onneni 🌸",
      "Rakastan sinua loputtomasti ♾️",
      "Suukko on matkalla 😘",
      "Yhdessä on lämpimämpää ☀️",
      "Vain sinä ja minä 💫",
      "Sydän sydäntä vasten ❤️",
      "En päästä sinusta irti 🫶",
      "Tanssitaan yhdessä 💃"
    ],
    idle: [
      "Rakastan sinua 💗",
      "Rakastan sinua enemmän 💞",
      "Ei, minä rakastan sinua enemmän 🫶",
      "Näytä minulle miten 💖",
      "Tule tänne, pupuni",
      "Juoksen jo luoksesi",
      "Olet rakkaani ❤️",
      "Ja sinä olet minun onneni ✨",
      "Olemme täydellinen pari",
      "Täysin samaa mieltä 🌸",
      "Halataanko? 🤗",
      "Todella tiukasti sitten! 💘",
      "Olen nälkäinen",
      "Haluatko vähän purra?",
      "Kyllä, kiitos!",
      "Raaawr :3",
      "Minun Henrikani 💖",
      "Minun Antonini 💖",
    ]
  }
};

let currentQuizIndex = 0;
let firstThreeAllCorrect = true;
let isFinalCtaMode = false;
let isBunnyEndingMode = false;
let finalCtaStep = "cta";
let heartFlowRafId = null;
let heartFlowLastFrameTs = 0;
let heartFlowAccumulatorMs = 0;
let heartFlowResetTimeout = null;
let heartFlowMultiplier = 1;
let ambientHeartFlowMultiplier = 1;
let heartFlowAccentColor = null;
let heartFlowAccentUntil = 0;
let forcedHeartColor = null;
let forcedHeartRatio = 0;
let activeHeartsCount = 0;
let isReducedMotionPreferred = false;
const hasCoarsePointer =
  typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)").matches : false;
const deviceMemoryGb = Number(navigator.deviceMemory || 0);
const hardwareThreads = Number(navigator.hardwareConcurrency || 0);
const isLikelyLowPowerDevice =
  hasCoarsePointer ||
  (deviceMemoryGb > 0 && deviceMemoryGb <= 4) ||
  (hardwareThreads > 0 && hardwareThreads <= 4);
const maxActiveHearts = hasCoarsePointer ? 52 : isLikelyLowPowerDevice ? 80 : 140;
const maxActiveHeartsReducedMotion = hasCoarsePointer ? 28 : isLikelyLowPowerDevice ? 40 : 70;
const heartFlowTickMs = hasCoarsePointer ? 420 : isLikelyLowPowerDevice ? 320 : 220;
const maxHeartsPerTick = hasCoarsePointer ? 2 : isLikelyLowPowerDevice ? 2 : 6;
const maxHeartsPerTickReducedMotion = hasCoarsePointer ? 1 : isLikelyLowPowerDevice ? 1 : 3;
let currentQuestionPayload = null;
let currentQuestionIsLast = false;
let selectedQuizOption = null;
let quizButtonMode = "hidden";
let holdToResetTimeout = null;
const holdToResetMs = 1400;
let flashSwitchTimeout = null;
let flashCleanupTimeout = null;
const bunnyReturnMs = 520;
let bunnyNameRevealTimeout = null;
let bunnyNameRestoreTimeout = null;
const bunnyOffsets = new Map();
const bunnyMotionTimers = new Map();
let activeBunnyDrag = null;
let bunnyDragRafId = null;
const bunnyDragFollowLerp = 0.38;
const bunnyDragSnapDistance = 0.5;
const bunnyDragUseDirectFollow = hasCoarsePointer;
const bunnyIdlePostponeDuringDragMinIntervalMs = 120;
let bunnyIdleInterval = null;
let bunnyIdleKickoffTimeout = null;
let bunnyIdlePhraseIndex = 0;
let bunnyIdleBunnyIndex = 0;
let bunnyIdleReadyAt = 0;
let bunnyHoverCount = 0;
const bunnyIdleCooldownMs = 5000;
const bunnySpeechSourceIdle = "idle";
const bunnySpeechSourceDrag = "drag";
let bunnySpeechSource = null;
const holdToResetPhaseIdle = "idle";
const holdToResetPhaseHolding = "holding";
const holdToResetPhaseCompleting = "completing";
let holdToResetPhase = holdToResetPhaseIdle;
const defaultMusicVolume = 0.65;
const bunnyRadioFirstTrackSrc = "audio/Cults - You and Me.mp3";
const bunnyRadioTrackSources = [
  bunnyRadioFirstTrackSrc,
  "audio/A Forest Mighty Black - Till The End.mp3",
  "audio/Arlo, fkblnde - Full Moon Eyes.mp3",
  "audio/Clams Casino - The World Needs Change.mp3",
  "audio/Crumb - Ghostride.mp3",
  "audio/Current Joys - My Blueberry Life.mp3",
  "audio/Flawed Mangoes - Riff 2.mp3",
  "audio/Hotel Ugly - I Think I Left the Stove On.mp3",
  "audio/vhs ghost - u and i.mp3",
  "audio/Zereu Genzales - Where You At.mp3"
];
const initialBackgroundTrackSrc = "audio/vhs ghost - u and i.mp3";
let activeMusicTrack = new Audio();
let currentMusicVolume = defaultMusicVolume;
let musicPausedByUser = false;
let isBunnyRadioMode = false;
let bunnyRadioQueue = [];
let bunnyRadioHistory = [];
let bunnyTrackRepeatEnabled = false;
let bunnyIdleSpeechMuted = false;
let bunnyPlayerControlsInitialized = false;
let bunnyPlayerControlsPeekTimeout = null;
const bunnyPlayerControlsPeekMs = 3000;
let holdMusicFadeFrame = null;
let holdMusicFadeStartedAt = 0;
let holdMusicFadeStartVolume = defaultMusicVolume;
let nowPlayingTrackHideTimeout = null;
let nowPlayingTrackHideTransitionTimeout = null;
let areReasonsUnlocked = reasonItems.length === 0;
let currentLocale = "en";
const bunnyShortcutStorageKey = "gift-bunny-shortcut";
let bunnyShortcutAvailable = false;

activeMusicTrack.loop = true;
activeMusicTrack.preload = "auto";
activeMusicTrack.volume = currentMusicVolume;
