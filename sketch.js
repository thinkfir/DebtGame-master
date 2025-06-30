// Game state variables
let gameMoney = 1000;
let gameDay = 1;
let gameLocation = "Main Menu"; // Start at the main menu
let gameMessages = []; // Each message will be {text: "...", type: "...", timestamp: millis()}

// Game state management
let currentGameState = 'mainMenu'; // 'mainMenu', 'mafiaWars', 'stockMarket', 'wallet', 'moveRegion', 'buySellStock', 'winScreen', 'loseScreen'
let selectedStockSymbol = null; // Used for the 'buySellStock' state
let buySellQuantity = ""; // String for simulated text input quantity (for stocks)

// Variables for main menu buttons (their positions and sizes)
let btnMafiaWars, btnStockMarket, btnNewGame;

// Variables for Canvas-drawn game title
let gameCanvasTitle;

// Constants for fading messages
const MESSAGE_FADE_IN_DURATION = 500;   // milliseconds for messages to fade in
const MESSAGE_HOLD_DURATION = 2000;    // milliseconds for messages to stay fully opaque
const MESSAGE_FADE_OUT_DURATION = 1500; // milliseconds for messages to fade out
const MESSAGE_TOTAL_DURATION = MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION + MESSAGE_FADE_OUT_DURATION;

const MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR = 0.05; // Percentage of canvas height for message area
const MESSAGE_LINE_HEIGHT_FACTOR = 0.03; // Percentage of canvas height for each message line

// Constant for blinking effect (not currently used but kept for reference)
const BLINK_INTERVAL = 700; // milliseconds for one phase (e.g., 700ms on, 700ms off)

// --- Stock Market Variables ---
const regions = [
    { name: "Global Exchange", stocks: ["AURAX", "CYBRP", "ENRGY", "FINCO", "HYGEN"] },
    { name: "Tech Innovations Hub", stocks: ["QUANT", "NEURO", "DATAM", "ROBOS", "SPACEX"] },
    { name: "Emerging Markets League", stocks: ["AGROX", "INFRA", "MINEF", "TEXLA", "PHARM"] },
    { name: "European Financial Core", stocks: ["LUXOR", "PRISM", "VANGU", "ALPHO", "ZETAO"] },
    { name: "Asian Growth Nexus", stocks: ["KRYPT", "ZENIT", "DYNMC", "NEXUS", "OMEGA"] },
    { name: "Latin American Ventures", stocks: ["SOLAR", "RAINF", "HARVST", "TRADE", "BRIGHT"] }
];
let currentRegionIndex = 0; // Default to Global Exchange

// Stores stock data: { symbol: { price: float, prevPrice: float, volatility: float, history: [] } }
let stocksData = {};
// Player's portfolio: { symbol: { quantity: int, avgPrice: float } }
let playerPortfolio = {};

// Max inventory for stocks
const STOCK_MAX_INVENTORY = 30; // Max 30 shares per stock type

// Buttons specific to stock market screen
let btnNextDay, btnMoveRegion, btnWallet;
let stockTiles = []; // Array of objects for clickable stock tiles

// Buttons for navigation
let btnBackToStockMarket;
let btnBackToMain; // Declared globally for access

// --- Mafia Wars Variables ---
const allContrabandTypes = ['Bliss Dust', 'Shadow Bloom', 'Viper Venom', 'Crimson Haze', 'Starlight Shard', 'Iron Will Dust', 'Ocean Echo'];

const mafiaLocations = [
    { name: 'New York', contraband: ['Crimson Haze', 'Shadow Bloom', 'Viper Venom'], travelCost: 500 },
    { name: 'Los Angeles', contraband: ['Starlight Shard', 'Viper Venom', 'Bliss Dust'], travelCost: 450 },
    { name: 'Chicago', contraband: ['Bliss Dust', 'Iron Will Dust', 'Shadow Bloom'], travelCost: 300 },
    { name: 'Miami', contraband: ['Bliss Dust', 'Ocean Echo', 'Crimson Haze'], travelCost: 400 },
    { name: 'Houston', contraband: ['Shadow Bloom', 'Crimson Haze', 'Viper Venom'], travelCost: 250 },
    { name: 'Denver', contraband: ['Starlight Shard', 'Iron Will Dust', 'Bliss Dust'], travelCost: 200 }
];

let currentMafiaLocationIndex = 0; // Will be set to Denver's index in initializeMafiaWars
let mafiaContrabandPrices = {}; // { 'Bliss Dust': 20, 'Shadow Bloom': 2000, ... }
let mafiaPlayerInventory = {}; // { 'Bliss Dust': 0, 'Shadow Bloom': 5, ... }
let selectedContraband = null; // Currently selected contraband for buy/sell operations
let lastMafiaPriceUpdateTime = 0; // Timestamp for last Mafia price update
const MAFIA_PRICE_UPDATE_INTERVAL = 15000; // Update prices every 15 seconds (simulating "by minute")

// Max inventory for contraband
const MAFIA_MAX_INVENTORY_PER_ITEM = 30; // Max 30 units per contraband type

// Min and max travel costs for volatility calculation (extracted from the mafiaLocations array)
let MIN_MAFIA_TRAVEL_COST;
let MAX_MAFIA_TRAVEL_COST;


// Global variables for Mafia Wars table layout (CONSISTENTLY DEFINED HERE)
let mafiaTableX, mafiaTableY, mafiaColWidth, mafiaActionColWidth, mafiaRowHeight, mafiaBtnPadding;

// Mafia Daily Transaction Limits
const MAFIA_MAX_DAILY_TRANSACTIONS = 3;
let mafiaDailyBuys = 0;
let mafiaDailySells = 0;

// Game Goal and Day Limit
const MONEY_GOAL = 100000; // User needs to get $100,000 (changed from 1,000,000)
const DAY_LIMIT = 100;    // Within 100 days

// --- Global UI Elements ---
let btnAdvanceDayGlobal; // Global button for advancing day

// p5.js setup function - runs once when the sketch starts
function setup() {
    // Set canvas to fill the entire window
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('game-container'); // Attach canvas to the specific div

    // Initialize Min/Max Mafia Travel Costs
    MIN_MAFIA_TRAVEL_COST = Math.min(...mafiaLocations.map(loc => loc.travelCost));
    MAX_MAFIA_TRAVEL_COST = Math.max(...mafiaLocations.map(loc => loc.travelCost));

    // Initialize stock data
    initializeStocks();

    // Initialize Mafia Wars data
    initializeMafiaWars(); // Now initializes daily limits too

    // Initial game message
    addGameMessage("Welcome to Money Mastermind!");
    addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');

    // Setup title and button positions based on new full-screen canvas
    setupCanvasTitle();
    setupMainMenuButtons(); // Call once at start
    setupStockMarketButtons(); // Set up stock market specific buttons (done once as their relative position is stable)
    setupGlobalUIButtons(); // Setup global buttons
    setupMafiaWarsLayoutConstants(); // Setup Mafia Wars layout constants initially

    // Initialize the game state display (will draw the mainMenu)
    setGameState(currentGameState);
}

// p5.js draw function - runs continuously after setup()
function draw() {
    // --- RETRO THEME OVERHAUL ---
    background(10, 10, 20); // Deep black-blue CRT background

    // Draw scanlines for CRT effect
    stroke(0, 255, 100, 30);
    for (let y = 0; y < height; y += 4) {
        line(0, y, width, y);
    }
    noStroke();

    // Always draw the game title at the top
    drawCanvasTitle();

    // Depending on the current game state, draw different things
    if (currentGameState === 'mainMenu') {
        drawMainMenu();
    } else if (currentGameState === 'mafiaWars') {
        drawMafiaWarsScreen();
    } else if (currentGameState === 'stockMarket') {
        drawStockMarketScreen();
    }
    else if (currentGameState === 'wallet') {
        drawWalletScreen();
    } else if (currentGameState === 'moveRegion') {
        drawMoveRegionScreen();
    } else if (currentGameState === 'buySellStock') {
        drawBuySellStockScreen(selectedStockSymbol);
    } else if (currentGameState === 'winScreen') {
        drawWinScreen();
    } else if (currentGameState === 'loseScreen') {
        drawLoseScreen();
    }

    // Always draw game info (left) and messages (right) on top of any game screen, unless it's a win/loss screen
    if (currentGameState !== 'winScreen' && currentGameState !== 'loseScreen') {
        drawGameInfo();
        drawFadingMessages(); // Call the new fading messages function
        drawDayBar(); // Always draw the day bar
    }

    // If illegal wallet screen
    if (currentGameState === 'illegalWallet') {
        drawIllegalWalletScreen();
    }
}

function windowResized() {
    // Resize canvas to new window dimensions
    resizeCanvas(windowWidth, windowHeight);
    // Recalculate positions for all drawn elements
    setupCanvasTitle();
    setupMainMenuButtons(); // Re-calculate main menu button positions
    setupStockMarketButtons(); // Re-calculate stock market specific button positions
    setupGlobalUIButtons(); // Recalculate global button positions
    setupMafiaWarsLayoutConstants(); // Recalculate Mafia Wars layout constants
}

function mousePressed() {
    if (currentGameState === 'mainMenu') {
        if (isMouseOver(btnMafiaWars)) {
            setGameState('mafiaWars');
        } else if (isMouseOver(btnStockMarket)) {
            setGameState('stockMarket');
        }
        else if (isMouseOver(btnNewGame)) {
            resetGame();
        }
    } else if (currentGameState === 'stockMarket') {
        if (isMouseOver(btnNextDay)) { // This is the specific Stock Market "Next Day"
            advanceDay();
        } else if (isMouseOver(btnMoveRegion)) {
            setGameState('moveRegion');
        } else if (isMouseOver(btnWallet)) {
            setGameState('wallet');
        } else if (isMouseOver(btnBackToMain)) {
            setGameState('mainMenu');
        } else {
            // Check for stock tile clicks
            for (let i = 0; i < stockTiles.length; i++) {
                if (isMouseOver(stockTiles[i])) {
                    selectedStockSymbol = stockTiles[i].symbol;
                    setGameState('buySellStock');
                    buySellQuantity = ""; // Clear quantity input
                    break;
                }
            }
        }
    } else if (currentGameState === 'illegalWallet') {
        const btnBack = { x: width * 0.02, y: height * 0.92, width: width * 0.18, height: height * 0.06 };
        if (isMouseOver(btnBack)) {
            setGameState('mafiaWars');
        }
    } else if (currentGameState === 'wallet') {
        if (isMouseOver(btnBackToStockMarket)) {
            setGameState('stockMarket');
        }
    } else if (currentGameState === 'moveRegion') {
        // Handle region selection buttons
        for (let i = 0; i < regions.length; i++) {
            const regionBtn = {
                x: width / 2 - (width * 0.45) / 2,
                y: height * 0.25 + i * (height * 0.08 + height * 0.02),
                width: width * 0.45,
                height: height * 0.08,
            };
            if (isMouseOver(regionBtn)) {
                if (i !== currentRegionIndex) {
                    changeRegion(i);
                } else {
                    addGameMessage(`Already in ${regions[i].name}.`, 'warning');
                }
                break;
            }
        }
        if (isMouseOver(btnBackToStockMarket)) {
            setGameState('stockMarket');
        }
    } else if (currentGameState === 'buySellStock') {
        const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
        const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
        const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04 };
        const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04 };


        if (isMouseOver(btnBuy)) {
            buyStock(selectedStockSymbol, int(buySellQuantity));
            buySellQuantity = "";
        } else if (isMouseOver(btnSell)) {
            sellStock(selectedStockSymbol, int(buySellQuantity));
            buySellQuantity = "";
        } else if (isMouseOver(btnBackToStockMarket)) {
            setGameState('stockMarket');
        } else if (isMouseOver(btnMaxSell)) {
            buySellQuantity = (playerPortfolio[selectedStockSymbol] ? playerPortfolio[selectedStockSymbol].quantity : 0).toString();
        } else if (isMouseOver(btnMaxBuy)) {
            const stockPrice = stocksData[selectedStockSymbol].price;
            if (stockPrice > 0) {
                buySellQuantity = Math.floor(gameMoney / stockPrice).toString();
            } else {
                buySellQuantity = "0";
            }
        }
    } else if (currentGameState === 'mafiaWars') {
        // GLOBAL NEXT DAY BUTTON CHECK (now located consistently on the right side below messages)
        if (isMouseOver(btnAdvanceDayGlobal)) {
            advanceDay();
            return;
        }

        // Mafia Wars button interactions (Back to Main Menu)
        const btnBackToMainMafia = { x: width / 2 - (width * 0.2) / 2, y: height * 0.92, width: width * 0.2, height: height * 0.07 }; // Repositioned
        if (isMouseOver(btnBackToMainMafia)) {
            setGameState('mainMenu');
            return;
        }

        // Location buttons (now on a single line)
        const locBtnWidth = width * 0.13; // Further increased width for better text fit
        const locBtnHeight = height * 0.08; // Further increased height
        const locGapX = width * 0.015; // Horizontal gap
        const locY = height * 0.82; // Adjusted Y to be below buy/sell input and higher than main menu button

        // Calculate start X to center all 6 buttons on one line
        const totalLocButtonsWidth = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
        const locStartX = width / 2 - totalLocButtonsWidth / 2;

        for (let i = 0; i < mafiaLocations.length; i++) {
            const loc = mafiaLocations[i];
            const btnX = locStartX + i * (locBtnWidth + locGapX);
            const btnY = locY; // All on the same Y

            const btnRect = { x: btnX, y: btnY, width: locBtnWidth, height: locBtnHeight };
            
            if (isMouseOver(btnRect)) {
                handleTravel(loc.name); // Pass location name
                return; // Stop after handling one click
            }
        }

        // Buy/Sell buttons (quick buy/sell 1 for each row)
        // Now using the consistent global mafia table constants
        const buyBtnWidth = mafiaActionColWidth * 0.45;
        const buyBtnHeight = mafiaRowHeight * 0.4;
        const btnXOffset = mafiaTableX + mafiaColWidth * 2.5 + (mafiaActionColWidth - (buyBtnWidth * 2 + mafiaBtnPadding / 2)) / 2;

        const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband; // Get current location's contraband
        for (let i = 0; i < currentContrabandTypes.length; i++) { // Loop through current location's contraband
            const item = currentContrabandTypes[i];
            const yPos = mafiaTableY + mafiaRowHeight * (i + 1);

            const buyBtn = {
                x: btnXOffset,
                y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
                width: buyBtnWidth,
                height: buyBtnHeight
            };
            const sellBtn = {
                x: btnXOffset + buyBtnWidth + mafiaBtnPadding / 2,
                y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
                width: buyBtnWidth,
                height: buyBtnHeight
            };

            if (isMouseOver(buyBtn)) {
                selectedContraband = item; // Keep selected contraband for feedback/messages
                handleBuySellContraband(item, 'buy', 1); // Pass quantity 1 for quick buy
                selectedContraband = null; // Clear selection after action
                return;
            } else if (isMouseOver(sellBtn)) {
                selectedContraband = item; // Keep selected contraband for feedback/messages
                handleBuySellContraband(item, 'sell', 1); // Pass quantity 1 for quick sell
                selectedContraband = null; // Clear selection after action
                return;
            }
        }

        // Removed all explicit quantity buy/sell buttons and input field interaction
    } else if (currentGameState === 'winScreen' || currentGameState === 'loseScreen') {
        const playAgainBtn = {
            x: width / 2 - (width * 0.25) / 2,
            y: height * 0.75,
            width: width * 0.25,
            height: height * 0.08,
            text: 'Play Again',
            color: color(50, 180, 50)
        };
        if (isMouseOver(playAgainBtn)) {
            resetGame();
            loop(); // Resume draw loop
        }
    }
}

function keyPressed() {
    // Stock buy/sell quantity input (remains as this is for stock market)
    if (currentGameState === 'buySellStock') {
        if (keyCode === BACKSPACE) {
            buySellQuantity = buySellQuantity.substring(0, buySellQuantity.length - 1);
        } else if (key >= '0' && key <= '9' && buySellQuantity.length < 5) { // Limit input length
            buySellQuantity += key;
        }
    }
    // Removed Mafia Wars explicit quantity input handling
}

// Helper function to check if mouse is over a button
function isMouseOver(button) {
    return mouseX > button.x && mouseX < button.x + button.width &&
           mouseY > button.y && mouseY < button.y + button.height;
}

// Mafia input focus helper - now unused for the main UI but kept for general reference if re-introduced
let mafiaInputFocused = false;
function mouseReleased() {
    // This function is often used for drag-and-drop or when a click completes after mouse up.
    // For simple button clicks, mousePressed is usually sufficient.
}


// --- Canvas Title Drawing ---
function setupCanvasTitle() {
    gameCanvasTitle = {
        text: "Money Mastermind ",
        textSize: width * 0.05, // Responsive text size
        x: width / 2, // Centered title
        y: height * 0.07, // Positioned at the top
        color: color(239, 68, 68), // Red
        shadowColor: color(255, 0, 0), // Base for glow
        shadowStrength: 4 // Reduced strength for less glare
    };
}

