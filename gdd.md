# Game Design Document: Millionaire Tycoon - Drug Wars Edition (Simplified)

## 1. Game Title

**Millionaire Tycoon: Drug Wars Edition**

## 2. Overview / Concept

"Millionaire Tycoon: Drug Wars Edition" is a single-player (or shared-screen cooperative) text-based/graphical hybrid RNG (Random Number Generator) game built with p5.js, HTML, and CSS. The player's primary goal is to accumulate a net worth of $1,000,000 by navigating one of three distinct economic paths: the illicit drug trade, the volatile stock market, or a series of gambling minigames. The game embraces a gritty, retro "Drug Wars" aesthetic across all its interfaces, providing a cohesive visual and thematic experience. The focus is on simplicity and core fun.

## 3. Core Gameplay Loop

1. **Start Game:** Player begins with a fixed amount of starting capital ($1,000) and Day 1.

2. **Path Selection:** Player chooses one of the three main paths from the central menu (Drug Wars, Stock Market, Gambling Hall).

3. **Execute Path Actions:**

   * **Drug Wars:** Buy/sell drugs in a few key cities, manage inventory, react to basic random events.

   * **Stock Market:** Buy/sell 1-2 stocks, observe simple price changes.

   * **Gambling Hall:** Play 1-2 very simple minigames (e.g., Coin Flip, Dice Roll).

4. **Advance Day:** Each significant action will advance the game day.

5. **Check Conditions:**

   * **Win Condition:** Net worth reaches $1,000,000.

   * **Loss Condition:** Net worth drops to $0, or maximum days (e.g., 30 days) are exceeded.

6. **Loop:** If game conditions not met, return to Path Selection or continue within the chosen path.

## 4. Mechanics

### 4.1. General Mechanics

* **Money & Day Tracking:** Persistent display of current money, current day, and location.

* **Game Log:** A scrolling text area for displaying important game messages, actions, and events.

* **Randomness (RNG):** Core to all aspects of the game.

* **Day System:** A finite number of days (e.g., 30 days). Each significant action consumes a day.

* **Responsive UI:** All UI elements (p5.js and HTML) will adapt to different screen sizes.

### 4.2. Path-Specific Mechanics (Simplified)

#### 4.2.1. Drug Wars Path

* **Drugs:** A smaller, focused set (e.g., Weed, Coke, Heroin).

* **Locations:** Fewer cities (e.g., 3 cities: New York, Los Angeles, Miami) with distinct price tendencies.

* **Prices:** Simple fluctuating buy/sell prices per drug/location, changing upon travel.

* **Inventory:** Very limited inventory space (e.g., 100 units total), forcing hard choices.

* **Buying/Selling:** Basic buy/sell functionality for single units or fixed quantities (e.g., 1, 10 units).

* **Travel:** Travel between cities, consuming a day and a flat travel cost.

* **Random Events (Simplified):** A few basic events only:

  * **Police:** Chance of small fine or loss of a few units of a random drug.

  * **Good Deal:** Chance for one drug's price to temporarily drop significantly.

#### 4.2.2. Stock Market Path

* **Stocks:** Only 2 fictional stocks (e.g., "MegaCorp" and "BioTech"). We can add a lot more stocks later.

* **Price Volatility:** Prices fluctuate simply (e.g., +X% or -Y% each day) based on a random factor. No complex trends or news.

* **Buying/Selling:** Simple buy/sell interface for shares (e.g., 1, 10, or max shares).

* **Day Advance:** Buying/selling or choosing to "wait a day" will advance the day.

#### 4.2.3. Gambling Hall Path

* **Minigames:**

  * **Coin Flip:** Bet money, 50/50 chance to double or lose.

  * **High-Low Dice Roll:** Roll one die (1-6). Bet whether the next roll is Higher or Lower.

* **Betting System:** Player sets bet amount.

* **Day Advance:** Each game played advances the day.

## 5. User Interface (UI) / User Experience (UX) (Simplified)

* **P5.js Centric:** All game-specific UI and interactive elements are drawn by p5.js.

* **HTML/CSS:** Used for the global page layout, static info panels, and the global game message log. Also for applying the "Drug Wars" aesthetic (neon text, dark themes).

* **Main Menu:** Clean, functional buttons for path selection and new game.

* **In-Game UI (per path):**

  * **Drug Wars:** Clear display of current location, inventory, and drug prices. Simple buttons for buy/sell actions (e.g., buy 1, sell 1) and travel options.

  * **Stock Market:** Clear display of stock names and current prices. Simple buy/sell buttons, "Advance Day" button.

  * **Gambling Hall:** Separate button for each minigame. Simple input for bet amount, "Play" button, and results display.

* **Feedback:** Essential textual feedback for all actions (e.g., "Bought 5 Weed", "$100 gained").

* **Aesthetics:** Consistent "Drug Wars" theme (neon, dark, gritty) applied via CSS and p5.js drawing. Simpler shapes and fewer complex animations.

## 6. Art Style / Theme

* **Theme:** 1980s urban underground / "Drug Wars" game aesthetic.

* **Color Palette:** Dark grays, blacks, with neon reds, blues, purples, and greens.

* **Typography:** Retro-futuristic or monospace fonts.

* **Visuals:** Simple geometric shapes for UI elements and icons. Minimal background details on the canvas beyond solid colors and basic text.

## 7. Sound / Music (To be considered later if time permits)

* **Music:** A single looping retro track.

* **Sound Effects:** Essential sounds for key actions (e.g., click, success, failure).

## 8. Technical Considerations

* **Development Environment:** HTML, CSS, JavaScript.

* **Game Engine/Library:** p5.js.

* **Responsiveness:** `windowResized()` for basic canvas and UI scaling.

* **State Management:** Global JavaScript variables or a single, simple state object.

* **Event Handling:** `mousePressed()` for all p5.js-drawn interactions.

## 11. Team Roles & Timeline

* **You (Frontend Focus):** HTML structure, overall CSS styling (Drug Wars theme), p5.js rendering of all UI elements (buttons, text, layout within canvas), responsive design. Also will do some of the backend as well.

* **Partner (Backend/Logic Focus):** Core game mechanics, random number generation, simplified price calculations, inventory logic, basic event triggers, win/loss conditions, and specific game logic for each of the three simplified paths within `sketch.js`.

* **Estimated Total Time:** 30 hours

* **Estimated Per Person:** 15 hours each

**Initial Collaboration Steps:**

1.  **HTML Setup:** Ensure the `index.html` structure is stable, serving as the container for the p5.js canvas and the static info panels.

2.  **CSS Theming:** Thinkfir will continue to refine `style.css` to solidify the "Drug Wars" visual theme globally.

3.  **P5.js UI Framework:** Thinkfir will build out the generic button drawing and click detection functions in `sketch.js`, and how different "screens" (main menu, simplified drug wars, etc.) are rendered.

4.  **Logic Integration:** As Thinkfir (me) create the UI scaffolding, my partner can begin to integrate the actual game logic, using your UI functions to display game state and respond to actions.