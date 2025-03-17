

export default async function runPromisesSequentiallyWithErrors(promiseFunctions) {
    const results = [];
  
    for (const promiseFunction of promiseFunctions) {
      try {
        const result = await promiseFunction(); // Await the current promise
        results.push(result); // Store the result
      } catch (error) {
        console.error("Error while executing promise:", error); // Handle errors
      }
    }
  
    return results;
  }