function drawCanvasTitle() {
    // Retro neon green glow
    fill(0, 255, 120);
    textFont('monospace');
    textSize(gameCanvasTitle.textSize * 1.1);
    textAlign(CENTER, CENTER);

    // CRT glow
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 24;
    drawingContext.shadowColor = 'lime';

    text(gameCanvasTitle.text, gameCanvasTitle.x, gameCanvasTitle.y);

    // Reset shadow properties after drawing to avoid affecting other elements
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// --- Main Menu Drawing and Logic (p5.js handled) ---
function setupMainMenuButtons() {
    // Define the area where main menu elements should be drawn
    const topOffsetForTitle = gameCanvasTitle.y + gameCanvasTitle.textSize / 2 + height * 0.05; // Below title + some margin

    const usableHeightForMenu = height * 0.6; // Take up 60% of vertical space for menu
    const menuAreaYStart = (height - usableHeightForMenu) / 2 + height * 0.1; // Shift down slightly

    const buttonWidth = width * 0.45; // Adjusted width for buttons
    const buttonHeight = usableHeightForMenu * 0.12;
    const gap = usableHeightForMenu * 0.03;

    // Center the group of buttons vertically within the available menu area
    // Now there are 3 buttons: Mafia Wars, Stock Market, New Game
    const totalButtonsHeight = 3 * buttonHeight + 2 * gap; // Reduced number of buttons
    const startY = menuAreaYStart + (usableHeightForMenu - totalButtonsHeight) / 2;
    const centerX = width / 2;


    btnMafiaWars = { // Renamed from btnDrugWars
        x: centerX - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
        text: '🔪 Mafia Wars', // Changed text
        color: color(220, 50, 50) // Red
    };

    btnStockMarket = {
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + gap,
        width: buttonWidth,
        height: buttonHeight,
        text: '📈 Stock Market',
        color: color(50, 180, 50) // Green
    };

    btnNewGame = {
        x: centerX - (buttonWidth * 0.8) / 2, // Slightly narrower
        y: startY + 2 * (buttonHeight + gap) + gap * 2, // Position adjusted for 3 buttons
        width: buttonWidth * 0.8,
        height: buttonHeight * 0.7, // Slightly smaller
        text: 'Start New Game',
        color: color(80, 80, 80) // Gray
    };
}

function drawMainMenu() {
    // Retro grid overlay
    fill(0, 255, 120, 30);
    for (let x = 0; x < width; x += 40) {
        rect(x, 0, 2, height);
    }
    for (let y = 0; y < height; y += 40) {
        rect(0, y, width, 2);
    }

    // "Choose Your Path" text (retro neon)
    textFont('monospace');
    textAlign(CENTER, CENTER);
    textSize(width * 0.045);
    fill(255, 20, 200);
    drawingContext.shadowBlur = 16;
    drawingContext.shadowColor = '#ff00cc';
    text("Master Dashboard", width / 2, height * 0.30);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // "Make a Million Dollars!" subtitle (retro blue)
    textAlign(CENTER, CENTER);
    textSize(width * 0.022);
    fill(0, 255, 255);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = '#00ffff';
    text("Get Rich!", width / 2, height * 0.38);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Draw buttons
    drawButton(btnMafiaWars);
    drawButton(btnStockMarket);
    drawButton(btnNewGame);
}
    // Generic function to draw a button with enhanced styling
function drawButton(button) {
    // --- RETRO BUTTON STYLE (NO NEON TEXT) ---
    let btnColor = color(0, 255, 120); // Neon green default
    if (button.color) btnColor = button.color;

    let textColor = color(220, 230, 220); // Muted light gray-green

    // Retro darken on hover
    if (isMouseOver(button)) {
        btnColor = color(
            red(btnColor) * 0.5,
            green(btnColor) * 0.8,
            blue(btnColor) * 0.5
        );
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    // Apply button background color
    noStroke();
    fill(btnColor);

    // Pill shape with rounded corners
    const buttonRadius = button.height / 2;
    rect(button.x, button.y, button.width, button.height, buttonRadius);

    // Retro pixel font, no glow for text
    textFont('monospace');
    fill(textColor);
    noStroke(); // Ensure no stroke on text
    textSize(button.height * 0.45);
    textAlign(CENTER, CENTER);
    if (button.text !== null) {
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)';
        text(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
    noStroke();
}

// --- Global UI Buttons ---
function setupGlobalUIButtons() {
    // Position Next Day button in the top right, below messages, with more padding
    btnAdvanceDayGlobal = {
        x: width * 0.76, // To the left of message area
        y: height * 0.02 + (MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR * height) + height * 0.02, // Below messages + increased padding
        width: width * 0.15,
        height: height * 0.06,
        text: 'Next Day',
        color: color(80, 100, 150) // Blue-gray color
    };
}


// --- Mafia Wars Game Logic and Drawing ---
function initializeMafiaWars() {
    // Start in Denver as requested
    const denverIndex = mafiaLocations.findIndex(loc => loc.name === 'Denver');
    currentMafiaLocationIndex = denverIndex !== -1 ? denverIndex : 0; // Default to first if Denver not found
    
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
    
    // Initialize player inventory for ALL possible contraband types to 0
    mafiaPlayerInventory = {};
    allContrabandTypes.forEach(type => {
        mafiaPlayerInventory[type] = 0; // Initialize all contraband to 0
    });
    
    selectedContraband = null;
    mafiaInputFocused = false; // Initialize the focus state, though now unused
    lastMafiaPriceUpdateTime = millis(); // Initialize timestamp for dynamic prices

    // NEW: Initialize daily transaction counts
    mafiaDailyBuys = 0;
    mafiaDailySells = 0;
}

// NEW FUNCTION: Setup Mafia Wars Layout Constants
function setupMafiaWarsLayoutConstants() {
    // Mafia Contraband Table Layout
    mafiaTableX = width * 0.17; // Further left
    mafiaTableY = height * 0.25; // Higher up
    mafiaColWidth = width * 0.16; // Wider columns
    mafiaActionColWidth = width * 0.19; // Wider action column
    mafiaRowHeight = height * 0.09; // Shorter rows
    mafiaBtnPadding = 20; // More padding inside cells

    // Removed specific input field constants as it's no longer used
}


function generateMafiaPrices(locationName) {
    const prices = {};
    const locationObj = mafiaLocations.find(loc => loc.name === locationName);
    const contrabandForLocation = locationObj ? locationObj.contraband : [];

    const minMafiaVolatility = 0.05; // Base for lowest volatility city (Denver)
    const maxMafiaVolatility = 0.5; // Base for highest volatility city (New York)

    // Calculate effective volatility based on location's travel cost
    const travelCost = locationObj.travelCost;
    const normalizedCost = map(travelCost, MIN_MAFIA_TRAVEL_COST, MAX_MAFIA_TRAVEL_COST, 0, 1);
    // Adjust the multiplier for volatility scale for Mafia. Can be up to $10,000 for high value items.
    // For 'Crimson Haze' (base 5000-15000), a max volatility of 0.5 means 50% change.
    // To get up to 10k fluctuations, the random factor and base price need to scale.
    // Let's make the fluctuation magnitude more aggressive.
    const effectiveVolatility = map(normalizedCost, 0, 1, minMafiaVolatility, maxMafiaVolatility);


    contrabandForLocation.forEach(item => { // Only generate prices for contraband in this location
        let basePrice;
        // Base price ranges for different contraband types
        switch (item) {
            case 'Bliss Dust': basePrice = random(10, 50); break;
            case 'Shadow Bloom': basePrice = random(1000, 5000); break;
            case 'Viper Venom': basePrice = random(200, 800); break;
            case 'Crimson Haze': basePrice = random(5000, 15000); break; // Higher base for high-value contraband
            case 'Starlight Shard': basePrice = random(500, 2000); break;
            case 'Iron Will Dust': basePrice = random(150, 600); break;
            case 'Ocean Echo': basePrice = random(700, 3000); break;
            default: basePrice = random(50, 200);
        }

        // Price change based on base price and effective volatility
        // The multiplier here scales the fluctuation. Max for high-value items could be ~15000 * 0.5 * random(0.8, 2.0) = 7500 * random.
        // To ensure up to 10k, we might need a higher overall multiplier for the fluctuation.
        // Let's refine the fluctuation magnitude formula.
        // For a 15000 base, 10000 fluctuation is ~66%. If effectiveVolatility max is 0.5, we need basePrice * 0.5 * X = 10000 => X = 1.33
        // So, let's make the random range for fluctuation wider, especially for high volatility areas.
        let fluctuationFactor = map(effectiveVolatility, minMafiaVolatility, maxMafiaVolatility, 0.5, 2.0); // Less volatile cities have smaller random swings
        let priceChange = basePrice * random(-effectiveVolatility * fluctuationFactor, effectiveVolatility * fluctuationFactor);

        let finalPrice = parseFloat((basePrice + priceChange).toFixed(2));
        prices[item] = Math.max(5, finalPrice); // Ensure price doesn't go too low
    });
    addGameMessage(`Contraband prices updated in ${locationName}.`, 'info');
    return prices;
}

function handleBuySellContraband(item, type, quantity) {
    // Ensure quantity is a valid number
    quantity = int(quantity);
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return;
    }

    // Daily transaction limit checks
    if (type === 'buy') {
        if (mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS) {
            addGameMessage(`Daily buy limit (${MAFIA_MAX_DAILY_TRANSACTIONS}) reached.`, 'error');
            return;
        }
    } else { // sell
        if (mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS) {
            addGameMessage(`Daily sell limit (${MAFIA_MAX_DAILY_TRANSACTIONS}) reached.`, 'error');
            return;
        }
    }

    const price = mafiaContrabandPrices[item]; // This will be the price for the current location's item
    if (!price) { // If contraband not available in this location, prevent trade
        addGameMessage(`You cannot trade ${item} in ${mafiaLocations[currentMafiaLocationIndex].name}.`, 'error');
        return;
    }

    const cost = price * quantity;
    const currentInventory = mafiaPlayerInventory[item] || 0;

    if (type === 'buy') {
        // Check if player has enough money
        if (gameMoney < cost) {
            addGameMessage("Not enough money for that acquisition!", 'error');
            return;
        }
        // Check if buying this quantity exceeds inventory limit
        if (currentInventory + quantity > MAFIA_MAX_INVENTORY_PER_ITEM) {
            addGameMessage(`Cannot carry more than ${MAFIA_MAX_INVENTORY_PER_ITEM} units of ${item}.`, 'error');
            return;
        }

        gameMoney -= cost;
        mafiaPlayerInventory[item] += quantity;
        mafiaDailyBuys++; // Increment daily buy count
        addGameMessage(`Acquired ${quantity} ${item} for $${cost.toFixed(2)}.`, 'success');
        updateMoney(0); // Trigger display update
    } else { // sell
        // Check if player has enough contraband to sell
        if (currentInventory < quantity) {
            addGameMessage(`You don't have ${quantity} units of ${item} to offload!`, 'error');
            return;
        }

        const revenue = price * quantity;
        gameMoney += revenue;
        mafiaPlayerInventory[item] -= quantity;
        mafiaDailySells++; // Increment daily sell count
        addGameMessage(`Offloaded ${quantity} ${item} for $${revenue.toFixed(2)}.`, 'success');
        updateMoney(0); // Trigger display update
    }
}

function handleTravel(newLocationName) {
    const newLocationObj = mafiaLocations.find(loc => loc.name === newLocationName);
    if (!newLocationObj) {
        addGameMessage("Invalid location.", 'error');
        return;
    }

    const newLocationIndex = mafiaLocations.indexOf(newLocationObj);

    if (newLocationName === mafiaLocations[currentMafiaLocationIndex].name) {
        addGameMessage("You're already in this territory!", 'warning');
        return;
    }

    const travelCost = newLocationObj.travelCost;
    if (gameMoney < travelCost) {
        addGameMessage(`Not enough money to travel to ${newLocationName}! Need $${travelCost}.`, 'error');
        return;
    }

    gameMoney -= travelCost;
    currentMafiaLocationIndex = newLocationIndex; // Update the index
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name); // New prices for new location immediately on travel
    // No advanceDay() here, as travel doesn't necessarily advance a game day.
    // Day advances only through the global "Next Day" button.
    addGameMessage(`Traveled to ${newLocationName} territory for $${travelCost}.`, 'info');
    triggerMafiaRandomEvent();
}

function triggerMafiaRandomEvent() {
    const eventChance = random(100);
    if (eventChance < 20) { // 20% chance of an event
        const eventType = floor(random(1, 4)); // 1, 2, or 3
        switch (eventType) {
            case 1: // Rival Gang Ambush
                const loss = floor(random(100, 500));
                gameMoney -= loss;
                addGameMessage(`Rival gang ambush! You lost $${loss}.`, 'critical');
                // Optionally, confiscate some inventory
                if (random() < 0.5 && Object.values(mafiaPlayerInventory).some(q => q > 0)) {
                    // Filter contraband based on what's available in current location for confiscation
                    const currentContraband = mafiaLocations[currentMafiaLocationIndex].contraband;
                    const availableOwnedContraband = currentContraband.filter(type => mafiaPlayerInventory[type] > 0);
                    
                    if (availableOwnedContraband.length > 0) {
                        const randomItem = random(availableOwnedContraband);
                        const confiscatedQty = floor(random(1, Math.min(mafiaPlayerInventory[randomItem], 5) + 1));
                        mafiaPlayerInventory[randomItem] -= confiscatedQty;
                        addGameMessage(`Rival gang seized ${confiscatedQty} ${randomItem}!`, 'critical');
                    }
                }
                break;
            case 2: // Inside Tip / Good Deal
                // Select a contraband from the current location
                const goodDealItem = random(mafiaLocations[currentMafiaLocationIndex].contraband);
                const oldPrice = mafiaContrabandPrices[goodDealItem];
                const newPrice = parseFloat((oldPrice * random(0.4, 0.7)).toFixed(2)); // 40-70% of original
                mafiaContrabandPrices[goodDealItem] = Math.max(5, newPrice);
                addGameMessage(`Inside tip! ${goodDealItem} is cheap at $${mafiaContrabandPrices[goodDealItem].toFixed(2)}! (Originally $${oldPrice.toFixed(2)})`, 'success');
                break;
            case 3: // Unforeseen Expenses / Protection Racket
                const expenses = floor(random(50, 300));
                gameMoney -= expenses;
                addGameMessage(`Unforeseen expenses incurred: $${expenses}!`, 'critical');
                break;
        }
    }
}


function drawMafiaWarsScreen() {
    // --- FULL RETRO OVERHAUL FOR MAFIA WARS (NO ULTRANEON TEXT) ---
    background(12, 8, 24); // Deep retro purple-black

    // Retro title (muted)
    fill(210, 220, 180);
    textFont('Courier New');
    textSize(width * 0.045);
    textAlign(CENTER, TOP);
    text("MAFIA WARS", width / 2, height * 0.06);

    // Current Location Display (muted)
    fill(180, 200, 210);
    textFont('Courier New');
    textSize(width * 0.025);
    text(`Current Territory: ${mafiaLocations[currentMafiaLocationIndex].name}`, width / 2, height * 0.17);

    // Contraband Price and Inventory Table
    drawContrabandTable();

    // Buy/Sell Input and Buttons (now intentionally empty `drawBuySellInput` function)
    drawBuySellInput();

    // Location Travel Buttons
    drawLocationButtons();

    // Draw the global "Next Day" button
    drawButton(btnAdvanceDayGlobal);

    // Back button to main menu (lower position to not overlap global Next Day)
    const btnBackToMainMafia = {
        x: width / 2 - (width * 0.2) / 2,
        y: height * 0.92,
        width: width * 0.2,
        height: height * 0.07,
        text: 'Main Menu',
        color: color(100, 100, 100)
    };
    drawButton(btnBackToMainMafia);

    // Mafia Prices update by minute (every MAFIA_PRICE_UPDATE_INTERVAL milliseconds)
    if (millis() - lastMafiaPriceUpdateTime > MAFIA_PRICE_UPDATE_INTERVAL) {
        mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
        lastMafiaPriceUpdateTime = millis();
    }
}

function drawContrabandTable() {
    // Now using the global Mafia Wars table layout constants
    const tableX = mafiaTableX;
    const tableY = mafiaTableY;
    const colWidth = mafiaColWidth;
    const actionColWidth = mafiaActionColWidth;
    const rowHeight = mafiaRowHeight;
    const padding = mafiaBtnPadding;

    const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband; // Get contraband for current location

    // Table Header
    fill(40, 40, 40, 200); // Dark header background
    noStroke();
    rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight, 8, 8, 0, 0); // Adjusted total width for 3 data cols + 1 action col

    fill(255, 230, 0); // Gold text
    textSize(height * 0.03); // Increased text size
    textAlign(CENTER, CENTER);
    text("Contraband", tableX + colWidth * 0.5, tableY + rowHeight / 2);
    text("Price", tableX + colWidth * 1.5, tableY + rowHeight / 2);
    text("Owned", tableX + colWidth * 2.5, tableY + rowHeight / 2);
    text("Actions", tableX + colWidth * 2.5 + actionColWidth / 2, tableY + rowHeight / 2); // Center actions header

    // Table Rows
    for (let i = 0; i < currentContrabandTypes.length; i++) { // Loop through current location's contraband
        const item = currentContrabandTypes[i];
        const yPos = tableY + rowHeight * (i + 1);

        // Highlight selected row
        if (selectedContraband === item) {
            fill(60, 20, 20, 200); // Reddish highlight
        } else {
            fill(20, 20, 20, 180); // Dark row background
        }
        noStroke();
        rect(tableX, yPos, colWidth * 3 + actionColWidth, rowHeight); // Adjusted total width

        // Item Data
        fill(240); // White text
        textSize(height * 0.022); // Adjusted text size to prevent overlap
        textAlign(CENTER, CENTER);
        text(item, tableX + colWidth * 0.5, yPos + rowHeight / 2);
        text(`$${mafiaContrabandPrices[item].toFixed(2)}`, tableX + colWidth * 1.5, yPos + rowHeight / 2);
        
        // Adjust the X position for "Owned" to space it away from buy/sell
        text(mafiaPlayerInventory[item], tableX + colWidth * 2.3, yPos + rowHeight / 2);


        // Buy/Sell buttons for each row (quick buy/sell 1)
        const buyBtnWidth = actionColWidth * 0.45; // Adjusted size
        const buyBtnHeight = rowHeight * 0.4; // Adjusted size
        const btnXOffset = tableX + colWidth * 2.5 + (actionColWidth - (buyBtnWidth * 2 + padding / 2)) / 2; // Center buttons in action column
        
        // Buy button
        drawButton({
            x: btnXOffset,
            y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
            width: buyBtnWidth,
            height: buyBtnHeight,
            text: 'Buy',
            color: color(0),
            // Pass 'disabled' state based on daily limits
            disabled: mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS
        });
        // Sell button
        drawButton({
            x: btnXOffset + buyBtnWidth + padding / 2,
            y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
            width: buyBtnWidth,
            height: buyBtnHeight,
            text: 'Sell',
            color: color(0),
            // Pass 'disabled' state based on daily limits
            disabled: mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS
        });
    }

    // Border for the entire table
    noFill();
    stroke(100, 100, 100);
    strokeWeight(1);
    rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight * (currentContrabandTypes.length + 1), 8); // Adjusted total width

    // Display daily limits
    const limitDisplayX = tableX + colWidth * 3 + actionColWidth + width * 0.02; // To the right of the table
    const limitDisplayY = tableY;
    
    fill(240, 245, 250);
    textSize(height * 0.022);
    textAlign(LEFT, TOP);
    text("Daily Limits:", limitDisplayX, limitDisplayY);
    
    // Change color based on limit
    fill(mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS ? color(255, 100, 100) : color(100, 255, 100));
    text(`Buys: ${mafiaDailyBuys}/${MAFIA_MAX_DAILY_TRANSACTIONS}`, limitDisplayX, limitDisplayY + height * 0.03);
    
    fill(mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS ? color(255, 100, 100) : color(100, 255, 100));
    text(`Sells: ${mafiaDailySells}/${MAFIA_MAX_DAILY_TRANSACTIONS}`, limitDisplayX, limitDisplayY + height * 0.06);

}


