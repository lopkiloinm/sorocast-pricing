export const lmsrEquations = {
  // Core LMSR Functions
  costFunction: {
    title: "Cost Function",
    equation: "C(\\mathbf{q}) = b \\cdot \\ln\\left(\\sum_i e^{q_i/b}\\right)",
    description:
      "This function determines the total amount of money in the market. Here, $$\\mathbf{q}$$ is the vector of shares outstanding for each outcome, and $$b$$ is the liquidity parameter.",
  },
  priceAsDerivative: {
    title: "Price from Partial Derivative",
    equation:
      "p_j(\\mathbf{q}) = \\frac{\\partial C(\\mathbf{q})}{\\partial q_j} = \\frac{e^{q_j/b}}{\\sum_i e^{q_i/b}}",
    description: "The price of outcome $$j$$ is the partial derivative of the cost function with respect to $$q_j$$.",
  },
  costAsIntegral: {
    title: "Cost as Definite Integral",
    equation:
      "\\text{Cost to buy } \\Delta q_j \\text{ shares} = \\int_{q_j}^{q_j + \\Delta q_j} p_j(\\mathbf{q}) \\, dq_j",
    description: "The cost of buying shares can be expressed as the definite integral of the instantaneous price.",
  },

  // Prior Probabilities
  uniformPrior: {
    title: "Initial Uniform Prior",
    equation: "p_i^{(0)} = \\frac{1}{n} \\quad \\forall i \\in \\{1, 2, ..., n\\}",
    description: "All markets start with uniform priors where each outcome has equal probability $$1/n$$.",
  },
  initialShareState: {
    title: "Initial Share State",
    equation: "\\mathbf{q}^{(0)} = \\mathbf{0} = \\begin{pmatrix} 0 \\\\ 0 \\\\ \\vdots \\\\ 0 \\end{pmatrix}",
    description: "Initially, no shares have been purchased, so all $$q_i = 0$$.",
  },
  priorToShareRelation: {
    title: "Prior to Share Relationship",
    equation: "q_i = b \\cdot \\ln(n \\cdot p_i)",
    description: "The relationship between share quantities and probabilities, derived from the price function.",
  },
  currentPrior: {
    title: "Current Market Probabilities",
    equation: "p_i^{\\text{current}} = \\frac{e^{q_i/b}}{\\sum_j e^{q_j/b}}",
    description: "The current market-implied probabilities based on the current share distribution.",
  },

  // Vector and State Representation
  vectorNotation: {
    title: "Market State Vectors",
    equation:
      "\\mathbf{q} = \\begin{pmatrix} q_1 \\\\ q_2 \\\\ \\vdots \\\\ q_n \\end{pmatrix}, \\quad \\mathbf{p} = \\begin{pmatrix} p_1 \\\\ p_2 \\\\ \\vdots \\\\ p_n \\end{pmatrix}",
    description:
      "The market state is represented by the share vector $$\\mathbf{q}$$ and price vector $$\\mathbf{p}$$.",
  },
  priceConstraint: {
    title: "Probability Constraint",
    equation: "\\sum_{i=1}^{n} p_i = 1",
    description: "Prices always sum to 1, forming a valid probability distribution.",
  },

  // Cost and Fee Calculations
  costToBuy: {
    title: "Discrete Cost Calculation",
    equation: "\\text{Cost} = C(\\mathbf{q} + \\Delta\\mathbf{q}) - C(\\mathbf{q})",
    description: "For discrete purchases, cost is the difference in the cost function.",
  },
  liquidityParameter: {
    title: "Liquidity Parameter",
    equation: "b = \\frac{\\text{total seed}}{\\ln(n)}",
    description: "The liquidity parameter scales with total seed and number of outcomes.",
  },
  feeCalculation: {
    title: "Fee Calculation",
    equation: "\\text{Fee} = \\text{Cost} \\times \\frac{\\text{creator fee}}{10000}",
    description: "Fees are calculated in basis points on the base cost.",
  },
  totalCost: {
    title: "Total Purchase Cost",
    equation: "\\text{Total Cost} = \\text{Cost} + \\text{Fee}",
    description: "Buyers pay the base cost plus fees.",
  },

  // Risk and Loss
  maxLoss: {
    title: "Maximum Seeder Loss",
    equation: "\\text{Max Loss} = \\text{total seed} = b \\cdot \\ln(n)",
    description: "The worst-case loss for seeders equals their total seed contribution.",
  },
  individualMaxLoss: {
    title: "Individual Seeder Loss",
    equation: "\\text{Individual Max Loss} = \\text{seeder contribution}",
    description: "Each seeder's maximum loss is proportional to their contribution.",
  },
}
