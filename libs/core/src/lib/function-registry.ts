// Tipe untuk fungsi yang bisa diregister
export type RegisteredFunction = (...args: any[]) => any;

// Registry sederhana
const functionRegistry = new Map<string, RegisteredFunction>();

// API untuk menambahkan fungsi
export function registerFunction(name: string, func: RegisteredFunction): void {
  if (functionRegistry.has(name)) {
    console.warn(`Function "${name}" is being overwritten`);
  }

  functionRegistry.set(name, func);
}

// API untuk mengambil fungsi
export function getRegisteredFunction(name: string): RegisteredFunction | undefined {
  return functionRegistry.get(name);
}

export function unregisterFunction(name: string): void {
  functionRegistry.delete(name);
}

// API untuk mendapatkan semua fungsi (opsional)
export function getAllFunctions(): Record<string, RegisteredFunction> {
  const result: Record<string, RegisteredFunction> = {};
  for (const [key, value] of functionRegistry.entries()) {
    result[key] = value;
  }
  return result;
}