function drawBuySellInput() {
    // This function is now intentionally left blank as the explicit quantity input and buttons are removed.
}


function drawLocationButtons() {
    const locBtnWidth = width * 0.13; // Adjusted width for single line, was 0.12
    const locBtnHeight = height * 0.09; // Increased height to accommodate text better
    const locGapX = width * 0.015; // Increased horizontal gap
    const locStartY = height * 0.82; // Y position for the single line of buttons

    fill(240, 245, 250);
    textSize(width * 0.018);
    textAlign(CENTER, BOTTOM);
    text("Travel to:", width / 2, locStartY - (locBtnHeight * 0.3)); // Position label above the single line of buttons

    // Calculate start X to center all 6 buttons on one line
    const totalLocButtonsWidth = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
    const locStartX = width / 2 - totalLocButtonsWidth / 2;

    for (let i = 0; i < mafiaLocations.length; i++) {
        const loc = mafiaLocations[i];
        const btnX = locStartX + i * (locBtnWidth + locGapX);
        const btnY = locStartY; // All buttons on the same Y

        let locColor = color(80, 80, 150); // Default blueish
        if (i === currentMafiaLocationIndex) { // Check against index
            locColor = color(50, 180, 50); // Green for current location
        }

        // Draw the button rectangle itself (behind the text)
        drawButton({ x: btnX, y: btnY, width: locBtnWidth, height: locBtnHeight, text: null, color: locColor });

        // Draw the city name (higher up on the button)
        fill(255); // White for city name
        textSize(locBtnHeight * 0.35); // Responsive text size for city name
        textAlign(CENTER, CENTER);
        text(loc.name, btnX + locBtnWidth / 2, btnY + locBtnHeight * 0.3); // Adjusted Y for city name

        // Overlay the travel cost (lower down on the button)
        fill(255, 230, 0); // Yellow for cost
        textSize(locBtnHeight * 0.25); // Smaller text for cost to avoid overlap
        textAlign(CENTER, CENTER);
        text(`$${loc.travelCost}`, btnX + locBtnWidth / 2, btnY + locBtnHeight * 0.7); // Adjusted Y for cost
    }
}


// --- Stock Market Functions ---

function initializeStocks() {
    for (const region of regions) {
        for (const symbol of region.stocks) {
            // Initial price generation
            const initialPrice = parseFloat((random(50, 200)).toFixed(2));
            // Dividend is now a fixed 5% of initial price
            const dividendValue = parseFloat((initialPrice * 0.05).toFixed(2)); // Changed to 5%

            // Uniform, lower volatility for all stock market regions
            const volatility = random(0.08, 0.25); // Original volatility range for stocks

            stocksData[symbol] = {
                price: initialPrice,
                prevPrice: 0, // Will be updated on first day advance
                volatility: volatility, // Using uniform volatility
                history: [], // To store price history if needed later
                dividend: dividendValue // Added fixed daily dividend
            };
        }
    }
    // Initial portfolio (empty)
    playerPortfolio = {};
}

function advanceStockPrices() {
    for (const symbol in stocksData) {
        stocksData[symbol].prevPrice = stocksData[symbol].price; // Store previous price
        let change = stocksData[symbol].price * stocksData[symbol].volatility * random(-1, 1);
        stocksData[symbol].price = parseFloat((stocksData[symbol].price + change).toFixed(2));
        // Ensure price doesn't go below a reasonable minimum
        if (stocksData[symbol].price < 1) stocksData[symbol].price = 1; // Prevent price from going to zero or negative
    }
    addGameMessage("Stock prices updated.", 'info');
}

function setupStockMarketButtons() {
    const buttonWidth = width * 0.2;
    const buttonHeight = height * 0.07;
    const gap = width * 0.01;

    // Position buttons at the bottom center
    const startX = width / 2 - (buttonWidth * 1.5 + gap); // Adjusted to center 3 buttons
    const btnY = height * 0.9;

    btnNextDay = {
        x: startX,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Next Day',
        color: color(80, 100, 150) // Blueish-gray
    };
    btnMoveRegion = {
        x: startX + buttonWidth + gap,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Move',
        color: color(90, 60, 150) // Purplish-gray
    };
    btnWallet = {
        x: startX + 2 * (buttonWidth + gap),
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Wallet',
        color: color(60, 150, 90) // Greenish-gray
    };
    // Back to Stock Market button (used in wallet/move/buy-sell)
    btnBackToStockMarket = {
        x: width / 2 - (width * 0.2) / 2, // Centered
        y: height * 0.9, // Positioned at the bottom
        width: width * 0.2,
        height: height * 0.07,
        text: 'Back',
        color: color(100, 100, 100) // Neutral gray
    };

    // Main stock market back button (to main menu)
    btnBackToMain = {
        x: width / 2 - (width * 0.2) / 2, // Centered
        y: height * 0.8, // Slightly higher to not overlap with stock market specific buttons
        width: width * 0.2,
        height: height * 0.07,
        text: 'Main Menu',
        color: color(100, 100, 100) // Neutral gray
    };
}

function drawStockMarketScreen() {
    // --- FULL RETRO THEME FOR STOCK MARKET ---
    background(10, 12, 24); // Deep retro blue-black

    // Retro region panel
    fill(30, 40, 60, 180);
    stroke(120, 255, 200, 80);
    strokeWeight(2);
    const regionPanelWidth = width * 0.6;
    const regionPanelHeight = height * 0.1;
    const regionPanelX = width / 2 - regionPanelWidth / 2;
    const regionPanelY = height * 0.15;
    rect(regionPanelX, regionPanelY, regionPanelWidth, regionPanelHeight, 16);
    noStroke();

    // Retro region name
    fill(210, 230, 200);
    textFont('Courier New');
    textSize(width * 0.03);
    textAlign(CENTER, CENTER);
    text(regions[currentRegionIndex].name, regionPanelX + regionPanelWidth / 2, regionPanelY + regionPanelHeight / 2);

    // Draw stock tiles (retro style)
    const stocksInRegion = regions[currentRegionIndex].stocks;
    const numStocks = stocksInRegion.length;
    const tileWidth = width * 0.17;
    const tileHeight = height * 0.18;
    const tileGapX = width * 0.015;
    const tileGapY = height * 0.02;

    const totalTilesWidth = numStocks * tileWidth + (numStocks - 1) * tileGapX;
    let startX = (width - totalTilesWidth) / 2;
    const startY = height * 0.3;

    stockTiles = [];

    for (let i = 0; i < numStocks; i++) {
        const symbol = stocksInRegion[i];
        const stock = stocksData[symbol];
        const tileX = startX + i * (tileWidth + tileGapX);
        const tileY = startY;

        stockTiles.push({ x: tileX, y: tileY, width: tileWidth, height: tileHeight, symbol: symbol });

        // Retro tile background
        fill(24, 32, 48, 220);
        stroke(120, 255, 200, 80);
        strokeWeight(2);
        rect(tileX, tileY, tileWidth, tileHeight, 10);
        noStroke();

        // Stock Info - Symbols (top center, retro)
        fill(210, 230, 200);
        textFont('Courier New');
        textSize(tileHeight * 0.18);
        textAlign(CENTER, TOP);
        text(symbol, tileX + tileWidth / 2, tileY + tileHeight * 0.1);

        // Current Price (middle center, retro)
        fill(255, 230, 120);
        textFont('Courier New');
        textSize(tileHeight * 0.22);
        text(`$${stock.price.toFixed(2)}`, tileX + tileWidth / 2, tileY + tileHeight * 0.45);

        // Price change indicator (bottom center, retro)
        if (stock.prevPrice !== 0) {
            const change = stock.price - stock.prevPrice;
            let changeColor;
            let arrow = '';

            if (change > 0) {
                changeColor = color(120, 255, 120);
                arrow = '▲ ';
            } else if (change < 0) {
                changeColor = color(255, 120, 120);
                arrow = '▼ ';
            } else {
                changeColor = color(180, 180, 180);
            }

            fill(changeColor);
            textFont('Courier New');
            textSize(tileHeight * 0.13);
            text(`${arrow}${abs(change).toFixed(2)}`, tileX + tileWidth / 2, tileY + tileHeight * 0.75);
        }
    }

    // Draw action buttons - using enhanced drawButton function
    drawButton(btnNextDay);
    drawButton(btnMoveRegion);
    drawButton(btnWallet);
    drawButton(btnBackToMain);
}

function drawWalletScreen() {
    background(45, 55, 70); // Darker blue-gray background for Wallet

    fill(240, 245, 250);
    textSize(width * 0.03);
    textAlign(CENTER, TOP);
    text("Your Portfolio", width / 2, height * 0.15);

    // Table design
    // Adjusted colWidth for a new 'Dividend' column
    const colWidth = width * 0.12; // Adjusted width for each column to fit 6 columns
    const tableYStart = height * 0.25;
    const rowHeight = height * 0.05;
    // Adjusted startX to center 6 columns: Symbol, Quantity, Avg. Price, Current Value, P/L, Daily Dividend
    const totalTableWidth = colWidth * 6; // 6 columns
    const startX = width / 2 - (totalTableWidth / 2);

    // Table background container
    fill(35, 45, 60, 220); // Darker, more opaque background
    stroke(80, 95, 110);
    strokeWeight(1);
    // Adjusted width of background rectangle to fit new column
    rect(startX - 10, tableYStart - rowHeight * 0.8, totalTableWidth + 20, (Object.keys(playerPortfolio).length + 1) * rowHeight + rowHeight * 0.6, 8); // Slightly rounded

    // Table headers - Adjusted positions for 6 columns
    textSize(height * 0.023); // Slightly smaller header text
    fill(255, 230, 0); // Gold-yellow for headers
    textAlign(CENTER, CENTER);
    text("Symbol", startX + colWidth * 0.5, tableYStart);
    text("Quantity", startX + colWidth * 1.5, tableYStart);
    text("Avg. Price", startX + colWidth * 2.5, tableYStart);
    text("Current Value", startX + colWidth * 3.5, tableYStart);
    text("P/L", startX + colWidth * 4.5, tableYStart);
    text("Daily Dividend", startX + colWidth * 5.5, tableYStart); // New header

    let currentY = tableYStart + rowHeight;
    let rowNumber = 0;
    for (const symbol in playerPortfolio) {
        const item = playerPortfolio[symbol];
        const currentStock = stocksData[symbol];
        if (!currentStock) continue; // Skip if stock data not found

        const currentValue = item.quantity * currentStock.price;
        const profitLoss = currentValue - (item.quantity * item.avgPrice);
        const dailyDividend = item.quantity * currentStock.dividend; // Calculate daily dividend

        // Alternating row background
        if (rowNumber % 2 === 0) {
            fill(50, 60, 75, 180); // Slightly lighter blue-gray for even rows
        } else {
            fill(45, 55, 70, 180); // Darker blue-gray for odd rows
        }
        noStroke();
        // Adjusted width of row background to fit new column
        rect(startX - 10, currentY - rowHeight * 0.5, totalTableWidth + 20, rowHeight, 0); // Draw row background

        fill(240, 245, 250); // Off-white for data text
        textSize(height * 0.018); // Smaller data text
        textAlign(CENTER, CENTER);

        text(symbol, startX + colWidth * 0.5, currentY);
        text(item.quantity, startX + colWidth * 1.5, currentY);
        text(`$${item.avgPrice.toFixed(2)}`, startX + colWidth * 2.5, currentY);
        text(`$${currentValue.toFixed(2)}`, startX + colWidth * 3.5, currentY);

        let plColor;
        if (profitLoss > 0) plColor = color(50, 220, 100);
        else if (profitLoss < 0) plColor = color(220, 80, 80);
        else plColor = color(180); // Neutral gray
        fill(plColor);
        text(`$${profitLoss.toFixed(2)}`, startX + colWidth * 4.5, currentY);

        // Display Daily Dividend
        fill(100, 255, 255); // Cyan for dividends
        text(`$${dailyDividend.toFixed(2)}`, startX + colWidth * 5.5, currentY);

        currentY += rowHeight;
        rowNumber++;
    }

    drawButton(btnBackToStockMarket); // Reusing the back button style
}

function drawIllegalWalletScreen() {
    background(30, 10, 10);
    fill(255, 230, 0);
    textSize(width * 0.035);
    textAlign(CENTER, TOP);
    text("Illegal Wallet", width / 2, height * 0.12);

    // Calculate total contraband
    let totalContraband = 0;
    for (let i = 0; i < allContrabandTypes.length; i++) { // Loop through all contraband types
        totalContraband += mafiaPlayerInventory[allContrabandTypes[i]];
    }

    // Draw capacity bar
    const barX = width * 0.2;
    const barY = height * 0.2;
    const barW = width * 0.6;
    const barH = height * 0.04;
    fill(40, 40, 40);
    rect(barX, barY, barW, barH, barH / 2);
    fill(totalContraband > 30 ? color(220, 50, 50) : color(50, 180, 50));
    const fillW = map(totalContraband, 0, 30, 0, barW, true);
    rect(barX, barY, fillW, barH, barH / 2);

    fill(255);
    textSize(width * 0.018);
    textAlign(CENTER, CENTER);
    text(`${totalContraband} / ${MAFIA_MAX_INVENTORY_PER_ITEM} contraband`, width / 2, barY + barH / 2);

    // Draw inventory table
    const tableX = width * 0.25;
    const tableY = barY + barH + height * 0.04;
    const rowH = height * 0.05;
    fill(240, 245, 250);
    textSize(width * 0.018);
    textAlign(LEFT, CENTER);
    for (let i = 0; i < allContrabandTypes.length; i++) { // Loop through all contraband types
        const y = tableY + i * rowH;
        fill(200, 200, 200);
        rect(tableX, y, width * 0.5, rowH, rowH / 2);
        fill(40, 40, 40);
        text(allContrabandTypes[i], tableX + 20, y + rowH / 2);
        textAlign(RIGHT, CENTER);
        text(mafiaPlayerInventory[allContrabandTypes[i]], tableX + width * 0.5 - 20, y + rowH / 2);
        textAlign(LEFT, CENTER);
    }

    // Back button
    const btnBack = { x: width * 0.02, y: height * 0.92, width: width * 0.18, height: height * 0.06, text: 'Back', color: color(100, 100, 100) };
    drawButton(btnBack);
}

function drawMoveRegionScreen() {
    background(45, 55, 70); // Dark blue-gray background for Move screen
    fill(240, 245, 250);
    textSize(width * 0.03);
    textAlign(CENTER, TOP);
    text("Choose a Region", width / 2, height * 0.15);

    // Draw region buttons
    const buttonWidth = width * 0.45;
    const buttonHeight = height * 0.08;
    const gap = height * 0.02; // Vertical gap

    let currentY = height * 0.25;
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const btnX = width / 2 - buttonWidth / 2;
        const btnY = currentY;

        let regionColor = color(60, 70, 85); // Darker blue-gray for unselected
        let textColor = color(240, 245, 250);
        let currentStrokeWeight = 1.5;
        let borderColor = color(100, 115, 130); // Subtle border
        let currentShadowBlur = 0;
        let shadowColor = 'rgba(0,0,0,0)';

        if (i === currentRegionIndex) {
            regionColor = color(80, 130, 100); // Muted green for selected
            textColor = color(255); // Brighter text for selected
            currentStrokeWeight = 3;
            borderColor = color(255, 230, 0); // Yellow border for selected
            currentShadowBlur = 10;
            shadowColor = color(80, 130, 100, 150); // Greenish glow for selected
        }

        if (mouseX > btnX && mouseY > btnY && mouseX < btnX + buttonWidth && mouseY < btnY + buttonHeight) {
            regionColor = lerpColor(regionColor, color(100, 115, 130), 0.2); // Lighten on hover
            currentShadowBlur = 15; // Increased glow on hover
            shadowColor = regionColor; // Glow color matches button
            cursor(HAND);
        } else {
            cursor(ARROW);
        }

        // Apply shadow
        drawingContext.shadowOffsetX = 0;
        drawingContext.shadowOffsetY = 5;
        drawingContext.shadowBlur = currentShadowBlur;
        drawingContext.shadowColor = shadowColor;

        fill(regionColor);
        noStroke(); // Ensure no stroke for these buttons
        rect(btnX, btnY, buttonWidth, buttonHeight, buttonHeight / 2); // Rounded corners

        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)'; // Reset shadow

        fill(textColor);
        textSize(buttonHeight * 0.4);
        textAlign(CENTER, CENTER);
        text(region.name, btnX + buttonWidth / 2, btnY + buttonHeight / 2);

        currentY += buttonHeight + gap;
    }

    drawButton(btnBackToStockMarket);
}

