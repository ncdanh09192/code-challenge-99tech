# Problem 4: Three Ways to Sum to n

## 📋 Problem

Calculate the sum of integers from 1 to n.

Example: `sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15`

---

## 🔧 Prerequisites

Before running the tests, make sure you have:

### Required:
- **Node.js** (v14 or higher)
  - Download from: https://nodejs.org/
  - Check installation: `node --version`

- **npm** (comes with Node.js)
  - Check installation: `npm --version`

### Optional:
- **TypeScript** (installed via npx, no need to install globally)
  - ts-node will be installed automatically when running `npx ts-node`

---

## ✨ Installation

No additional installation needed! The command `npx ts-node index.ts` will automatically:
1. Download and cache `ts-node` if not present
2. Compile TypeScript on the fly
3. Execute the code

---

## 🎯 Three Approaches

### Approach A: Iterative Loop
```typescript
function sum_to_n_a(n: number): number {
    let total = 0;
    for (let i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}
```

### Approach B: Functional Style with Array.reduce()
```typescript
function sum_to_n_b(n: number): number {
    return Array.from({ length: n }, (_, i) => i + 1).reduce((sum, num) => sum + num, 0);
}
```

### Approach C: Recursive
```typescript
function sum_to_n_c(n: number): number {
    if (n <= 0) {
        return 0;
    }
    return n + sum_to_n_c(n - 1);
}
```

---

## ✅ How to Test

### Run the tests:
```bash
npx ts-node index.ts
```

### Expected output:
```
=== Testing sum_to_n implementations ===

n = 0
  Approach A (Loop):        0
  Approach B (reduce):      0
  Approach C (Recursive):   0
  All equal: ✓

n = 1
  Approach A (Loop):        1
  Approach B (reduce):      1
  Approach C (Recursive):   1
  All equal: ✓

n = 5
  Approach A (Loop):        15
  Approach B (reduce):      15
  Approach C (Recursive):   15
  All equal: ✓

n = 10
  Approach A (Loop):        55
  Approach B (reduce):      55
  Approach C (Recursive):   55
  All equal: ✓

n = 100
  Approach A (Loop):        5050
  Approach B (reduce):      5050
  Approach C (Recursive):   5050
  All equal: ✓
```

### Verification:
✓ All test cases should show `All equal: ✓`
✓ All results should be correct based on the formula: `n * (n + 1) / 2`

| n | Expected Result |
|---|---|
| 0 | 0 |
| 1 | 1 |
| 5 | 15 |
| 10 | 55 |
| 100 | 5050 |
