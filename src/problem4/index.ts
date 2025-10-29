/**
 * Problem 4: Three ways to sum to n
 *
 * Task: Provide 3 unique implementations to calculate the sum of integers from 1 to n
 * Input: n - any integer
 * Output: summation to n, e.g., sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 */

/**
 * Approach A: Iterative Loop
 */
function sum_to_n_a(n: number): number {
    let total = 0;
    for (let i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}

/**
 * Approach B: Functional Style with Array.reduce()
 */
function sum_to_n_b(n: number): number {
    return Array.from({ length: n }, (_, i) => i + 1).reduce((sum, num) => sum + num, 0);
}

/**
 * Approach C: Recursive
 */
function sum_to_n_c(n: number): number {
    if (n <= 0) {
        return 0;
    }
    return n + sum_to_n_c(n - 1);
}

/**
 * Approach D: Gauss Formula
 */
// function sum_to_n_d(n: number): number {
//     return n * (n + 1) / 2;
// }

// Export functions
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// Test cases
const testCases = [0, 1, 5, 10, 100];

console.log("=== Testing sum_to_n implementations ===\n");

testCases.forEach((n) => {
    const resultA = sum_to_n_a(n);
    const resultB = sum_to_n_b(n);
    const resultC = sum_to_n_c(n);

    console.log(`n = ${n}`);
    console.log(`  Approach A (Loop):        ${resultA}`);
    console.log(`  Approach B (reduce):      ${resultB}`);
    console.log(`  Approach C (Recursive):   ${resultC}`);
    console.log(`  All equal: ${resultA === resultB && resultB === resultC ? "✓" : "✗"}\n`);
});