function drawBuySellStockScreen(symbol) {
    if (!symbol || !stocksData[symbol]) {
        background(0);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(32);
        text("Error: Stock not found!", width / 2, height / 2);
        drawButton(btnBackToStockMarket);
        return;
    }

    const stock = stocksData[symbol];
    const ownedQuantity = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;

    background(35, 45, 60); // Dark blue-gray background for buy/sell

    fill(240, 245, 250);
    textSize(width * 0.04);
    textAlign(CENTER, TOP);
    text(`${symbol} Stock Details`, width / 2, height * 0.15);

    // Display stock details prominently
    const detailTextSize = height * 0.035; // Larger text for details
    const detailLineSpacing = detailTextSize * 1.5;
    const detailX = width / 2;
    let detailY = height * 0.25;

    fill(255, 230, 0); // Gold-yellow for current price
    textSize(detailTextSize);
    text(`Current Price: $${stock.price.toFixed(2)}`, detailX, detailY);

    fill(200, 210, 220); // Light gray for owned quantity
    detailY += detailLineSpacing;
    text(`Owned: ${ownedQuantity}`, detailX, detailY);

    fill(255, 180, 180); // Softer red for money
    detailY += detailLineSpacing;
    text(`Your Money: $${gameMoney.toLocaleString()}`, detailX, detailY);

    // New: Display Daily Dividend of this stock
    fill(100, 255, 255); // Cyan for dividends
    detailY += detailLineSpacing;
    text(`Daily Dividend: $${stock.dividend.toFixed(2)} per share`, detailX, detailY);

    // Quantity input (simulated)
    const inputX = width / 2 - (width * 0.2) / 2;
    const inputY = height * 0.5;
    const inputWidth = width * 0.2;
    const inputHeight = height * 0.06;

    // Input field background
    fill(30, 40, 50); // Even darker grey
    stroke(100, 115, 130); // Lighter border
    strokeWeight(1);
    rect(inputX, inputY, inputWidth, inputHeight, 8); // Rounded corners

    fill(240, 245, 250);
    textSize(width * 0.02);
    textAlign(CENTER, CENTER);
    text(buySellQuantity || 'Enter Qty', inputX + inputWidth / 2, inputY + inputHeight / 2);

    // Buy / Sell / Max buttons
    const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Buy', color: color(50, 180, 50) };
    const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Sell', color: color(220, 50, 50) };
    const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };
    const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };

    drawButton(btnBuy);
    drawButton(btnSell);
    drawButton(btnMaxSell);
    drawButton(btnMaxBuy);

    drawButton(btnBackToStockMarket);
}

function buyStock(symbol, quantity) {
    // Ensure quantity is a valid number
    quantity = int(quantity);
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return;
    }

    const stock = stocksData[symbol];
    const cost = stock.price * quantity;
    const currentOwned = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;

    if (gameMoney < cost) {
        addGameMessage("Not enough money to buy!", 'error');
        return;
    }

    // Check if buying this quantity exceeds max inventory for this stock
    if (currentOwned + quantity > STOCK_MAX_INVENTORY) {
        addGameMessage(`Cannot hold more than ${STOCK_MAX_INVENTORY} shares of ${symbol}.`, 'error');
        return;
    }

    gameMoney -= cost;
    if (!playerPortfolio[symbol]) {
        playerPortfolio[symbol] = { quantity: 0, avgPrice: 0 };
    }
    // Calculate new average price
    const totalOldCost = playerPortfolio[symbol].quantity * playerPortfolio[symbol].avgPrice;
    playerPortfolio[symbol].quantity += quantity;
    playerPortfolio[symbol].avgPrice = (totalOldCost + cost) / playerPortfolio[symbol].quantity;

    addGameMessage(`Bought ${quantity} shares of ${symbol} for $${cost.toFixed(2)}.`, 'success');
    updateMoney(0); // Trigger money display update
}

function sellStock(symbol, quantity) {
    // Ensure quantity is a valid number
    quantity = int(quantity);
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return;
    }
    if (!playerPortfolio[symbol] || playerPortfolio[symbol].quantity < quantity) {
        addGameMessage("Not enough shares to sell!", 'error');
        return;
    }
    const stock = stocksData[symbol];
    const revenue = stock.price * quantity;
    gameMoney += revenue;

    playerPortfolio[symbol].quantity -= quantity;

    if (playerPortfolio[symbol].quantity === 0) {
        delete playerPortfolio[symbol]; // Remove from portfolio if quantity is zero
    }
    addGameMessage(`Sold ${quantity} shares of ${symbol} for $${revenue.toFixed(2)}.`, 'success');
    updateMoney(0); // Trigger display update
}

function changeRegion(newIndex) {
    // A small cost to move regions to add more strategy
    const moveCost = 50; // Example cost

    if (gameMoney < moveCost) {
        addGameMessage(`Not enough money to move! Requires $${moveCost}.`, 'error');
        return;
    }
    
    if (gameDay <= 1) { // Prevent moving on Day 1 (or other logic if needed)
        addGameMessage("Cannot move on Day 1.", 'warning');
        return;
    }

    if (newIndex >= 0 && newIndex < regions.length) {
        gameMoney -= moveCost; // Deduct cost
        currentRegionIndex = newIndex;
        advanceDay(); // Moving takes a day
        addGameMessage(`Moved to ${regions[currentRegionIndex].name} for $${moveCost}.`, 'info');
        setGameState('stockMarket'); // Return to stock market view
    } else {
        addGameMessage("Invalid region selected.", 'error');
    }
}


// Function to draw game parameters (Money, Day, Location) on the canvas (positioned left)
function drawGameInfo() {
    const boxWidth = width * 0.22; // Responsive width
    const boxHeight = height * 0.15; // Responsive height
    const padding = width * 0.01; // Responsive padding
    const cornerRadius = 8;

    // Position in the top LEFT corner
    const boxX = padding; // Left side
    const boxY = padding; // Top side

    // Draw background box with a subtle darker shade and a border
    fill(30, 40, 50, 200); // Darker, slightly transparent background
    stroke(80, 100, 120, 200); // Subtle blue-gray border
    strokeWeight(1.5);
    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius);

    // Inner glow for the box
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 8; // Subtle glow
    drawingContext.shadowColor = 'rgba(100, 150, 255, 0.2)'; // Blueish glow

    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius); // Redraw for shadow

    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)'; // Reset shadow

    // Text and Icons
    const iconSize = height * 0.025; // Responsive icon size
    const textBaseSize = height * 0.022; // Base responsive text size, adjusted to fit
    const lineSpacing = textBaseSize * 1.5; // Adjusted line spacing

    fill(255); // White text
    textAlign(LEFT, CENTER); // Center text vertically within its line

    // Text shadow for readability on text
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 3;
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';


    let currentTextY = boxY + padding + textBaseSize * 0.8; // Start point for first line (using boxY for consistent padding)

    // Money
    textSize(textBaseSize);
    text('💰', boxX + padding, currentTextY); // Icon
    text(`Money: $${gameMoney.toLocaleString()}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing;

    // Day
    textSize(textBaseSize);
    text('🗓️', boxX + padding, currentTextY); // Icon
    text(`Day: ${gameDay}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing;

    // Location
    textSize(textBaseSize);
    text('📍', boxX + padding, currentTextY); // Icon
    text(`Location: ${gameLocation}`, boxX + padding + iconSize + 5, currentTextY);

    // Reset shadow
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}

