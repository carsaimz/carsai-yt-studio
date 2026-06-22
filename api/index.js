/**
 * api/index.js — Vercel Serverless Function wrapper para o servidor SSR
 * do TanStack Start / Nitro (node-server preset).
 *
 * A Vercel chama este ficheiro como uma Edge/Serverless Function.
 * Importamos o handler gerado pelo Nitro e delegamos o pedido.
 */

// O Nitro node-server gera um handler compatível com Node http.IncomingMessage.
// Para Vercel precisamos de o adaptar para o formato (req, res).
import { createServer } from "node:http";
import { resolve } from "node:path";

let _handler;

async function getHandler() {
  if (_handler) return _handler;
  // Caminho relativo ao root do projecto na Vercel
  const serverEntry = resolve(process.cwd(), "dist/server/server.js");
  const mod = await import(serverEntry);
  _handler = mod.default?.handler ?? mod.handler ?? mod.default;
  return _handler;
}

export default async function handler(req, res) {
  const h = await getHandler();
  if (typeof h === "function") {
    return h(req, res);
  }
  // Fallback: tentar como fetch handler (Nitro)
  if (h?.fetch) {
    const url = `https://${req.headers.host}${req.url}`;
    const body = req.method !== "GET" && req.method !== "HEAD"
      ? req.body
      : undefined;
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body,
    });
    const response = await h.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(await response.text());
    return;
  }
  res.statusCode = 500;
  res.end("Server handler not found");
}
