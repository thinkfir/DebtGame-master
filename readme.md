# Money Mastermind

*"Money Mastermind"* is an engaging simulation game where your primary objective is to accumulate a fortune through strategic trading and investments. Navigate the illicit underworld of the Mafia Wars and the fluctuating values of the Stock Market to reach your financial goal within a strict time limit.

---

## URL
**URL** = 

## Game Objective

**Goal:** Reach **$500,000** within **100 days**.

---

## Game Mechanics

### Starting Conditions

- **Initial Money:** $1,000
- **Starting Day:** Day 1
- **Starting Location:** Denver (Mafia Wars section, lowest contraband volatility)

---

### 1. Mafia Wars (Contraband Trading)

Engage in the high-risk, high-reward world of contraband trading.

#### Locations & Contraband

Each city has its own unique set of contraband types available for trade:

- **New York:** Crimson Haze, Shadow Bloom, Viper Venom _(Travel Cost: $500)_
- **Los Angeles:** Starlight Shard, Viper Venom, Bliss Dust _(Travel Cost: $450)_
- **Chicago:** Bliss Dust, Iron Will Dust, Shadow Bloom _(Travel Cost: $300)_
- **Miami:** Bliss Dust, Ocean Echo, Crimson Haze _(Travel Cost: $400)_
- **Houston:** Shadow Bloom, Crimson Haze, Viper Venom _(Travel Cost: $250)_
- **Denver:** Starlight Shard, Iron Will Dust, Bliss Dust _(Travel Cost: $200)_

#### Volatility

- Contraband prices are **highly volatile**.
- **City-Dependent Volatility:** The more expensive a city's travel cost, the more volatile its contraband prices. Greater profit (or loss) potential in cities like New York compared to Denver. Price fluctuations can reach up to **$10,000** on higher-priced items.
- **Real-time Updates:** Contraband prices refresh every **15 seconds**.
- **Daily Transaction Limits:** 3 buys and 3 sells of contraband per day (reset when you advance the day).

#### Travel

- Travel between Mafia locations for a fixed, city-specific cost.
- Traveling **does not** advance the game day.
- Traveling to a new city immediately updates contraband prices and may trigger a random event.

#### Random Events (20% chance when traveling)

- **Rival Gang Ambush:** Lose money and/or have contraband confiscated.
- **Inside Tip/Good Deal:** A contraband item's price may significantly drop.
- **Unforeseen Expenses/Protection Racket:** Incur unexpected costs.

#### Inventory

- Hold a maximum of **30 units** of any single contraband type.

---

### 2. Stock Market (Investment)

Invest in various stocks across different global regions.

#### Regions & Stocks

- **Global Exchange:** AURAX, CYBRP, ENRGY, FINCO, HYGEN
- **Tech Innovations Hub:** QUANT, NEURO, DATAM, ROBOS, SPACEX
- **Emerging Markets League:** AGROX, INFRA, MINEF, TEXLA, PHARM
- **European Financial Core:** LUXOR, PRISM, VANGU, ALPHO, ZETAO
- **Asian Growth Nexus:** KRYPT, ZENIT, DYNMC, NEXUS, OMEGA
- **Latin American Ventures:** SOLAR, RAINF, HARVST, TRADE, BRIGHT

#### Volatility

- Stock prices have **uniform and lower volatility** than Mafia Wars contraband.
- Prices update **daily** (when you advance the day).

#### Dividends

- All stocks pay a fixed **5% daily dividend** based on initial purchase value (paid out when you advance the day).

#### Inventory

- Hold a maximum of **30 shares** of any single stock type.

#### Movement

- Moving between stock market regions costs **$50** and advances the game by one day.
- Cannot move regions on Day 1.

---

## Core Game Loop

- **Advance Day:** Click "Next Day" (in both Mafia Wars and Stock Market screens) to advance the game, update prices, receive dividends, and reset Mafia Wars transaction limits.
- **Game Information Sidebar:** Displays current money, day, location, and progress bars for money goal and day limit.
- **Fading Messages:** Important messages (success, error, warning, info) appear and fade at the top right.

---

## Win and Lose Conditions

- **Win:** Reach $100,000 or more before or on Day 365.
- **Lose:** Fail to reach $100,000 by the end of Day 365.

---

## How to Play

1. **Start a New Game:** From the main menu, click "Start New Game" to reset progress.
2. **Choose Your Path:** Select "Mafia Wars" or "Stock Market" to enter a trading mode.
3. **Trade:**
   - In **Mafia Wars**, buy/sell contraband based on prices, location, and travel costs.
   - In **Stock Market**, buy/sell shares, consider price changes and dividends.
4. **Manage Your Funds:** Monitor money and inventory.
5. **Advance Time:** Click "Next Day" to progress, update prices, and receive dividends.
6. **Travel:** Use "Move" or "Travel to" options to visit new markets.

---

## Technologies Used

- **p5.js:** JavaScript library for creative coding, used for drawing the game's interface and managing game logic.

---

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

