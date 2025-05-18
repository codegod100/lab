import * as blessed from 'blessed';

// Types for our data
interface CryptoPrice {
  symbol: string;
  price: number;
  timestamp: number;
  change24h: number;
  history: number[];
  lastUpdate?: number;
}

// Configuration
const CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'ADA', name: 'Cardano' }
];

const UPDATE_INTERVAL = 3000; // 3 seconds
const HISTORY_LENGTH = 20;
let batchSize = 3; // Process 3 coins at a time, can be toggled

// Generate mock price data
function generateMockPrice(symbol: string, basePrice: number): CryptoPrice {
  const now = Date.now();
  // Add some randomness to the price
  const price = basePrice * (0.95 + Math.random() * 0.1);
  // Generate some random change between -5% and +5%
  const change24h = -5 + Math.random() * 10;
  
  return {
    symbol,
    price: Number.parseFloat(price.toFixed(2)),
    timestamp: now,
    change24h: Number.parseFloat(change24h.toFixed(2)),
    history: Array(HISTORY_LENGTH - 1).fill(0).map(() => 
      Number.parseFloat((basePrice * (0.9 + Math.random() * 0.2)).toFixed(2))
    ).concat([Number.parseFloat(price.toFixed(2))])
  };
}

// Create a stream of crypto price updates
function createCryptoPriceStream() {
  let controller: ReadableStreamDefaultController<CryptoPrice[]>;
  let intervalId: NodeJS.Timeout;
  let isRunning = true;

  const stream = new ReadableStream<CryptoPrice[]>({
    start(c) {
      controller = c;
      const emitBatch = async () => {
        if (!isRunning) return;
        
        // Process in batches to simulate streaming
        for (let i = 0; i < CRYPTOS.length; i += batchSize) {
          const batch = CRYPTOS.slice(i, i + batchSize);
          const prices = batch.map(crypto => 
            generateMockPrice(crypto.symbol, BASE_PRICES[crypto.symbol])
          );
          
          controller.enqueue(prices);
          
          // Small delay between batches
          await new Promise(r => setTimeout(r, 100));
        }
      };

      // Initial emit
      emitBatch().catch(console.error);
      
      // Set up interval for updates
      intervalId = setInterval(() => {
        emitBatch().catch(console.error);
      }, UPDATE_INTERVAL);
    },
    cancel() {
      isRunning = false;
      if (intervalId) clearInterval(intervalId);
    }
  });

  return stream;
}

// Transform stream to process prices and maintain history
function createPriceProcessor() {
  const priceHistory = new Map<string, number[]>();
  
  return new TransformStream<CryptoPrice[], CryptoPrice[]>({
    transform(chunk, controller) {
      const processed = chunk.map(price => {
        const history = priceHistory.get(price.symbol) || [];
        const updatedHistory = [...history, price.price].slice(-HISTORY_LENGTH);
        priceHistory.set(price.symbol, updatedHistory);
        
        return {
          ...price,
          history: updatedHistory,
          lastUpdate: Date.now()
        };
      });
      
      controller.enqueue(processed);
    }
  });
}

// Base prices for each cryptocurrency
const BASE_PRICES: Record<string, number> = {
  'BTC': 60000,
  'ETH': 3000,
  'SOL': 150,
  'BNB': 500,
  'XRP': 0.5,
  'ADA': 0.4
};

// Create a screen instance
const screen = blessed.screen({
  smartCSR: true,
  title: 'Crypto Tracker (Mock Data)',
  fullUnicode: true
});

// Create layout
const layout = {
  header: 3,     // Header height
  footer: 1,     // Footer height
  table: {
    x: 2,
    y: 2,
    width: '100%-4',
    height: '100%-5',
    border: 'line',
    style: {
      border: { fg: 'blue' },
      header: { fg: 'cyan', bold: true },
      cell: { fg: 'white' }
    }
  }
};

// Create header
const header = blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: layout.header,
  content: '{center}{bold}Crypto Tracker (Mock Data){/bold}{/center}',
  tags: true,
  style: {
    fg: 'white',
    bg: 'blue',
  }
});

// Create footer
const footer = blessed.box({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '100%',
  height: layout.footer,
  content: 'Q: Quit | R: Refresh | ↑/↓: Scroll | F5: Toggle Auto-refresh',
  tags: true,
  style: {
    fg: 'black',
    bg: 'gray'
  }
});