// Function to draw game messages on the canvas (positioned right, smaller, sleek, fading)
function drawFadingMessages() {
    const messageAreaRightEdge = width * 0.98; // Closer to right edge
    const messageAreaTop = height * 0.02; // Start from top, slightly below canvas top
    const messageLineHeight = height * MESSAGE_LINE_HEIGHT_FACTOR; // Responsive line height

    textSize(height * 0.02); // Responsive text size for messages
    textAlign(RIGHT, TOP); // Align text to the right

    // Filter out messages that have completed their full fade cycle
    gameMessages = gameMessages.filter(msg => {
        const elapsedTime = millis() - msg.timestamp;
        // Keep message if its total duration has not passed
        return elapsedTime < MESSAGE_TOTAL_DURATION;
    });

    // Draw active messages, stacking upwards from the bottom of the message area
    // Determine the Y position for the newest message, and then stack upwards.
    let currentY = messageAreaTop + (MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR * height) - messageLineHeight; // Start at the "bottom" of the display area for newest message

    // Text shadow for readability on text
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 2; // Subtle shadow
    drawingContext.shadowColor = 'rgba(0,0,0,0.7)';


    for (let i = gameMessages.length - 1; i >= 0; i--) { // Loop from newest to oldest
        const msg = gameMessages[i];
        const elapsedTime = millis() - msg.timestamp;
        let opacity;

        if (elapsedTime < MESSAGE_FADE_IN_DURATION) {
            // Fading in
            opacity = map(elapsedTime, 0, MESSAGE_FADE_IN_DURATION, 0, 255);
        } else if (elapsedTime < MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION) {
            // Fully visible
            opacity = 255;
        } else {
            // Fading out
            const fadeOutTime = elapsedTime - (MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION);
            opacity = map(fadeOutTime, 0, MESSAGE_FADE_OUT_DURATION, 255, 0);
        }

        let textColor;
        // Define colors for message types, applying the current opacity
        if (msg.type === 'success') textColor = color(72, 187, 120, opacity); // Green
        else if (msg.type === 'error') textColor = color(239, 68, 68, opacity); // Red
        else if (msg.type === 'warning') textColor = color(246, 173, 85, opacity); // Orange
        else textColor = color(226, 232, 240, opacity); // Light gray (info)

        fill(textColor);
        text(msg.text, messageAreaRightEdge, currentY); // Draw text aligned right
        currentY -= messageLineHeight; // Move up for the next older message

        if (currentY < messageAreaTop) { // Stop drawing if out of allocated message area
            break;
        }
    }
    // Reset shadow
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// --- Utility Functions ---
function addGameMessage(message, type = 'info') {
    // Add new message with current time. Opacity will be calculated by drawFadingMessages.
    gameMessages.push({ text: message, type: type, timestamp: millis() });
}

// Function to change the game state (which screen is active)
function setGameState(newState) {
    currentGameState = newState;
    if (newState === 'mainMenu') {
        gameLocation = "Main Menu";
        addGameMessage("Returned to main menu.");
    } else if (newState === 'stockMarket') {
        gameLocation = regions[currentRegionIndex].name;
        addGameMessage(`Entering ${gameLocation}...`, 'info');
    } else if (newState === 'wallet') {
        addGameMessage("Viewing your portfolio.", 'info');
    } else if (newState === 'moveRegion') {
        addGameMessage("Choosing new market region.", 'info');
    } else if (newState === 'buySellStock') {
        addGameMessage(`Trading ${selectedStockSymbol}.`, 'info');
    } else if (newState === 'mafiaWars') {
        gameLocation = mafiaLocations[currentMafiaLocationIndex].name; // Set location to current Mafia location
        addGameMessage("You've entered the Mafia underworld!", 'info');
        lastMafiaPriceUpdateTime = millis(); // Reset price update timer when entering Mafia Wars
    }
    else {
        // Generic messages for other states if needed
        gameLocation = newState; // Placeholder
        addGameMessage(`Entering ${newState}...`, 'info');
    }
}

// Function to reset the game to its initial state
function resetGame() {
    gameMoney = 1000;
    gameDay = 1;
    gameLocation = "Main Menu";
    gameMessages = []; // Clear all messages immediately on reset
    initializeStocks(); // Re-initialize stock prices and clear portfolio
    playerPortfolio = {};
    initializeMafiaWars(); // Reset Mafia Wars state (includes daily transaction limits)

    addGameMessage("Game reset. Welcome back!");
    addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');
    setGameState('mainMenu'); // Go back to main menu
}

// Example functions for game progress
function advanceDay() {
    gameDay++;
    // Reset daily buy/sell counts for Mafia Wars
    mafiaDailyBuys = 0;
    mafiaDailySells = 0;

    // Apply dividends from owned stocks
    let totalDividends = 0;
    for (const symbol in playerPortfolio) {
        const ownedStock = playerPortfolio[symbol];
        const stockData = stocksData[symbol];
        if (ownedStock && stockData) {
            totalDividends += ownedStock.quantity * stockData.dividend;
        }
    }
    if (totalDividends > 0) {
        gameMoney += totalDividends;
        addGameMessage(`Received $${totalDividends.toFixed(2)} in dividends!`, 'success');
    }

    if (currentGameState === 'stockMarket') {
        advanceStockPrices(); // Update stock prices when day advances if in stock market
    }
    // Mafia Wars price update is now time-based, not day-based.

    addGameMessage(`Advanced to Day ${gameDay}.`);

    // Check for game end condition
    if (gameMoney >= MONEY_GOAL) {
        addGameMessage(`Congratulations! You reached $${MONEY_GOAL.toLocaleString()} in ${gameDay} days! You win!`, 'success');
        setGameState('winScreen');
        noLoop(); // Stop the game loop
    } else if (gameDay >= DAY_LIMIT) {
        addGameMessage(`Time's up! You did not reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days. Game Over!`, 'error');
        setGameState('loseScreen');
        noLoop(); // Stop the game loop
    }
}

function updateMoney(amount) {
    gameMoney += amount;// Game state variables
let gameMoney = 1000;
let gameDay = 1;
let gameLocation = "Main Menu"; // Start at the main menu
let gameMessages = []; // Each message will be {text: "...", type: "...", timestamp: millis()}

// Game state management
let currentGameState = 'mainMenu'; // 'mainMenu', 'mafiaWars', 'stockMarket', 'wallet', 'moveRegion', 'buySellStock', 'winScreen', 'loseScreen'
let selectedStockSymbol = null; // Used for the 'buySellStock' state
let buySellQuantity = ""; // String for simulated text input quantity (for stocks)

// Variables for main menu buttons (their positions and sizes)
let btnMafiaWars, btnStockMarket, btnNewGame;

// Variables for Canvas-drawn game title
let gameCanvasTitle;

// Constants for fading messages
const MESSAGE_FADE_IN_DURATION = 500;   // milliseconds for messages to fade in
const MESSAGE_HOLD_DURATION = 2000;    // milliseconds for messages to stay fully opaque
const MESSAGE_FADE_OUT_DURATION = 1500; // milliseconds for messages to fade out
const MESSAGE_TOTAL_DURATION = MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION + MESSAGE_FADE_OUT_DURATION;

const MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR = 0.05; // Percentage of canvas height for message area
const MESSAGE_LINE_HEIGHT_FACTOR = 0.03; // Percentage of canvas height for each message line

// Constant for blinking effect (not currently used but kept for reference)
const BLINK_INTERVAL = 700; // milliseconds for one phase (e.g., 700ms on, 700ms off)

// --- Stock Market Variables ---
const regions = [
    { name: "Global Exchange", stocks: ["AURAX", "CYBRP", "ENRGY", "FINCO", "HYGEN"] },
    { name: "Tech Innovations Hub", stocks: ["QUANT", "NEURO", "DATAM", "ROBOS", "SPACEX"] },
    { name: "Emerging Markets League", stocks: ["AGROX", "INFRA", "MINEF", "TEXLA", "PHARM"] },
    { name: "European Financial Core", stocks: ["LUXOR", "PRISM", "VANGU", "ALPHO", "ZETAO"] },
    { name: "Asian Growth Nexus", stocks: ["KRYPT", "ZENIT", "DYNMC", "NEXUS", "OMEGA"] },
    { name: "Latin American Ventures", stocks: ["SOLAR", "RAINF", "HARVST", "TRADE", "BRIGHT"] }
];
let currentRegionIndex = 0; // Default to Global Exchange

// Stores stock data: { symbol: { price: float, prevPrice: float, volatility: float, history: [] } }
let stocksData = {};
// Player's portfolio: { symbol: { quantity: int, avgPrice: float } }
let playerPortfolio = {};

// Max inventory for stocks
const STOCK_MAX_INVENTORY = 30; // Max 30 shares per stock type

// Buttons specific to stock market screen
let btnNextDay, btnMoveRegion, btnWallet;
let stockTiles = []; // Array of objects for clickable stock tiles

// Buttons for navigation
let btnBackToStockMarket;
let btnBackToMain; // Declared globally for access

// --- Mafia Wars Variables ---
const allContrabandTypes = ['Bliss Dust', 'Shadow Bloom', 'Viper Venom', 'Crimson Haze', 'Starlight Shard', 'Iron Will Dust', 'Ocean Echo'];

const mafiaLocations = [
    { name: 'New York', contraband: ['Crimson Haze', 'Shadow Bloom', 'Viper Venom'], travelCost: 500 },
    { name: 'Los Angeles', contraband: ['Starlight Shard', 'Viper Venom', 'Bliss Dust'], travelCost: 450 },
    { name: 'Chicago', contraband: ['Bliss Dust', 'Iron Will Dust', 'Shadow Bloom'], travelCost: 300 },
    { name: 'Miami', contraband: ['Bliss Dust', 'Ocean Echo', 'Crimson Haze'], travelCost: 400 },
    { name: 'Houston', contraband: ['Shadow Bloom', 'Crimson Haze', 'Viper Venom'], travelCost: 250 },
    { name: 'Denver', contraband: ['Starlight Shard', 'Iron Will Dust', 'Bliss Dust'], travelCost: 200 }
];

let currentMafiaLocationIndex = 0; // Will be set to Denver's index in initializeMafiaWars
let mafiaContrabandPrices = {}; // { 'Bliss Dust': 20, 'Shadow Bloom': 2000, ... }
let mafiaPlayerInventory = {}; // { 'Bliss Dust': 0, 'Shadow Bloom': 5, ... }
let selectedContraband = null; // Currently selected contraband for buy/sell operations
let lastMafiaPriceUpdateTime = 0; // Timestamp for last Mafia price update
const MAFIA_PRICE_UPDATE_INTERVAL = 15000; // Update prices every 15 seconds (simulating "by minute")

// Max inventory for contraband
const MAFIA_MAX_INVENTORY_PER_ITEM = 30; // Max 30 units per contraband type

// Min and max travel costs for volatility calculation (extracted from the mafiaLocations array)
let MIN_MAFIA_TRAVEL_COST;
let MAX_MAFIA_TRAVEL_COST;


// Global variables for Mafia Wars table layout (CONSISTENTLY DEFINED HERE)
let mafiaTableX, mafiaTableY, mafiaColWidth, mafiaActionColWidth, mafiaRowHeight, mafiaBtnPadding;

// Mafia Daily Transaction Limits
const MAFIA_MAX_DAILY_TRANSACTIONS = 3;
let mafiaDailyBuys = 0;
let mafiaDailySells = 0;

// Game Goal and Day Limit
const MONEY_GOAL = 100000; // User needs to get $100,000 (changed from 1,000,000)
const DAY_LIMIT = 100;    // Within 100 days

// --- Global UI Elements ---
let btnAdvanceDayGlobal; // Global button for advancing day

// p5.js setup function - runs once when the sketch starts
function setup() {
    // Set canvas to fill the entire window
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('game-container'); // Attach canvas to the specific div

    // Initialize Min/Max Mafia Travel Costs
    MIN_MAFIA_TRAVEL_COST = Math.min(...mafiaLocations.map(loc => loc.travelCost));
    MAX_MAFIA_TRAVEL_COST = Math.max(...mafiaLocations.map(loc => loc.travelCost));

    // Initialize stock data
    initializeStocks();

    // Initialize Mafia Wars data
    initializeMafiaWars(); // Now initializes daily limits too

    // Initial game message
    addGameMessage("Welcome to Money Mastermind!");
    addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');

    // Setup title and button positions based on new full-screen canvas
    setupCanvasTitle();
    setupMainMenuButtons(); // Call once at start
    setupStockMarketButtons(); // Set up stock market specific buttons (done once as their relative position is stable)
    setupGlobalUIButtons(); // Setup global buttons
    setupMafiaWarsLayoutConstants(); // Setup Mafia Wars layout constants initially

    // Initialize the game state display (will draw the mainMenu)
    setGameState(currentGameState);
}

// p5.js draw function - runs continuously after setup()
function draw() {
    // --- RETRO THEME OVERHAUL ---
    background(10, 10, 20); // Deep black-blue CRT background

    // Draw scanlines for CRT effect
    stroke(0, 255, 100, 30);
    for (let y = 0; y < height; y += 4) {
        line(0, y, width, y);
    }
    noStroke();

    // Always draw the game title at the top
    drawCanvasTitle();

    // Depending on the current game state, draw different things
    if (currentGameState === 'mainMenu') {
        drawMainMenu();
    } else if (currentGameState === 'mafiaWars') {
        drawMafiaWarsScreen();
    } else if (currentGameState === 'stockMarket') {
        drawStockMarketScreen();
    }
    else if (currentGameState === 'wallet') {
        drawWalletScreen();
    } else if (currentGameState === 'moveRegion') {
        drawMoveRegionScreen();
    } else if (currentGameState === 'buySellStock') {
        drawBuySellStockScreen(selectedStockSymbol);
    } else if (currentGameState === 'winScreen') {
        drawWinScreen();
    } else if (currentGameState === 'loseScreen') {
        drawLoseScreen();
    }

    // Always draw game info (left) and messages (right) on top of any game screen, unless it's a win/loss screen
    if (currentGameState !== 'winScreen' && currentGameState !== 'loseScreen') {
        drawGameInfo();
        drawFadingMessages(); // Call the new fading messages function
        drawDayBar(); // Always draw the day bar
    }

    // If illegal wallet screen
    if (currentGameState === 'illegalWallet') {
        drawIllegalWalletScreen();
    }
}

function windowResized() {
    // Resize canvas to new window dimensions
    resizeCanvas(windowWidth, windowHeight);
    // Recalculate positions for all drawn elements
    setupCanvasTitle();
    setupMainMenuButtons(); // Re-calculate main menu button positions
    setupStockMarketButtons(); // Re-calculate stock market specific button positions
    setupGlobalUIButtons(); // Recalculate global button positions
    setupMafiaWarsLayoutConstants(); // Recalculate Mafia Wars layout constants
}

function mousePressed() {
    if (currentGameState === 'mainMenu') {
        if (isMouseOver(btnMafiaWars)) {
            setGameState('mafiaWars');
        } else if (isMouseOver(btnStockMarket)) {
            setGameState('stockMarket');
        }
        else if (isMouseOver(btnNewGame)) {
            resetGame();
        }
    } else if (currentGameState === 'stockMarket') {
        if (isMouseOver(btnNextDay)) { // This is the specific Stock Market "Next Day"
            advanceDay();
        } else if (isMouseOver(btnMoveRegion)) {
            setGameState('moveRegion');
        } else if (isMouseOver(btnWallet)) {
            setGameState('wallet');
        } else if (isMouseOver(btnBackToMain)) {
            setGameState('mainMenu');
        } else {
            // Check for stock tile clicks
            for (let i = 0; i < stockTiles.length; i++) {
                if (isMouseOver(stockTiles[i])) {
                    selectedStockSymbol = stockTiles[i].symbol;
                    setGameState('buySellStock');
                    buySellQuantity = ""; // Clear quantity input
                    break;
                }
            }
        }
    } else if (currentGameState === 'illegalWallet') {
        const btnBack = { x: width * 0.02, y: height * 0.92, width: width * 0.18, height: height * 0.06 };
        if (isMouseOver(btnBack)) {
            setGameState('mafiaWars');
        }
    } else if (currentGameState === 'wallet') {
        if (isMouseOver(btnBackToStockMarket)) {
            setGameState('stockMarket');
        }
    } else if (currentGameState === 'moveRegion') {
        // Handle region selection buttons
        for (let i = 0; i < regions.length; i++) {
            const regionBtn = {
                x: width / 2 - (width * 0.45) / 2,
                y: height * 0.25 + i * (height * 0.08 + height * 0.02),
                width: width * 0.45,
                height: height * 0.08,
            };
            if (isMouseOver(regionBtn)) {
                if (i !== currentRegionIndex) {
                    changeRegion(i);
                } else {
                    addGameMessage(`Already in ${regions[i].name}.`, 'warning');
                }
                break;
            }
        }
        if (isMouseOver(btnBackToStockMarket)) {
            setGameState('stockMarket');
        }
    } else if (currentGameState === 'buySellStock') {
        const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
        const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
        const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04 };
        const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04 };


        if (isMouseOver(btnBuy)) {
            buyStock(selectedStockSymbol, int(buySellQuantity));
            buySellQuantity = "";
        } else if (isMouseOver(btnSell)) {
            sellStock(selectedStockSymbol, int(buySellQuantity));
            buySellQuantity = "";
        } else if (isMouseOver(btnBackToStockMarket)) {
            setGameState('stockMarket');
        } else if (isMouseOver(btnMaxSell)) {
            buySellQuantity = (playerPortfolio[selectedStockSymbol] ? playerPortfolio[selectedStockSymbol].quantity : 0).toString();
        } else if (isMouseOver(btnMaxBuy)) {
            const stockPrice = stocksData[selectedStockSymbol].price;
            if (stockPrice > 0) {
                buySellQuantity = Math.floor(gameMoney / stockPrice).toString();
            } else {
                buySellQuantity = "0";
            }
        }
    } else if (currentGameState === 'mafiaWars') {
        // GLOBAL NEXT DAY BUTTON CHECK (now located consistently on the right side below messages)
        if (isMouseOver(btnAdvanceDayGlobal)) {
            advanceDay();
            return;
        }

        // Mafia Wars button interactions (Back to Main Menu)
        const btnBackToMainMafia = { x: width / 2 - (width * 0.2) / 2, y: height * 0.92, width: width * 0.2, height: height * 0.07 }; // Repositioned
        if (isMouseOver(btnBackToMainMafia)) {
            setGameState('mainMenu');
            return;
        }

        // Location buttons (now on a single line)
        const locBtnWidth = width * 0.13; // Further increased width for better text fit
        const locBtnHeight = height * 0.08; // Further increased height
        const locGapX = width * 0.015; // Horizontal gap
        const locY = height * 0.82; // Adjusted Y to be below buy/sell input and higher than main menu button

        // Calculate start X to center all 6 buttons on one line
        const totalLocButtonsWidth = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
        const locStartX = width / 2 - totalLocButtonsWidth / 2;

        for (let i = 0; i < mafiaLocations.length; i++) {
            const loc = mafiaLocations[i];
            const btnX = locStartX + i * (locBtnWidth + locGapX);
            const btnY = locY; // All on the same Y

            const btnRect = { x: btnX, y: btnY, width: locBtnWidth, height: locBtnHeight };
            
            if (isMouseOver(btnRect)) {
                handleTravel(loc.name); // Pass location name
                return; // Stop after handling one click
            }
        }

        // Buy/Sell buttons (quick buy/sell 1 for each row)
        // Now using the consistent global mafia table constants
        const buyBtnWidth = mafiaActionColWidth * 0.45;
        const buyBtnHeight = mafiaRowHeight * 0.4;
        const btnXOffset = mafiaTableX + mafiaColWidth * 2.5 + (mafiaActionColWidth - (buyBtnWidth * 2 + mafiaBtnPadding / 2)) / 2;

        const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband; // Get current location's contraband
        for (let i = 0; i < currentContrabandTypes.length; i++) { // Loop through current location's contraband
            const item = currentContrabandTypes[i];
            const yPos = mafiaTableY + mafiaRowHeight * (i + 1);

            const buyBtn = {
                x: btnXOffset,
                y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
                width: buyBtnWidth,
                height: buyBtnHeight
            };
            const sellBtn = {
                x: btnXOffset + buyBtnWidth + mafiaBtnPadding / 2,
                y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
                width: buyBtnWidth,
                height: buyBtnHeight
            };

            if (isMouseOver(buyBtn)) {
                selectedContraband = item; // Keep selected contraband for feedback/messages
                handleBuySellContraband(item, 'buy', 1); // Pass quantity 1 for quick buy
                selectedContraband = null; // Clear selection after action
                return;
            } else if (isMouseOver(sellBtn)) {
                selectedContraband = item; // Keep selected contraband for feedback/messages
                handleBuySellContraband(item, 'sell', 1); // Pass quantity 1 for quick sell
                selectedContraband = null; // Clear selection after action
                return;
            }
        }

        // Removed all explicit quantity buy/sell buttons and input field interaction
    } else if (currentGameState === 'winScreen' || currentGameState === 'loseScreen') {
        const playAgainBtn = {
            x: width / 2 - (width * 0.25) / 2,
            y: height * 0.75,
            width: width * 0.25,
            height: height * 0.08,
            text: 'Play Again',
            color: color(50, 180, 50)
        };
        if (isMouseOver(playAgainBtn)) {
            resetGame();
            loop(); // Resume draw loop
        }
    }
}

function keyPressed() {
    // Stock buy/sell quantity input (remains as this is for stock market)
    if (currentGameState === 'buySellStock') {
        if (keyCode === BACKSPACE) {
            buySellQuantity = buySellQuantity.substring(0, buySellQuantity.length - 1);
        } else if (key >= '0' && key <= '9' && buySellQuantity.length < 5) { // Limit input length
            buySellQuantity += key;
        }
    }
    // Removed Mafia Wars explicit quantity input handling
}

// Helper function to check if mouse is over a button
function isMouseOver(button) {
    return mouseX > button.x && mouseX < button.x + button.width &&
           mouseY > button.y && mouseY < button.y + button.height;
}

// Mafia input focus helper - now unused for the main UI but kept for general reference if re-introduced
let mafiaInputFocused = false;
function mouseReleased() {
    // This function is often used for drag-and-drop or when a click completes after mouse up.
    // For simple button clicks, mousePressed is usually sufficient.
}


// --- Canvas Title Drawing ---
function setupCanvasTitle() {
    gameCanvasTitle = {
        text: "Money Mastermind ",
        textSize: width * 0.05, // Responsive text size
        x: width / 2, // Centered title
        y: height * 0.07, // Positioned at the top
        color: color(239, 68, 68), // Red
        shadowColor: color(255, 0, 0), // Base for glow
        shadowStrength: 4 // Reduced strength for less glare
    };
}

