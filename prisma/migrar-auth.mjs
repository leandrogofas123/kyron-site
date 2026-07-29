/**
 * Migração do módulo AUTH: três sistemas → um.
 *
 * - Cria os papéis (roles) da plataforma.
 * - Colaborador (ERP) vira Usuario com o papel equivalente. O hash de senha é
 *   o MESMO formato scrypt, então ninguém precisa redefinir senha.
 * - Usuario existente (clientes das aulas) recebe o papel CLIENTE.
 * - ADMIN_EMAIL/ADMIN_PASSWORD (admin da loja, que vivia só no .env) vira um
 *   Usuario ADMIN_MASTER de verdade — e continua servindo de resgate.
 * - Movimentações de estoque passam a apontar para o Usuario correspondente.
 *
 * Idempotente: pode rodar de novo sem duplicar.
 *
 * Rodar:  node prisma/migrar-auth.mjs
 */
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function gerarHash(senha) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(senha, salt, 64).toString("hex")}`;
}

const PAPEIS = [
  { chave: "ADMIN_MASTER", nome: "Administrador master", nivel: 0 },
  { chave: "ADMIN", nome: "Administrador", nivel: 10 },
  { chave: "GERENTE", nome: "Gerente", nivel: 20 },
  { chave: "VENDEDOR", nome: "Vendedor", nivel: 30 },
  { chave: "TECNICO", nome: "Técnico", nivel: 30 },
  { chave: "FINANCEIRO", nome: "Financeiro", nivel: 30 },
  { chave: "SUPORTE", nome: "Suporte", nivel: 40 },
  { chave: "CLIENTE", nome: "Cliente", nivel: 90 },
];

/** Papel antigo do Colaborador → chave do papel novo. */
const DE_PARA = {
  admin: "ADMIN_MASTER",
  gerente: "GERENTE",
  vendedor: "VENDEDOR",
  tecnico: "TECNICO",
};

async function darPapel(usuarioId, chave) {
  const papel = await db.papel.findUnique({ where: { chave } });
  if (!papel) return;
  await db.usuarioPapel.upsert({
    where: { usuarioId_papelId: { usuarioId, papelId: papel.id } },
    update: {},
    create: { usuarioId, papelId: papel.id },
  });
}

async function main() {
  console.log("1) Papéis…");
  for (const p of PAPEIS) {
    await db.papel.upsert({
      where: { chave: p.chave },
      update: { nome: p.nome, nivel: p.nivel },
      create: p,
    });
  }
  console.log(`   ${PAPEIS.length} papéis prontos.`);

  console.log("2) Clientes das aulas → papel CLIENTE…");
  const clientes = await db.usuario.findMany({ select: { id: true } });
  for (const c of clientes) await darPapel(c.id, "CLIENTE");
  console.log(`   ${clientes.length} cliente(s).`);

  console.log("3) Colaboradores do ERP → Usuario…");
  const colaboradores = await db.colaborador.findMany();
  let migrados = 0;
  for (const c of colaboradores) {
    const email = c.email.trim().toLowerCase();
    let usuario = await db.usuario.findUnique({ where: { email } });

    if (!usuario) {
      // Reaproveita o hash existente: a senha continua a mesma.
      usuario = await db.usuario.create({
        data: {
          nome: c.nome,
          email,
          senhaHash: c.senhaHash,
          ativo: c.ativo,
          aprovado: true, // quem já era da equipe entra liberado
          emailVerificado: true,
          criadoEm: c.criadoEm,
        },
      });
      migrados++;
    } else {
      // Já existia como cliente das aulas: vira também membro da equipe.
      await db.usuario.update({
        where: { id: usuario.id },
        data: { aprovado: true, ativo: c.ativo },
      });
    }

    await darPapel(usuario.id, DE_PARA[c.papel] ?? "VENDEDOR");

    // Reaponta as movimentações desse colaborador para o usuário novo.
    const r = await db.movimentacaoEstoque.updateMany({
      where: { colaboradorId: c.id, usuarioId: null },
      data: { usuarioId: usuario.id },
    });
    if (r.count) console.log(`   ${c.nome}: ${r.count} movimentação(ões) reapontada(s).`);
  }
  console.log(`   ${colaboradores.length} colaborador(es), ${migrados} novo(s).`);

  console.log("4) Admin da loja (ADMIN_EMAIL) → ADMIN_MASTER…");
  const donoEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const donoSenha = process.env.ADMIN_PASSWORD;
  if (donoEmail && donoSenha) {
    let dono = await db.usuario.findUnique({ where: { email: donoEmail } });
    if (!dono) {
      dono = await db.usuario.create({
        data: {
          nome: "Administrador",
          email: donoEmail,
          senhaHash: gerarHash(donoSenha),
          ativo: true,
          aprovado: true,
          emailVerificado: true,
        },
      });
      console.log("   admin master criado.");
    } else {
      await db.usuario.update({
        where: { id: dono.id },
        data: { ativo: true, aprovado: true },
      });
      console.log("   admin master já existia; garantido ativo.");
    }
    await darPapel(dono.id, "ADMIN_MASTER");
  } else {
    console.log("   ADMIN_EMAIL/ADMIN_PASSWORD ausentes — pulado.");
  }

  const totalUsuarios = await db.usuario.count();
  const totalVinculos = await db.usuarioPapel.count();
  console.log(`\nPronto: ${totalUsuarios} usuário(s), ${totalVinculos} vínculo(s) de papel.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
