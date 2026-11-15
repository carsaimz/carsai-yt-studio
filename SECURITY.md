# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 3.x | ✅ |
| < 3.0 | ❌ |

## Reporting a vulnerability

Por favor **não** abra uma issue pública para vulnerabilidades.

Reporta via GitHub Security Advisory ("Report a vulnerability" no separador Security) ou numa issue marcada como privada. Respondemos normalmente em 72 horas.

## Modelo de segurança

- **Local-first**: dados, chaves de API e regras de automação vivem apenas em `localStorage` do dispositivo
- **Sem backend**: não existe servidor intermédio a tratar chaves; as chamadas vão do cliente diretamente às APIs oficiais (CORS)
- **Electron**: `contextIsolation` ativo, `nodeIntegration` desativado, `shell.openExternal` para links externos
- **Capacitor**: `androidScheme: https`, sem mixed content

## Âmbito excluído

- XSS autogerado pelo utilizador no modo demo (dados locais)
- Vulnerabilidades dos serviços de terceiros (YouTube, Gemini, Groq…) — reporta aos respetivos programas