function drawCanvasTitle() {
    // Retro neon green glow
    fill(0, 255, 120);
    textFont('monospace');
    textSize(gameCanvasTitle.textSize * 1.1);
    textAlign(CENTER, CENTER);

    // CRT glow
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 24;
    drawingContext.shadowColor = 'lime';

    text(gameCanvasTitle.text, gameCanvasTitle.x, gameCanvasTitle.y);

    // Reset shadow properties after drawing to avoid affecting other elements
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// --- Main Menu Drawing and Logic (p5.js handled) ---
function setupMainMenuButtons() {
    // Define the area where main menu elements should be drawn
    const topOffsetForTitle = gameCanvasTitle.y + gameCanvasTitle.textSize / 2 + height * 0.05; // Below title + some margin

    const usableHeightForMenu = height * 0.6; // Take up 60% of vertical space for menu
    const menuAreaYStart = (height - usableHeightForMenu) / 2 + height * 0.1; // Shift down slightly

    const buttonWidth = width * 0.45; // Adjusted width for buttons
    const buttonHeight = usableHeightForMenu * 0.12;
    const gap = usableHeightForMenu * 0.03;

    // Center the group of buttons vertically within the available menu area
    // Now there are 3 buttons: Mafia Wars, Stock Market, New Game
    const totalButtonsHeight = 3 * buttonHeight + 2 * gap; // Reduced number of buttons
    const startY = menuAreaYStart + (usableHeightForMenu - totalButtonsHeight) / 2;
    const centerX = width / 2;


    btnMafiaWars = { // Renamed from btnDrugWars
        x: centerX - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
        text: '🔪 Mafia Wars', // Changed text
        color: color(220, 50, 50) // Red
    };

    btnStockMarket = {
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + gap,
        width: buttonWidth,
        height: buttonHeight,
        text: '📈 Stock Market',
        color: color(50, 180, 50) // Green
    };

    btnNewGame = {
        x: centerX - (buttonWidth * 0.8) / 2, // Slightly narrower
        y: startY + 2 * (buttonHeight + gap) + gap * 2, // Position adjusted for 3 buttons
        width: buttonWidth * 0.8,
        height: buttonHeight * 0.7, // Slightly smaller
        text: 'Start New Game',
        color: color(80, 80, 80) // Gray
    };
}

function drawMainMenu() {
    // Retro grid overlay
    fill(0, 255, 120, 30);
    for (let x = 0; x < width; x += 40) {
        rect(x, 0, 2, height);
    }
    for (let y = 0; y < height; y += 40) {
        rect(0, y, width, 2);
    }

    // "Choose Your Path" text (retro neon)
    textFont('monospace');
    textAlign(CENTER, CENTER);
    textSize(width * 0.045);
    fill(255, 20, 200);
    drawingContext.shadowBlur = 16;
    drawingContext.shadowColor = '#ff00cc';
    text("Master Dashboard", width / 2, height * 0.30);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // "Make a Million Dollars!" subtitle (retro blue)
    textAlign(CENTER, CENTER);
    textSize(width * 0.022);
    fill(0, 255, 255);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = '#00ffff';
    text("Get Rich!", width / 2, height * 0.38);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Draw buttons
    drawButton(btnMafiaWars);
    drawButton(btnStockMarket);
    drawButton(btnNewGame);
}
    // Generic function to draw a button with enhanced styling
function drawButton(button) {
    // --- RETRO BUTTON STYLE (NO NEON TEXT) ---
    let btnColor = color(0, 255, 120); // Neon green default
    if (button.color) btnColor = button.color;

    let textColor = color(220, 230, 220); // Muted light gray-green

    // Retro darken on hover
    if (isMouseOver(button)) {
        btnColor = color(
            red(btnColor) * 0.5,
            green(btnColor) * 0.8,
            blue(btnColor) * 0.5
        );
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    // Apply button background color
    noStroke();
    fill(btnColor);

    // Pill shape with rounded corners
    const buttonRadius = button.height / 2;
    rect(button.x, button.y, button.width, button.height, buttonRadius);

    // Retro pixel font, no glow for text
    textFont('monospace');
    fill(textColor);
    noStroke(); // Ensure no stroke on text
    textSize(button.height * 0.45);
    textAlign(CENTER, CENTER);
    if (button.text !== null) {
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)';
        text(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
    noStroke();
}

// --- Global UI Buttons ---
function setupGlobalUIButtons() {
    // Position Next Day button in the top right, below messages, with more padding
    btnAdvanceDayGlobal = {
        x: width * 0.76, // To the left of message area
        y: height * 0.02 + (MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR * height) + height * 0.02, // Below messages + increased padding
        width: width * 0.15,
        height: height * 0.06,
        text: 'Next Day',
        color: color(80, 100, 150) // Blue-gray color
    };
}


// --- Mafia Wars Game Logic and Drawing ---
function initializeMafiaWars() {
    // Start in Denver as requested
    const denverIndex = mafiaLocations.findIndex(loc => loc.name === 'Denver');
    currentMafiaLocationIndex = denverIndex !== -1 ? denverIndex : 0; // Default to first if Denver not found
    
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
    
    // Initialize player inventory for ALL possible contraband types to 0
    mafiaPlayerInventory = {};
    allContrabandTypes.forEach(type => {
        mafiaPlayerInventory[type] = 0; // Initialize all contraband to 0
    });
    
    selectedContraband = null;
    mafiaInputFocused = false; // Initialize the focus state, though now unused
    lastMafiaPriceUpdateTime = millis(); // Initialize timestamp for dynamic prices

    // NEW: Initialize daily transaction counts
    mafiaDailyBuys = 0;
    mafiaDailySells = 0;
}

// NEW FUNCTION: Setup Mafia Wars Layout Constants
function setupMafiaWarsLayoutConstants() {
    // Mafia Contraband Table Layout
    mafiaTableX = width * 0.17; // Further left
    mafiaTableY = height * 0.25; // Higher up
    mafiaColWidth = width * 0.16; // Wider columns
    mafiaActionColWidth = width * 0.19; // Wider action column
    mafiaRowHeight = height * 0.09; // Shorter rows
    mafiaBtnPadding = 20; // More padding inside cells

    // Removed specific input field constants as it's no longer used
}


function generateMafiaPrices(locationName) {
    const prices = {};
    const locationObj = mafiaLocations.find(loc => loc.name === locationName);
    const contrabandForLocation = locationObj ? locationObj.contraband : [];

    const minMafiaVolatility = 0.05; // Base for lowest volatility city (Denver)
    const maxMafiaVolatility = 0.5; // Base for highest volatility city (New York)

    // Calculate effective volatility based on location's travel cost
    const travelCost = locationObj.travelCost;
    const normalizedCost = map(travelCost, MIN_MAFIA_TRAVEL_COST, MAX_MAFIA_TRAVEL_COST, 0, 1);
    // Adjust the multiplier for volatility scale for Mafia. Can be up to $10,000 for high value items.
    // For 'Crimson Haze' (base 5000-15000), a max volatility of 0.5 means 50% change.
    // To get up to 10k fluctuations, the random factor and base price need to scale.
    // Let's make the fluctuation magnitude more aggressive.
    const effectiveVolatility = map(normalizedCost, 0, 1, minMafiaVolatility, maxMafiaVolatility);


    contrabandForLocation.forEach(item => { // Only generate prices for contraband in this location
        let basePrice;
        // Base price ranges for different contraband types
        switch (item) {
            case 'Bliss Dust': basePrice = random(10, 50); break;
            case 'Shadow Bloom': basePrice = random(1000, 5000); break;
            case 'Viper Venom': basePrice = random(200, 800); break;
            case 'Crimson Haze': basePrice = random(5000, 15000); break; // Higher base for high-value contraband
            case 'Starlight Shard': basePrice = random(500, 2000); break;
            case 'Iron Will Dust': basePrice = random(150, 600); break;
            case 'Ocean Echo': basePrice = random(700, 3000); break;
            default: basePrice = random(50, 200);
        }

        // Price change based on base price and effective volatility
        // The multiplier here scales the fluctuation. Max for high-value items could be ~15000 * 0.5 * random(0.8, 2.0) = 7500 * random.
        // To ensure up to 10k, we might need a higher overall multiplier for the fluctuation.
        // Let's refine the fluctuation magnitude formula.
        // For a 15000 base, 10000 fluctuation is ~66%. If effectiveVolatility max is 0.5, we need basePrice * 0.5 * X = 10000 => X = 1.33
        // So, let's make the random range for fluctuation wider, especially for high volatility areas.
        let fluctuationFactor = map(effectiveVolatility, minMafiaVolatility, maxMafiaVolatility, 0.5, 2.0); // Less volatile cities have smaller random swings
        let priceChange = basePrice * random(-effectiveVolatility * fluctuationFactor, effectiveVolatility * fluctuationFactor);

        let finalPrice = parseFloat((basePrice + priceChange).toFixed(2));
        prices[item] = Math.max(5, finalPrice); // Ensure price doesn't go too low
    });
    addGameMessage(`Contraband prices updated in ${locationName}.`, 'info');
    return prices;
}

function handleBuySellContraband(item, type, quantity) {
    // Ensure quantity is a valid number
    quantity = int(quantity);
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return;
    }

    // Daily transaction limit checks
    if (type === 'buy') {
        if (mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS) {
            addGameMessage(`Daily buy limit (${MAFIA_MAX_DAILY_TRANSACTIONS}) reached.`, 'error');
            return;
        }
    } else { // sell
        if (mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS) {
            addGameMessage(`Daily sell limit (${MAFIA_MAX_DAILY_TRANSACTIONS}) reached.`, 'error');
            return;
        }
    }

    const price = mafiaContrabandPrices[item]; // This will be the price for the current location's item
    if (!price) { // If contraband not available in this location, prevent trade
        addGameMessage(`You cannot trade ${item} in ${mafiaLocations[currentMafiaLocationIndex].name}.`, 'error');
        return;
    }

    const cost = price * quantity;
    const currentInventory = mafiaPlayerInventory[item] || 0;

    if (type === 'buy') {
        // Check if player has enough money
        if (gameMoney < cost) {
            addGameMessage("Not enough money for that acquisition!", 'error');
            return;
        }
        // Check if buying this quantity exceeds inventory limit
        if (currentInventory + quantity > MAFIA_MAX_INVENTORY_PER_ITEM) {
            addGameMessage(`Cannot carry more than ${MAFIA_MAX_INVENTORY_PER_ITEM} units of ${item}.`, 'error');
            return;
        }

        gameMoney -= cost;
        mafiaPlayerInventory[item] += quantity;
        mafiaDailyBuys++; // Increment daily buy count
        addGameMessage(`Acquired ${quantity} ${item} for $${cost.toFixed(2)}.`, 'success');
        updateMoney(0); // Trigger display update
    } else { // sell
        // Check if player has enough contraband to sell
        if (currentInventory < quantity) {
            addGameMessage(`You don't have ${quantity} units of ${item} to offload!`, 'error');
            return;
        }

        const revenue = price * quantity;
        gameMoney += revenue;
        mafiaPlayerInventory[item] -= quantity;
        mafiaDailySells++; // Increment daily sell count
        addGameMessage(`Offloaded ${quantity} ${item} for $${revenue.toFixed(2)}.`, 'success');
        updateMoney(0); // Trigger display update
    }
}

function handleTravel(newLocationName) {
    const newLocationObj = mafiaLocations.find(loc => loc.name === newLocationName);
    if (!newLocationObj) {
        addGameMessage("Invalid location.", 'error');
        return;
    }

    const newLocationIndex = mafiaLocations.indexOf(newLocationObj);

    if (newLocationName === mafiaLocations[currentMafiaLocationIndex].name) {
        addGameMessage("You're already in this territory!", 'warning');
        return;
    }

    const travelCost = newLocationObj.travelCost;
    if (gameMoney < travelCost) {
        addGameMessage(`Not enough money to travel to ${newLocationName}! Need $${travelCost}.`, 'error');
        return;
    }

    gameMoney -= travelCost;
    currentMafiaLocationIndex = newLocationIndex; // Update the index
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name); // New prices for new location immediately on travel
    // No advanceDay() here, as travel doesn't necessarily advance a game day.
    // Day advances only through the global "Next Day" button.
    addGameMessage(`Traveled to ${newLocationName} territory for $${travelCost}.`, 'info');
    triggerMafiaRandomEvent();
}

function triggerMafiaRandomEvent() {
    const eventChance = random(100);
    if (eventChance < 20) { // 20% chance of an event
        const eventType = floor(random(1, 4)); // 1, 2, or 3
        switch (eventType) {
            case 1: // Rival Gang Ambush
                const loss = floor(random(100, 500));
                gameMoney -= loss;
                addGameMessage(`Rival gang ambush! You lost $${loss}.`, 'critical');
                // Optionally, confiscate some inventory
                if (random() < 0.5 && Object.values(mafiaPlayerInventory).some(q => q > 0)) {
                    // Filter contraband based on what's available in current location for confiscation
                    const currentContraband = mafiaLocations[currentMafiaLocationIndex].contraband;
                    const availableOwnedContraband = currentContraband.filter(type => mafiaPlayerInventory[type] > 0);
                    
                    if (availableOwnedContraband.length > 0) {
                        const randomItem = random(availableOwnedContraband);
                        const confiscatedQty = floor(random(1, Math.min(mafiaPlayerInventory[randomItem], 5) + 1));
                        mafiaPlayerInventory[randomItem] -= confiscatedQty;
                        addGameMessage(`Rival gang seized ${confiscatedQty} ${randomItem}!`, 'critical');
                    }
                }
                break;
            case 2: // Inside Tip / Good Deal
                // Select a contraband from the current location
                const goodDealItem = random(mafiaLocations[currentMafiaLocationIndex].contraband);
                const oldPrice = mafiaContrabandPrices[goodDealItem];
                const newPrice = parseFloat((oldPrice * random(0.4, 0.7)).toFixed(2)); // 40-70% of original
                mafiaContrabandPrices[goodDealItem] = Math.max(5, newPrice);
                addGameMessage(`Inside tip! ${goodDealItem} is cheap at $${mafiaContrabandPrices[goodDealItem].toFixed(2)}! (Originally $${oldPrice.toFixed(2)})`, 'success');
                break;
            case 3: // Unforeseen Expenses / Protection Racket
                const expenses = floor(random(50, 300));
                gameMoney -= expenses;
                addGameMessage(`Unforeseen expenses incurred: $${expenses}!`, 'critical');
                break;
        }
    }
}


function drawMafiaWarsScreen() {
    // --- FULL RETRO OVERHAUL FOR MAFIA WARS (NO ULTRANEON TEXT) ---
    background(12, 8, 24); // Deep retro purple-black

    // Retro title (muted)
    fill(210, 220, 180);
    textFont('Courier New');
    textSize(width * 0.045);
    textAlign(CENTER, TOP);
    text("MAFIA WARS", width / 2, height * 0.06);

    // Current Location Display (muted)
    fill(180, 200, 210);
    textFont('Courier New');
    textSize(width * 0.025);
    text(`Current Territory: ${mafiaLocations[currentMafiaLocationIndex].name}`, width / 2, height * 0.17);

    // Contraband Price and Inventory Table
    drawContrabandTable();

    // Buy/Sell Input and Buttons (now intentionally empty `drawBuySellInput` function)
    drawBuySellInput();

    // Location Travel Buttons
    drawLocationButtons();

    // Draw the global "Next Day" button
    drawButton(btnAdvanceDayGlobal);

    // Back button to main menu (lower position to not overlap global Next Day)
    const btnBackToMainMafia = {
        x: width / 2 - (width * 0.2) / 2,
        y: height * 0.92,
        width: width * 0.2,
        height: height * 0.07,
        text: 'Main Menu',
        color: color(100, 100, 100)
    };
    drawButton(btnBackToMainMafia);

    // Mafia Prices update by minute (every MAFIA_PRICE_UPDATE_INTERVAL milliseconds)
    if (millis() - lastMafiaPriceUpdateTime > MAFIA_PRICE_UPDATE_INTERVAL) {
        mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
        lastMafiaPriceUpdateTime = millis();
    }
}

function drawContrabandTable() {
    // Now using the global Mafia Wars table layout constants
    const tableX = mafiaTableX;
    const tableY = mafiaTableY;
    const colWidth = mafiaColWidth;
    const actionColWidth = mafiaActionColWidth;
    const rowHeight = mafiaRowHeight;
    const padding = mafiaBtnPadding;

    const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband; // Get contraband for current location

    // Table Header
    fill(40, 40, 40, 200); // Dark header background
    noStroke();
    rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight, 8, 8, 0, 0); // Adjusted total width for 3 data cols + 1 action col

    fill(255, 230, 0); // Gold text
    textSize(height * 0.03); // Increased text size
    textAlign(CENTER, CENTER);
    text("Contraband", tableX + colWidth * 0.5, tableY + rowHeight / 2);
    text("Price", tableX + colWidth * 1.5, tableY + rowHeight / 2);
    text("Owned", tableX + colWidth * 2.5, tableY + rowHeight / 2);
    text("Actions", tableX + colWidth * 2.5 + actionColWidth / 2, tableY + rowHeight / 2); // Center actions header

    // Table Rows
    for (let i = 0; i < currentContrabandTypes.length; i++) { // Loop through current location's contraband
        const item = currentContrabandTypes[i];
        const yPos = tableY + rowHeight * (i + 1);

        // Highlight selected row
        if (selectedContraband === item) {
            fill(60, 20, 20, 200); // Reddish highlight
        } else {
            fill(20, 20, 20, 180); // Dark row background
        }
        noStroke();
        rect(tableX, yPos, colWidth * 3 + actionColWidth, rowHeight); // Adjusted total width

        // Item Data
        fill(240); // White text
        textSize(height * 0.022); // Adjusted text size to prevent overlap
        textAlign(CENTER, CENTER);
        text(item, tableX + colWidth * 0.5, yPos + rowHeight / 2);
        text(`$${mafiaContrabandPrices[item].toFixed(2)}`, tableX + colWidth * 1.5, yPos + rowHeight / 2);
        
        // Adjust the X position for "Owned" to space it away from buy/sell
        text(mafiaPlayerInventory[item], tableX + colWidth * 2.3, yPos + rowHeight / 2);


        // Buy/Sell buttons for each row (quick buy/sell 1)
        const buyBtnWidth = actionColWidth * 0.45; // Adjusted size
        const buyBtnHeight = rowHeight * 0.4; // Adjusted size
        const btnXOffset = tableX + colWidth * 2.5 + (actionColWidth - (buyBtnWidth * 2 + padding / 2)) / 2; // Center buttons in action column
        
        // Buy button
        drawButton({
            x: btnXOffset,
            y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
            width: buyBtnWidth,
            height: buyBtnHeight,
            text: 'Buy',
            color: color(0),
            // Pass 'disabled' state based on daily limits
            disabled: mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS
        });
        // Sell button
        drawButton({
            x: btnXOffset + buyBtnWidth + padding / 2,
            y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
            width: buyBtnWidth,
            height: buyBtnHeight,
            text: 'Sell',
            color: color(0),
            // Pass 'disabled' state based on daily limits
            disabled: mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS
        });
    }

    // Border for the entire table
    noFill();
    stroke(100, 100, 100);
    strokeWeight(1);
    rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight * (currentContrabandTypes.length + 1), 8); // Adjusted total width

    // Display daily limits
    const limitDisplayX = tableX + colWidth * 3 + actionColWidth + width * 0.02; // To the right of the table
    const limitDisplayY = tableY;
    
    fill(240, 245, 250);
    textSize(height * 0.022);
    textAlign(LEFT, TOP);
    text("Daily Limits:", limitDisplayX, limitDisplayY);
    
    // Change color based on limit
    fill(mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS ? color(255, 100, 100) : color(100, 255, 100));
    text(`Buys: ${mafiaDailyBuys}/${MAFIA_MAX_DAILY_TRANSACTIONS}`, limitDisplayX, limitDisplayY + height * 0.03);
    
    fill(mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS ? color(255, 100, 100) : color(100, 255, 100));
    text(`Sells: ${mafiaDailySells}/${MAFIA_MAX_DAILY_TRANSACTIONS}`, limitDisplayX, limitDisplayY + height * 0.06);

}


function drawBuySellInput() {
    // This function is now intentionally left blank as the explicit quantity input and buttons are removed.
}


function drawLocationButtons() {
    const locBtnWidth = width * 0.13; // Adjusted width for single line, was 0.12
    const locBtnHeight = height * 0.09; // Increased height to accommodate text better
    const locGapX = width * 0.015; // Increased horizontal gap
    const locStartY = height * 0.82; // Y position for the single line of buttons

    fill(240, 245, 250);
    textSize(width * 0.018);
    textAlign(CENTER, BOTTOM);
    text("Travel to:", width / 2, locStartY - (locBtnHeight * 0.3)); // Position label above the single line of buttons

    // Calculate start X to center all 6 buttons on one line
    const totalLocButtonsWidth = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
    const locStartX = width / 2 - totalLocButtonsWidth / 2;

    for (let i = 0; i < mafiaLocations.length; i++) {
        const loc = mafiaLocations[i];
        const btnX = locStartX + i * (locBtnWidth + locGapX);
        const btnY = locStartY; // All buttons on the same Y

        let locColor = color(80, 80, 150); // Default blueish
        if (i === currentMafiaLocationIndex) { // Check against index
            locColor = color(50, 180, 50); // Green for current location
        }

        // Draw the button rectangle itself (behind the text)
        drawButton({ x: btnX, y: btnY, width: locBtnWidth, height: locBtnHeight, text: null, color: locColor });

        // Draw the city name (higher up on the button)
        fill(255); // White for city name
        textSize(locBtnHeight * 0.35); // Responsive text size for city name
        textAlign(CENTER, CENTER);
        text(loc.name, btnX + locBtnWidth / 2, btnY + locBtnHeight * 0.3); // Adjusted Y for city name

        // Overlay the travel cost (lower down on the button)
        fill(255, 230, 0); // Yellow for cost
        textSize(locBtnHeight * 0.25); // Smaller text for cost to avoid overlap
        textAlign(CENTER, CENTER);
        text(`$${loc.travelCost}`, btnX + locBtnWidth / 2, btnY + locBtnHeight * 0.7); // Adjusted Y for cost
    }
}


