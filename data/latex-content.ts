// All LaTeX content in one place for proper rendering
export const latex = {
  inline: {
    // Variables
    b: "b",
    n: "n",
    qi: "q_i",
    qj: "q_j",
    pi: "p_i",
    pj: "p_j",
    deltaQ: "\\Delta q",
    deltaQj: "\\Delta q_j",

    // Vectors with arrows
    qVector: "\\vec{q}",
    pVector: "\\vec{p}",
    deltaQVector: "\\Delta\\vec{q}",

    // Common expressions
    sumToOne: "\\sum_{i=1}^{n} p_i = 1",
    bLogN: "b \\cdot \\log(n)",
    oneOverN: "1/n",

    // Greek letters
    pi: "\\pi",
    piMin: "\\min_{i=1}^{n} \\pi_i",
    piVector: "\\vec{\\pi}",

    // Seeder-specific
    bSeeder: "b_{seeder}",
    bInitial: "b_{initial}",
    bTotal: "b_{total}",
  },

  display: {
    // Core LMSR equations
    costFunction: "C(\\vec{q}) = b \\cdot \\ln\\left(\\sum_{i=1}^{n} e^{q_i/b}\\right)",
    priceFunction: "p_j = \\frac{\\partial C}{\\partial q_j} = \\frac{e^{q_j/b}}{\\sum_{i=1}^{n} e^{q_i/b}}",
    costIntegral: "\\text{Cost} = \\int_{q_j}^{q_j + \\Delta q_j} p_j(\\vec{q}) \\, dq_j",
    discreteCost: "\\text{Cost} = C(\\vec{q} + \\Delta\\vec{q}) - C(\\vec{q})",

    // Market parameters
    liquidityParam: "b = \\frac{\\text{seed}}{\\ln(n)}",
    uniformPrior: "p_i^{(0)} = \\frac{1}{n} \\quad \\forall i \\in \\{1, 2, ..., n\\}",
    zeroState: "\\vec{q}^{(0)} = \\vec{0}",

    // Fees and costs
    feeCalc: "\\text{Fee} = \\text{Cost} \\times \\frac{\\text{fee rate}}{10000}",
    totalCost: "\\text{Total} = \\text{Cost} + \\text{Fee}",
    maxLoss: "\\text{Max Loss} = \\text{seed}",

    // Seeder liquidity formulas
    initialSeederB: "b_{initial} = \\frac{\\text{seed}}{\\ln(n)}",
    futureSeederB: "b_{seeder} = \\frac{\\text{seed}}{-\\ln(\\min_{i=1}^{n} \\pi_i)}",
    totalB: "b_{total} = \\sum_{s \\in \\text{seeders}} b_s",
  },
}
