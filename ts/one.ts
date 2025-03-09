let arr = Array.from({ length: 1_000_000 }, (_, index) => index);
console.log(arr.length);

const workerCode = `
  self.onmessage = function(e) {
    const array = e.data;
    let sum = 0;

    // Process the array (this example calculates the sum)
    for (let i = 0; i < array.length; i++) {
      sum += array[i];

      // Optionally report progress every 100,000 items
      if (i % 100000 === 0) {
        self.postMessage({ type: 'progress', processed: i, total: array.length });
      }
    }

    // Send back the result
    self.postMessage({ type: 'result', sum: sum });
  };
`;

// Create a blob URL for the worker
const blob = new Blob([workerCode], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(blob);

// Create and start the worker
const worker = new Worker(workerUrl);

// Set up message handling
worker.onmessage = function (e) {
  const message = e.data;

  if (message.type === "progress") {
    console.log(`Processed ${message.processed} of ${message.total} items`);
  } else if (message.type === "result") {
    console.log(`Calculation complete! Sum: ${message.sum}`);

    // Clean up
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }
};

// Send the array to the worker
console.log("Starting worker processing...");
worker.postMessage(arr);