// --- Stock Market Functions ---

function initializeStocks() {
    for (const region of regions) {
        for (const symbol of region.stocks) {
            // Initial price generation
            const initialPrice = parseFloat((random(50, 200)).toFixed(2));
            // Dividend is now a fixed 5% of initial price
            const dividendValue = parseFloat((initialPrice * 0.05).toFixed(2)); // Changed to 5%

            // Uniform, lower volatility for all stock market regions
            const volatility = random(0.08, 0.25); // Original volatility range for stocks

            stocksData[symbol] = {
                price: initialPrice,
                prevPrice: 0, // Will be updated on first day advance
                volatility: volatility, // Using uniform volatility
                history: [], // To store price history if needed later
                dividend: dividendValue // Added fixed daily dividend
            };
        }
    }
    // Initial portfolio (empty)
    playerPortfolio = {};
}

function advanceStockPrices() {
    for (const symbol in stocksData) {
        stocksData[symbol].prevPrice = stocksData[symbol].price; // Store previous price
        let change = stocksData[symbol].price * stocksData[symbol].volatility * random(-1, 1);
        stocksData[symbol].price = parseFloat((stocksData[symbol].price + change).toFixed(2));
        // Ensure price doesn't go below a reasonable minimum
        if (stocksData[symbol].price < 1) stocksData[symbol].price = 1; // Prevent price from going to zero or negative
    }
    addGameMessage("Stock prices updated.", 'info');
}

function setupStockMarketButtons() {
    const buttonWidth = width * 0.2;
    const buttonHeight = height * 0.07;
    const gap = width * 0.01;

    // Position buttons at the bottom center
    const startX = width / 2 - (buttonWidth * 1.5 + gap); // Adjusted to center 3 buttons
    const btnY = height * 0.9;

    btnNextDay = {
        x: startX,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Next Day',
        color: color(80, 100, 150) // Blueish-gray
    };
    btnMoveRegion = {
        x: startX + buttonWidth + gap,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Move',
        color: color(90, 60, 150) // Purplish-gray
    };
    btnWallet = {
        x: startX + 2 * (buttonWidth + gap),
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Wallet',
        color: color(60, 150, 90) // Greenish-gray
    };
    // Back to Stock Market button (used in wallet/move/buy-sell)
    btnBackToStockMarket = {
        x: width / 2 - (width * 0.2) / 2, // Centered
        y: height * 0.9, // Positioned at the bottom
        width: width * 0.2,
        height: height * 0.07,
        text: 'Back',
        color: color(100, 100, 100) // Neutral gray
    };

    // Main stock market back button (to main menu)
    btnBackToMain = {
        x: width / 2 - (width * 0.2) / 2, // Centered
        y: height * 0.8, // Slightly higher to not overlap with stock market specific buttons
        width: width * 0.2,
        height: height * 0.07,
        text: 'Main Menu',
        color: color(100, 100, 100) // Neutral gray
    };
}

function drawStockMarketScreen() {
    // --- FULL RETRO THEME FOR STOCK MARKET ---
    background(10, 12, 24); // Deep retro blue-black

    // Retro region panel
    fill(30, 40, 60, 180);
    stroke(120, 255, 200, 80);
    strokeWeight(2);
    const regionPanelWidth = width * 0.6;
    const regionPanelHeight = height * 0.1;
    const regionPanelX = width / 2 - regionPanelWidth / 2;
    const regionPanelY = height * 0.15;
    rect(regionPanelX, regionPanelY, regionPanelWidth, regionPanelHeight, 16);
    noStroke();

    // Retro region name
    fill(210, 230, 200);
    textFont('Courier New');
    textSize(width * 0.03);
    textAlign(CENTER, CENTER);
    text(regions[currentRegionIndex].name, regionPanelX + regionPanelWidth / 2, regionPanelY + regionPanelHeight / 2);

    // Draw stock tiles (retro style)
    const stocksInRegion = regions[currentRegionIndex].stocks;
    const numStocks = stocksInRegion.length;
    const tileWidth = width * 0.17;
    const tileHeight = height * 0.18;
    const tileGapX = width * 0.015;
    const tileGapY = height * 0.02;

    const totalTilesWidth = numStocks * tileWidth + (numStocks - 1) * tileGapX;
    let startX = (width - totalTilesWidth) / 2;
    const startY = height * 0.3;

    stockTiles = [];

    for (let i = 0; i < numStocks; i++) {
        const symbol = stocksInRegion[i];
        const stock = stocksData[symbol];
        const tileX = startX + i * (tileWidth + tileGapX);
        const tileY = startY;

        stockTiles.push({ x: tileX, y: tileY, width: tileWidth, height: tileHeight, symbol: symbol });

        // Retro tile background
        fill(24, 32, 48, 220);
        stroke(120, 255, 200, 80);
        strokeWeight(2);
        rect(tileX, tileY, tileWidth, tileHeight, 10);
        noStroke();

        // Stock Info - Symbols (top center, retro)
        fill(210, 230, 200);
        textFont('Courier New');
        textSize(tileHeight * 0.18);
        textAlign(CENTER, TOP);
        text(symbol, tileX + tileWidth / 2, tileY + tileHeight * 0.1);

        // Current Price (middle center, retro)
        fill(255, 230, 120);
        textFont('Courier New');
        textSize(tileHeight * 0.22);
        text(`$${stock.price.toFixed(2)}`, tileX + tileWidth / 2, tileY + tileHeight * 0.45);

        // Price change indicator (bottom center, retro)
        if (stock.prevPrice !== 0) {
            const change = stock.price - stock.prevPrice;
            let changeColor;
            let arrow = '';

            if (change > 0) {
                changeColor = color(120, 255, 120);
                arrow = '▲ ';
            } else if (change < 0) {
                changeColor = color(255, 120, 120);
                arrow = '▼ ';
            } else {
                changeColor = color(180, 180, 180);
            }

            fill(changeColor);
            textFont('Courier New');
            textSize(tileHeight * 0.13);
            text(`${arrow}${abs(change).toFixed(2)}`, tileX + tileWidth / 2, tileY + tileHeight * 0.75);
        }
    }

    // Draw action buttons - using enhanced drawButton function
    drawButton(btnNextDay);
    drawButton(btnMoveRegion);
    drawButton(btnWallet);
    drawButton(btnBackToMain);
}

function drawWalletScreen() {
    background(45, 55, 70); // Darker blue-gray background for Wallet

    fill(240, 245, 250);
    textSize(width * 0.03);
    textAlign(CENTER, TOP);
    text("Your Portfolio", width / 2, height * 0.15);

    // Table design
    // Adjusted colWidth for a new 'Dividend' column
    const colWidth = width * 0.12; // Adjusted width for each column to fit 6 columns
    const tableYStart = height * 0.25;
    const rowHeight = height * 0.05;
    // Adjusted startX to center 6 columns: Symbol, Quantity, Avg. Price, Current Value, P/L, Daily Dividend
    const totalTableWidth = colWidth * 6; // 6 columns
    const startX = width / 2 - (totalTableWidth / 2);

    // Table background container
    fill(35, 45, 60, 220); // Darker, more opaque background
    stroke(80, 95, 110);
    strokeWeight(1);
    // Adjusted width of background rectangle to fit new column
    rect(startX - 10, tableYStart - rowHeight * 0.8, totalTableWidth + 20, (Object.keys(playerPortfolio).length + 1) * rowHeight + rowHeight * 0.6, 8); // Slightly rounded

    // Table headers - Adjusted positions for 6 columns
    textSize(height * 0.023); // Slightly smaller header text
    fill(255, 230, 0); // Gold-yellow for headers
    textAlign(CENTER, CENTER);
    text("Symbol", startX + colWidth * 0.5, tableYStart);
    text("Quantity", startX + colWidth * 1.5, tableYStart);
    text("Avg. Price", startX + colWidth * 2.5, tableYStart);
    text("Current Value", startX + colWidth * 3.5, tableYStart);
    text("P/L", startX + colWidth * 4.5, tableYStart);
    text("Daily Dividend", startX + colWidth * 5.5, tableYStart); // New header

    let currentY = tableYStart + rowHeight;
    let rowNumber = 0;
    for (const symbol in playerPortfolio) {
        const item = playerPortfolio[symbol];
        const currentStock = stocksData[symbol];
        if (!currentStock) continue; // Skip if stock data not found

        const currentValue = item.quantity * currentStock.price;
        const profitLoss = currentValue - (item.quantity * item.avgPrice);
        const dailyDividend = item.quantity * currentStock.dividend; // Calculate daily dividend

        // Alternating row background
        if (rowNumber % 2 === 0) {
            fill(50, 60, 75, 180); // Slightly lighter blue-gray for even rows
        } else {
            fill(45, 55, 70, 180); // Darker blue-gray for odd rows
        }
        noStroke();
        // Adjusted width of row background to fit new column
        rect(startX - 10, currentY - rowHeight * 0.5, totalTableWidth + 20, rowHeight, 0); // Draw row background

        fill(240, 245, 250); // Off-white for data text
        textSize(height * 0.018); // Smaller data text
        textAlign(CENTER, CENTER);

        text(symbol, startX + colWidth * 0.5, currentY);
        text(item.quantity, startX + colWidth * 1.5, currentY);
        text(`$${item.avgPrice.toFixed(2)}`, startX + colWidth * 2.5, currentY);
        text(`$${currentValue.toFixed(2)}`, startX + colWidth * 3.5, currentY);

        let plColor;
        if (profitLoss > 0) plColor = color(50, 220, 100);
        else if (profitLoss < 0) plColor = color(220, 80, 80);
        else plColor = color(180); // Neutral gray
        fill(plColor);
        text(`$${profitLoss.toFixed(2)}`, startX + colWidth * 4.5, currentY);

        // Display Daily Dividend
        fill(100, 255, 255); // Cyan for dividends
        text(`$${dailyDividend.toFixed(2)}`, startX + colWidth * 5.5, currentY);

        currentY += rowHeight;
        rowNumber++;
    }

    drawButton(btnBackToStockMarket); // Reusing the back button style
}

function drawIllegalWalletScreen() {
    background(30, 10, 10);
    fill(255, 230, 0);
    textSize(width * 0.035);
    textAlign(CENTER, TOP);
    text("Illegal Wallet", width / 2, height * 0.12);

    // Calculate total contraband
    let totalContraband = 0;
    for (let i = 0; i < allContrabandTypes.length; i++) { // Loop through all contraband types
        totalContraband += mafiaPlayerInventory[allContrabandTypes[i]];
    }

    // Draw capacity bar
    const barX = width * 0.2;
    const barY = height * 0.2;
    const barW = width * 0.6;
    const barH = height * 0.04;
    fill(40, 40, 40);
    rect(barX, barY, barW, barH, barH / 2);
    fill(totalContraband > 30 ? color(220, 50, 50) : color(50, 180, 50));
    const fillW = map(totalContraband, 0, 30, 0, barW, true);
    rect(barX, barY, fillW, barH, barH / 2);

    fill(255);
    textSize(width * 0.018);
    textAlign(CENTER, CENTER);
    text(`${totalContraband} / ${MAFIA_MAX_INVENTORY_PER_ITEM} contraband`, width / 2, barY + barH / 2);

    // Draw inventory table
    const tableX = width * 0.25;
    const tableY = barY + barH + height * 0.04;
    const rowH = height * 0.05;
    fill(240, 245, 250);
    textSize(width * 0.018);
    textAlign(LEFT, CENTER);
    for (let i = 0; i < allContrabandTypes.length; i++) { // Loop through all contraband types
        const y = tableY + i * rowH;
        fill(200, 200, 200);
        rect(tableX, y, width * 0.5, rowH, rowH / 2);
        fill(40, 40, 40);
        text(allContrabandTypes[i], tableX + 20, y + rowH / 2);
        textAlign(RIGHT, CENTER);
        text(mafiaPlayerInventory[allContrabandTypes[i]], tableX + width * 0.5 - 20, y + rowH / 2);
        textAlign(LEFT, CENTER);
    }

    // Back button
    const btnBack = { x: width * 0.02, y: height * 0.92, width: width * 0.18, height: height * 0.06, text: 'Back', color: color(100, 100, 100) };
    drawButton(btnBack);
}

function drawMoveRegionScreen() {
    background(45, 55, 70); // Dark blue-gray background for Move screen
    fill(240, 245, 250);
    textSize(width * 0.03);
    textAlign(CENTER, TOP);
    text("Choose a Region", width / 2, height * 0.15);

    // Draw region buttons
    const buttonWidth = width * 0.45;
    const buttonHeight = height * 0.08;
    const gap = height * 0.02; // Vertical gap

    let currentY = height * 0.25;
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const btnX = width / 2 - buttonWidth / 2;
        const btnY = currentY;

        let regionColor = color(60, 70, 85); // Darker blue-gray for unselected
        let textColor = color(240, 245, 250);
        let currentStrokeWeight = 1.5;
        let borderColor = color(100, 115, 130); // Subtle border
        let currentShadowBlur = 0;
        let shadowColor = 'rgba(0,0,0,0)';

        if (i === currentRegionIndex) {
            regionColor = color(80, 130, 100); // Muted green for selected
            textColor = color(255); // Brighter text for selected
            currentStrokeWeight = 3;
            borderColor = color(255, 230, 0); // Yellow border for selected
            currentShadowBlur = 10;
            shadowColor = color(80, 130, 100, 150); // Greenish glow for selected
        }

        if (mouseX > btnX && mouseY > btnY && mouseX < btnX + buttonWidth && mouseY < btnY + buttonHeight) {
            regionColor = lerpColor(regionColor, color(100, 115, 130), 0.2); // Lighten on hover
            currentShadowBlur = 15; // Increased glow on hover
            shadowColor = regionColor; // Glow color matches button
            cursor(HAND);
        } else {
            cursor(ARROW);
        }

        // Apply shadow
        drawingContext.shadowOffsetX = 0;
        drawingContext.shadowOffsetY = 5;
        drawingContext.shadowBlur = currentShadowBlur;
        drawingContext.shadowColor = shadowColor;

        fill(regionColor);
        noStroke(); // Ensure no stroke for these buttons
        rect(btnX, btnY, buttonWidth, buttonHeight, buttonHeight / 2); // Rounded corners

        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)'; // Reset shadow

        fill(textColor);
        textSize(buttonHeight * 0.4);
        textAlign(CENTER, CENTER);
        text(region.name, btnX + buttonWidth / 2, btnY + buttonHeight / 2);

        currentY += buttonHeight + gap;
    }

    drawButton(btnBackToStockMarket);
}

function drawBuySellStockScreen(symbol) {
    if (!symbol || !stocksData[symbol]) {
        background(0);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(32);
        text("Error: Stock not found!", width / 2, height / 2);
        drawButton(btnBackToStockMarket);
        return;
    }

    const stock = stocksData[symbol];
    const ownedQuantity = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;

    background(35, 45, 60); // Dark blue-gray background for buy/sell

    fill(240, 245, 250);
    textSize(width * 0.04);
    textAlign(CENTER, TOP);
    text(`${symbol} Stock Details`, width / 2, height * 0.15);

    // Display stock details prominently
    const detailTextSize = height * 0.035; // Larger text for details
    const detailLineSpacing = detailTextSize * 1.5;
    const detailX = width / 2;
    let detailY = height * 0.25;

    fill(255, 230, 0); // Gold-yellow for current price
    textSize(detailTextSize);
    text(`Current Price: $${stock.price.toFixed(2)}`, detailX, detailY);

    fill(200, 210, 220); // Light gray for owned quantity
    detailY += detailLineSpacing;
    text(`Owned: ${ownedQuantity}`, detailX, detailY);

    fill(255, 180, 180); // Softer red for money
    detailY += detailLineSpacing;
    text(`Your Money: $${gameMoney.toLocaleString()}`, detailX, detailY);

    // New: Display Daily Dividend of this stock
    fill(100, 255, 255); // Cyan for dividends
    detailY += detailLineSpacing;
    text(`Daily Dividend: $${stock.dividend.toFixed(2)} per share`, detailX, detailY);

    // Quantity input (simulated)
    const inputX = width / 2 - (width * 0.2) / 2;
    const inputY = height * 0.5;
    const inputWidth = width * 0.2;
    const inputHeight = height * 0.06;

    // Input field background
    fill(30, 40, 50); // Even darker grey
    stroke(100, 115, 130); // Lighter border
    strokeWeight(1);
    rect(inputX, inputY, inputWidth, inputHeight, 8); // Rounded corners

    fill(240, 245, 250);
    textSize(width * 0.02);
    textAlign(CENTER, CENTER);
    text(buySellQuantity || 'Enter Qty', inputX + inputWidth / 2, inputY + inputHeight / 2);

    // Buy / Sell / Max buttons
    const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Buy', color: color(50, 180, 50) };
    const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Sell', color: color(220, 50, 50) };
    const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };
    const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };

    drawButton(btnBuy);
    drawButton(btnSell);
    drawButton(btnMaxSell);
    drawButton(btnMaxBuy);

    drawButton(btnBackToStockMarket);
}

