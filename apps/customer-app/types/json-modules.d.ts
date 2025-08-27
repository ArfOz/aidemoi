// Ambient module declaration to allow importing JSON files without TS6307 errors
declare module '*.json' {
  // Use unknown to avoid explicit any and let consumers narrow as needed
  const value: unknown;
  export default value;
}
