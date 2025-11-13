/**
 * Simulates network delay for mock API calls
 * @param ms Milliseconds to delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