// Create table
const table = blessed.listtable({
  parent: screen,
  ...layout.table,
  align: 'left',
  noCellBorders: true,
  pad: 1,
  keys: true,
  vi: true,
  mouse: true,
  scrollable: true,
  scrollbar: {
    ch: ' ',
    track: { bg: 'gray' },
    style: { bg: 'blue' }
  },
  border: 'line',
  style: {
    // Base styles
    header: { fg: 'cyan', bold: true },
    cell: { 
      fg: 'white',
      selected: { bg: 'blue' }
    },
    // Style for table borders
    border: { fg: 'blue' }
  },
  // Explicitly enable tags and parsing
  tags: true,
  parseTags: true
});

// Format data for display
function formatData(prices: CryptoPrice[]) {
  return [
    ['Symbol', 'Price (USD)', '24h %', 'Change (24h)'],
    ...prices.map(p => [
      p.symbol,
      `$${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      p.change24h >= 0 
        ? `{green-fg}↑ ${Math.abs(p.change24h).toFixed(2)}%{/}`
        : `{red-fg}↓ ${Math.abs(p.change24h).toFixed(2)}%{/}`,
      p.change24h >= 0 
        ? `{green-fg}+${(p.price * p.change24h / 100).toFixed(2)}{/}`
        : `{red-fg}${(p.price * p.change24h / 100).toFixed(2)}{/}`
    ])
  ];
}

// Generate mock data
function generateMockData(): CryptoPrice[] {
  return CRYPTOS.map(crypto => 
    generateMockPrice(crypto.symbol, BASE_PRICES[crypto.symbol])
  );
}

// Update the table with new data
let isLoading = false;

async function updateTable(prices: CryptoPrice[]) {
  if (isLoading) return;
  
  isLoading = true;
  try {
    const data = formatData(prices);
    
    table.setData(data);
    
    // Update header with timestamp
    header.setContent(
      `{center}{bold}Crypto Tracker (Streaming Data){/bold} | Last update: ${new Date().toLocaleTimeString()} | Batch size: ${batchSize}{/center}`
    );
    
    screen.render();
  } catch (error) {
    // Show error in header
    const errorMessage = error.message || 'Unknown error';
    header.setContent(
      `{center}{bold}Error: ${errorMessage}{/bold}{/center}`
    );
    
    screen.render();
  } finally {
    isLoading = false;
  }
}

// Set up the streaming pipeline
async function setupStreaming() {
  const stream = createCryptoPriceStream();
  const processor = createPriceProcessor();
  
  // Pipe the stream through the processor
  const processedStream = stream.pipeThrough(processor);
  const reader = processedStream.getReader();
  
  // Process the stream
  async function processStream() {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        await updateTable(value);
        
        // Small delay to prevent UI from freezing
        await new Promise(r => setTimeout(r, 50));
      }
    } catch (error) {
      console.error('Stream error:', error);
      // Attempt to recover by restarting the stream
      setTimeout(setupStreaming, 1000);
    }
  }
  
  // Start processing
  processStream().catch(console.error);
  
  return () => {
    reader.cancel().catch(console.error);
  };
}

// Handle keyboard input
let cleanupStream: () => void = () => {}; // Initialize with no-op function

screen.key(['q', 'C-c'], () => {
  if (cleanupStream) cleanupStream();
  process.exit(0);
});

screen.key('r', () => {
  // Manual refresh can be implemented by triggering a new batch
  const stream = createCryptoPriceStream();
  stream.getReader().read().then(({ value }) => {
    if (value) updateTable(value);
  }).catch(console.error);
});

screen.key('f5', () => {
  // Toggle between batch sizes to simulate different update speeds
  batchSize = batchSize === 3 ? 1 : 3;
  footer.setContent(`Batch size: ${batchSize} | Q: Quit | R: Refresh | F5: Toggle Speed`);
  screen.render();
});

// Initial render and start streaming
screen.render();

// Start the streaming process
(async () => {
  try {
    cleanupStream = await setupStreaming();
  } catch (error) {
    console.error('Failed to start streaming:', error);
    process.exit(1);
  }
})();

// Handle window resize
screen.on('resize', () => {
  screen.render();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  screen.destroy();
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  cleanupStream();
  screen.destroy();
  process.exit(0);
});
