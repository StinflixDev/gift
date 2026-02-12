# Valentine App ❤️

A cute mini app for Valentine’s Day.

## Features

- Romantic card screen
- Love reasons section
- 4-question quiz (4 answers each)
- Question 4 unlocks only after 3/3 on the first three
- After the last question, a `Press me` button appears with a valentine flow
- Ending flow: `Will you be my valentine?` → `Yes 💖` → warm finale
- Continuous hearts stream (intensifies on interaction)
- Holding `I love you too` opens a screen with 2 dancing bunnies
- On the final bunny screen, bunnies are draggable and smoothly return to position
- Releasing one bunny over the other shows a random cute phrase
- When bunnies are idle, they alternate cute dialogue lines
- Idle phrases run only after 5 seconds without hover/drag

## Run

Open `index.html` in your browser.

## Customization

- Relationship start date: `js/state.js` → `relationshipStartDate` (currently `2024-08-20`)
- Reasons list: `index.html` → `<section class="reasons">`
- Quiz questions and answers: `js/state.js` → `quizQuestions`
- Text localization: `js/state.js` → `localeContent`
