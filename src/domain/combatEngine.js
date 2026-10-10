/**
 * Combat Engine - Pure Domain Model
 * Calculates damage mitigation, hit probabilities, and battle outcome math.
 * Zero UI / React / network dependencies.
 */

export function calculateCombatDamage(attackerAtk, defenderDef, isCrit = false) {
  const mitigation = Math.max(0.1, 1 - defenderDef / (defenderDef + 300));
  const rawDmg = Math.max(1, attackerAtk * mitigation);
  const critMultiplier = isCrit ? 1.5 : 1.0;
  return Math.round(rawDmg * critMultiplier);
}

export function rollIsCritical(critChancePercent) {
  const roll = Math.random() * 100;
  return roll <= critChancePercent;
}

export function rollIsEvaded(evasionPercent) {
  const roll = Math.random() * 100;
  return roll <= evasionPercent;
}

export default {
  calculateCombatDamage,
  rollIsCritical,
  rollIsEvaded,
};
