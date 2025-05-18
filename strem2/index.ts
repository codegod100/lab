// Example of using ReadableStream API with TypeScript

// 1. Create a simple ReadableStream
function createNumberStream() {
  return new ReadableStream<number>({
    start(controller) {
      // Enqueue some numbers
      for (const num of [1, 2, 3, 4, 5]) {
        controller.enqueue(num);
      }
      controller.close();
    }
  });
}

// 2. Process the stream
async function processStream() {
  const stream = createNumberStream();
  const reader = stream.getReader();
  
  console.log('Stream started');
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Received value:', value);
    }
    console.log('Stream completed');
  } catch (error) {
    console.error('Stream error:', error);
  } finally {
    reader.releaseLock();
  }
}

// 3. Transform stream example
async function transformStream() {
  const stream = createNumberStream();
  
  // Create a transform stream that doubles the values
  const transform = new TransformStream<number, string>({
    transform(chunk, controller) {
      controller.enqueue(`Processed: ${chunk * 2}`);
    }
  });
  
  // Pipe through the transform
  const transformed = stream.pipeThrough(transform);
  
  // Process the transformed stream
  const reader = transformed.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Transformed value:', value);
    }
  } finally {
    reader.releaseLock();
  }
}

// 4. Real-world example: Process data in chunks
async function processLargeData() {
  // Simulate a large dataset
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: Math.random() * 1000
  }));
  
  // Create a stream from the array
  const stream = new ReadableStream({
    start(controller) {
      for (const item of largeData) {
        controller.enqueue(item);
      }
      controller.close();
    }
  });
  
  // Process in chunks
  const BATCH_SIZE = 100;
  interface DataItem {
    id: number;
    value: number;
  }
  let batch: DataItem[] = [];
  let totalProcessed = 0;
  
  const processBatch = async (items: DataItem[]) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`Processed batch of ${items.length} items`);
    totalProcessed += items.length;
  };
  
  const reader = stream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      batch.push(value);
      if (batch.length >= BATCH_SIZE) {
        await processBatch(batch);
        batch = [];
      }
    }
    
    // Process any remaining items
    if (batch.length > 0) {
      await processBatch(batch);
    }
    
    console.log(`Total processed: ${totalProcessed} items`);
  } catch (error) {
    console.error('Error processing stream:', error);
  } finally {
    reader.releaseLock();
  }
}

// 5. Run the examples
(async () => {
  console.log('--- Basic Stream Example ---');
  await processStream();
  
  console.log('\n--- Transform Stream Example ---');
  await transformStream();
  
  console.log('\n--- Large Data Processing Example ---');
  await processLargeData();
})();