function buyStock(symbol, quantity) {
    // Ensure quantity is a valid number
    quantity = int(quantity);
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return;
    }

    const stock = stocksData[symbol];
    const cost = stock.price * quantity;
    const currentOwned = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;

    if (gameMoney < cost) {
        addGameMessage("Not enough money to buy!", 'error');
        return;
    }

    // Check if buying this quantity exceeds max inventory for this stock
    if (currentOwned + quantity > STOCK_MAX_INVENTORY) {
        addGameMessage(`Cannot hold more than ${STOCK_MAX_INVENTORY} shares of ${symbol}.`, 'error');
        return;
    }

    gameMoney -= cost;
    if (!playerPortfolio[symbol]) {
        playerPortfolio[symbol] = { quantity: 0, avgPrice: 0 };
    }
    // Calculate new average price
    const totalOldCost = playerPortfolio[symbol].quantity * playerPortfolio[symbol].avgPrice;
    playerPortfolio[symbol].quantity += quantity;
    playerPortfolio[symbol].avgPrice = (totalOldCost + cost) / playerPortfolio[symbol].quantity;

    addGameMessage(`Bought ${quantity} shares of ${symbol} for $${cost.toFixed(2)}.`, 'success');
    updateMoney(0); // Trigger money display update
}

function sellStock(symbol, quantity) {
    // Ensure quantity is a valid number
    quantity = int(quantity);
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return;
    }
    if (!playerPortfolio[symbol] || playerPortfolio[symbol].quantity < quantity) {
        addGameMessage("Not enough shares to sell!", 'error');
        return;
    }
    const stock = stocksData[symbol];
    const revenue = stock.price * quantity;
    gameMoney += revenue;

    playerPortfolio[symbol].quantity -= quantity;

    if (playerPortfolio[symbol].quantity === 0) {
        delete playerPortfolio[symbol]; // Remove from portfolio if quantity is zero
    }
    addGameMessage(`Sold ${quantity} shares of ${symbol} for $${revenue.toFixed(2)}.`, 'success');
    updateMoney(0); // Trigger display update
}

function changeRegion(newIndex) {
    // A small cost to move regions to add more strategy
    const moveCost = 50; // Example cost

    if (gameMoney < moveCost) {
        addGameMessage(`Not enough money to move! Requires $${moveCost}.`, 'error');
        return;
    }
    
    if (gameDay <= 1) { // Prevent moving on Day 1 (or other logic if needed)
        addGameMessage("Cannot move on Day 1.", 'warning');
        return;
    }

    if (newIndex >= 0 && newIndex < regions.length) {
        gameMoney -= moveCost; // Deduct cost
        currentRegionIndex = newIndex;
        advanceDay(); // Moving takes a day
        addGameMessage(`Moved to ${regions[currentRegionIndex].name} for $${moveCost}.`, 'info');
        setGameState('stockMarket'); // Return to stock market view
    } else {
        addGameMessage("Invalid region selected.", 'error');
    }
}


// Function to draw game parameters (Money, Day, Location) on the canvas (positioned left)
function drawGameInfo() {
    const boxWidth = width * 0.22; // Responsive width
    const boxHeight = height * 0.15; // Responsive height
    const padding = width * 0.01; // Responsive padding
    const cornerRadius = 8;

    // Position in the top LEFT corner
    const boxX = padding; // Left side
    const boxY = padding; // Top side

    // Draw background box with a subtle darker shade and a border
    fill(30, 40, 50, 200); // Darker, slightly transparent background
    stroke(80, 100, 120, 200); // Subtle blue-gray border
    strokeWeight(1.5);
    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius);

    // Inner glow for the box
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 8; // Subtle glow
    drawingContext.shadowColor = 'rgba(100, 150, 255, 0.2)'; // Blueish glow

    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius); // Redraw for shadow

    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)'; // Reset shadow

    // Text and Icons
    const iconSize = height * 0.025; // Responsive icon size
    const textBaseSize = height * 0.022; // Base responsive text size, adjusted to fit
    const lineSpacing = textBaseSize * 1.5; // Adjusted line spacing

    fill(255); // White text
    textAlign(LEFT, CENTER); // Center text vertically within its line

    // Text shadow for readability on text
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 3;
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';


    let currentTextY = boxY + padding + textBaseSize * 0.8; // Start point for first line (using boxY for consistent padding)

    // Money
    textSize(textBaseSize);
    text('💰', boxX + padding, currentTextY); // Icon
    text(`Money: $${gameMoney.toLocaleString()}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing;

    // Day
    textSize(textBaseSize);
    text('🗓️', boxX + padding, currentTextY); // Icon
    text(`Day: ${gameDay}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing;

    // Location
    textSize(textBaseSize);
    text('📍', boxX + padding, currentTextY); // Icon
    text(`Location: ${gameLocation}`, boxX + padding + iconSize + 5, currentTextY);

    // Reset shadow
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}

// Function to draw game messages on the canvas (positioned right, smaller, sleek, fading)
function drawFadingMessages() {
    const messageAreaRightEdge = width * 0.98; // Closer to right edge
    const messageAreaTop = height * 0.02; // Start from top, slightly below canvas top
    const messageLineHeight = height * MESSAGE_LINE_HEIGHT_FACTOR; // Responsive line height

    textSize(height * 0.02); // Responsive text size for messages
    textAlign(RIGHT, TOP); // Align text to the right

    // Filter out messages that have completed their full fade cycle
    gameMessages = gameMessages.filter(msg => {
        const elapsedTime = millis() - msg.timestamp;
        // Keep message if its total duration has not passed
        return elapsedTime < MESSAGE_TOTAL_DURATION;
    });

    // Draw active messages, stacking upwards from the bottom of the message area
    // Determine the Y position for the newest message, and then stack upwards.
    let currentY = messageAreaTop + (MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR * height) - messageLineHeight; // Start at the "bottom" of the display area for newest message

    // Text shadow for readability on text
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 2; // Subtle shadow
    drawingContext.shadowColor = 'rgba(0,0,0,0.7)';


    for (let i = gameMessages.length - 1; i >= 0; i--) { // Loop from newest to oldest
        const msg = gameMessages[i];
        const elapsedTime = millis() - msg.timestamp;
        let opacity;

        if (elapsedTime < MESSAGE_FADE_IN_DURATION) {
            // Fading in
            opacity = map(elapsedTime, 0, MESSAGE_FADE_IN_DURATION, 0, 255);
        } else if (elapsedTime < MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION) {
            // Fully visible
            opacity = 255;
        } else {
            // Fading out
            const fadeOutTime = elapsedTime - (MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION);
            opacity = map(fadeOutTime, 0, MESSAGE_FADE_OUT_DURATION, 255, 0);
        }

        let textColor;
        // Define colors for message types, applying the current opacity
        if (msg.type === 'success') textColor = color(72, 187, 120, opacity); // Green
        else if (msg.type === 'error') textColor = color(239, 68, 68, opacity); // Red
        else if (msg.type === 'warning') textColor = color(246, 173, 85, opacity); // Orange
        else textColor = color(226, 232, 240, opacity); // Light gray (info)

        fill(textColor);
        text(msg.text, messageAreaRightEdge, currentY); // Draw text aligned right
        currentY -= messageLineHeight; // Move up for the next older message

        if (currentY < messageAreaTop) { // Stop drawing if out of allocated message area
            break;
        }
    }
    // Reset shadow
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// --- Utility Functions ---
function addGameMessage(message, type = 'info') {
    // Add new message with current time. Opacity will be calculated by drawFadingMessages.
    gameMessages.push({ text: message, type: type, timestamp: millis() });
}

// Function to change the game state (which screen is active)
function setGameState(newState) {
    currentGameState = newState;
    if (newState === 'mainMenu') {
        gameLocation = "Main Menu";
        addGameMessage("Returned to main menu.");
    } else if (newState === 'stockMarket') {
        gameLocation = regions[currentRegionIndex].name;
        addGameMessage(`Entering ${gameLocation}...`, 'info');
    } else if (newState === 'wallet') {
        addGameMessage("Viewing your portfolio.", 'info');
    } else if (newState === 'moveRegion') {
        addGameMessage("Choosing new market region.", 'info');
    } else if (newState === 'buySellStock') {
        addGameMessage(`Trading ${selectedStockSymbol}.`, 'info');
    } else if (newState === 'mafiaWars') {
        gameLocation = mafiaLocations[currentMafiaLocationIndex].name; // Set location to current Mafia location
        addGameMessage("You've entered the Mafia underworld!", 'info');
        lastMafiaPriceUpdateTime = millis(); // Reset price update timer when entering Mafia Wars
    }
    else {
        // Generic messages for other states if needed
        gameLocation = newState; // Placeholder
        addGameMessage(`Entering ${newState}...`, 'info');
    }
}

// Function to reset the game to its initial state
function resetGame() {
    gameMoney = 1000;
    gameDay = 1;
    gameLocation = "Main Menu";
    gameMessages = []; // Clear all messages immediately on reset
    initializeStocks(); // Re-initialize stock prices and clear portfolio
    playerPortfolio = {};
    initializeMafiaWars(); // Reset Mafia Wars state (includes daily transaction limits)

    addGameMessage("Game reset. Welcome back!");
    addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');
    setGameState('mainMenu'); // Go back to main menu
}

// Example functions for game progress
function advanceDay() {
    gameDay++;
    // Reset daily buy/sell counts for Mafia Wars
    mafiaDailyBuys = 0;
    mafiaDailySells = 0;

    // Apply dividends from owned stocks
    let totalDividends = 0;
    for (const symbol in playerPortfolio) {
        const ownedStock = playerPortfolio[symbol];
        const stockData = stocksData[symbol];
        if (ownedStock && stockData) {
            totalDividends += ownedStock.quantity * stockData.dividend;
        }
    }
    if (totalDividends > 0) {
        gameMoney += totalDividends;
        addGameMessage(`Received $${totalDividends.toFixed(2)} in dividends!`, 'success');
    }

    if (currentGameState === 'stockMarket') {
        advanceStockPrices(); // Update stock prices when day advances if in stock market
    }
    // Mafia Wars price update is now time-based, not day-based.

    addGameMessage(`Advanced to Day ${gameDay}.`);

    // Check for game end condition
    if (gameMoney >= MONEY_GOAL) {
        addGameMessage(`Congratulations! You reached $${MONEY_GOAL.toLocaleString()} in ${gameDay} days! You win!`, 'success');
        setGameState('winScreen');
        noLoop(); // Stop the game loop
    } else if (gameDay >= DAY_LIMIT) {
        addGameMessage(`Time's up! You did not reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days. Game Over!`, 'error');
        setGameState('loseScreen');
        noLoop(); // Stop the game loop
    }
}

function updateMoney(amount) {
    gameMoney += amount;
    addGameMessage(`Money changed by $${amount}. Current: $${gameMoney.toLocaleString()}`, amount >= 0 ? 'success' : 'error');
}

// Draw the Day Bar (Money Goal and Day Limit)
function drawDayBar() {
    const barX = width * 0.28; // Centered
    const barY = height * 0.96; // At the bottom
    const barWidth = width * 0.45;
    const barHeight = height * 0.03;
    const cornerRadius = 5;

    // Background bar
    fill(20, 20, 30);
    stroke(80, 100, 120);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight, cornerRadius);

    // Money Progress Bar
    // Clamp moneyProgress to stay within barWidth
    let moneyProgress = map(gameMoney, 0, MONEY_GOAL, 0, barWidth, true);
    fill(50, 200, 50); // Green for money progress
    rect(barX, barY, moneyProgress, barHeight, cornerRadius);

    // Day Progress Overlay
    // Clamp dayProgress to stay within barWidth
    let dayProgress = map(gameDay, 0, DAY_LIMIT, 0, barWidth, true);
    // Draw a subtle overlay for day progress
    fill(200, 200, 50, 80); // Yellowish, semi-transparent
    rect(barX, barY, dayProgress, barHeight, cornerRadius);

    // Text overlay
    fill(255);
    textSize(height * 0.018);
    textAlign(CENTER, CENTER);
    text(`Goal: $${gameMoney.toLocaleString()} / $${MONEY_GOAL.toLocaleString()} | Day: ${gameDay} / ${DAY_LIMIT}`, barX + barWidth / 2, barY + barHeight / 2);
}

// --- NEW: Win/Lose Screens ---

function drawWinScreen() {
    background(20, 50, 30); // Greenish-dark background for win screen

    // "You Won!" title
    fill(100, 255, 100); // Bright green
    textFont('monospace');
    textSize(width * 0.08);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'lime';
    text("YOU WON!", width / 2, height * 0.3);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Win details
    fill(240, 245, 250);
    textSize(width * 0.025);
    text(`Congratulations! You reached $${MONEY_GOAL.toLocaleString()}!`, width / 2, height * 0.45);
    text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
    text(`Days Taken: ${gameDay}`, width / 2, height * 0.59);

    // Play Again button
    const playAgainBtn = {
        x: width / 2 - (width * 0.25) / 2,
        y: height * 0.75,
        width: width * 0.25,
        height: height * 0.08,
        text: 'Play Again',
        color: color(50, 180, 50)
    };
    drawButton(playAgainBtn);
}

function drawLoseScreen() {
    background(50, 20, 20); // Reddish-dark background for lose screen

    // "Game Over" title
    fill(255, 100, 100); // Bright red
    textFont('monospace');
    textSize(width * 0.08);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'red';
    text("GAME OVER", width / 2, height * 0.3);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Lose details
    fill(240, 245, 250);
    textSize(width * 0.025);
    text(`You did not reach $${MONEY_GOAL.toLocaleString()} in ${DAY_LIMIT} days.`, width / 2, height * 0.45);
    text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
    text(`Days Played: ${gameDay}`, width / 2, height * 0.59);

    // Play Again button
    const playAgainBtn = {
        x: width / 2 - (width * 0.25) / 2,
        y: height * 0.75,
        width: width * 0.25,
        height: height * 0.08,
        text: 'Play Again',
        color: color(180, 50, 50) // Reddish button
    };
    drawButton(playAgainBtn);
}

    addGameMessage(`Money changed by $${amount}. Current: $${gameMoney.toLocaleString()}`, amount >= 0 ? 'success' : 'error');
}

// Draw the Day Bar (Money Goal and Day Limit)
function drawDayBar() {
    const barX = width * 0.28; // Centered
    const barY = height * 0.96; // At the bottom
    const barWidth = width * 0.45;
    const barHeight = height * 0.03;
    const cornerRadius = 5;

    // Background bar
    fill(20, 20, 30);
    stroke(80, 100, 120);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight, cornerRadius);

    // Money Progress Bar
    // Clamp moneyProgress to stay within barWidth
    let moneyProgress = map(gameMoney, 0, MONEY_GOAL, 0, barWidth, true);
    fill(50, 200, 50); // Green for money progress
    rect(barX, barY, moneyProgress, barHeight, cornerRadius);

    // Day Progress Overlay
    // Clamp dayProgress to stay within barWidth
    let dayProgress = map(gameDay, 0, DAY_LIMIT, 0, barWidth, true);
    // Draw a subtle overlay for day progress
    fill(200, 200, 50, 80); // Yellowish, semi-transparent
    rect(barX, barY, dayProgress, barHeight, cornerRadius);

    // Text overlay
    fill(255);
    textSize(height * 0.018);
    textAlign(CENTER, CENTER);
    text(`Goal: $${gameMoney.toLocaleString()} / $${MONEY_GOAL.toLocaleString()} | Day: ${gameDay} / ${DAY_LIMIT}`, barX + barWidth / 2, barY + barHeight / 2);
}

// --- NEW: Win/Lose Screens ---

function drawWinScreen() {
    background(20, 50, 30); // Greenish-dark background for win screen

    // "You Won!" title
    fill(100, 255, 100); // Bright green
    textFont('monospace');
    textSize(width * 0.08);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'lime';
    text("YOU WON!", width / 2, height * 0.3);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Win details
    fill(240, 245, 250);
    textSize(width * 0.025);
    text(`Congratulations! You reached $${MONEY_GOAL.toLocaleString()}!`, width / 2, height * 0.45);
    text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
    text(`Days Taken: ${gameDay}`, width / 2, height * 0.59);

    // Play Again button
    const playAgainBtn = {
        x: width / 2 - (width * 0.25) / 2,
        y: height * 0.75,
        width: width * 0.25,
        height: height * 0.08,
        text: 'Play Again',
        color: color(50, 180, 50)
    };
    drawButton(playAgainBtn);
}

function drawLoseScreen() {
    background(50, 20, 20); // Reddish-dark background for lose screen

    // "Game Over" title
    fill(255, 100, 100); // Bright red
    textFont('monospace');
    textSize(width * 0.08);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'red';
    text("GAME OVER", width / 2, height * 0.3);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Lose details
    fill(240, 245, 250);
    textSize(width * 0.025);
    text(`You did not reach $${MONEY_GOAL.toLocaleString()} in ${DAY_LIMIT} days.`, width / 2, height * 0.45);
    text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
    text(`Days Played: ${gameDay}`, width / 2, height * 0.59);

    // Play Again button
    const playAgainBtn = {
        x: width / 2 - (width * 0.25) / 2,
        y: height * 0.75,
        width: width * 0.25,
        height: height * 0.08,
        text: 'Play Again',
        color: color(180, 50, 50) // Reddish button
    };
    drawButton(playAgainBtn);
}
