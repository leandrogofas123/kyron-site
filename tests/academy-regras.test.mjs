// Testes das regras puras da Kyron Academy (nível por XP, streak).
// Roda com Node nativo, sem Prisma/banco: `node --experimental-strip-types --test tests/`
import { test } from "node:test";
import assert from "node:assert/strict";

import { diaSeguinte, mesmoDia, nivelPorXp } from "../src/lib/academy/regras-puras.ts";

test("nivelPorXp: nos limiares exatos e entre eles", () => {
  assert.equal(nivelPorXp(0), "Recruta");
  assert.equal(nivelPorXp(199), "Recruta");
  assert.equal(nivelPorXp(200), "Operador");
  assert.equal(nivelPorXp(599), "Operador");
  assert.equal(nivelPorXp(600), "Especialista");
  assert.equal(nivelPorXp(1199), "Especialista");
  assert.equal(nivelPorXp(1200), "Hunter");
  assert.equal(nivelPorXp(50_000), "Hunter"); // nunca passa do último nível
});

test("nivelPorXp: XP negativo (nunca deve acontecer, mas não pode quebrar) cai em Recruta", () => {
  assert.equal(nivelPorXp(-10), "Recruta");
});

test("mesmoDia: mesma data em horários diferentes é o mesmo dia", () => {
  assert.equal(mesmoDia(new Date("2026-08-12T08:00:00"), new Date("2026-08-12T23:59:00")), true);
});

test("mesmoDia: dias diferentes não são o mesmo dia", () => {
  assert.equal(mesmoDia(new Date("2026-08-12T23:59:00"), new Date("2026-08-13T00:01:00")), false);
});

test("diaSeguinte: 12→13 é dia seguinte", () => {
  assert.equal(diaSeguinte(new Date("2026-08-12T10:00:00"), new Date("2026-08-13T09:00:00")), true);
});

test("diaSeguinte: virada de mês (31→1) continua contando streak", () => {
  assert.equal(diaSeguinte(new Date("2026-08-31T10:00:00"), new Date("2026-09-01T09:00:00")), true);
});

test("diaSeguinte: pular um dia (furo) NÃO conta como seguinte", () => {
  assert.equal(diaSeguinte(new Date("2026-08-12T10:00:00"), new Date("2026-08-14T09:00:00")), false);
});

test("diaSeguinte: mesmo dia não é 'dia seguinte' de si mesmo", () => {
  assert.equal(diaSeguinte(new Date("2026-08-12T08:00:00"), new Date("2026-08-12T20:00:00")), false);
});
