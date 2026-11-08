---
name: auth-backend
description: Tocar login, tokens, refresh, logout, authenticate o authorize en be-taller. Usar cuando un cambio afecta autenticación, sesiones, roles o protección de rutas.
---

# Autenticación y autorización en be-taller

Esta skill resume cómo funciona la auth hoy y qué cuidar al cambiarla. Los valores de secretos nunca se leen ni se muestran; solo los nombres de variables.

## Flujo actual

- Login: `POST /auth/google` valida el id token de Google (`GOOGLE_CLIENT_ID`) en `src/controllers/auth.controller.ts`. Crea o actualiza el usuario y emite un access token y un refresh token.
- Access token: JWT de 30 minutos, firmado con `JWT_SECRET`, con `issuer: be-taller` y `audience: fe-taller`. Se crea en `src/services/auth.service.ts`. El payload usa `userId`.
- Refresh token: JWT de 7 días firmado con `JWT_REFRESH_SECRET`. En base se guarda solo su SHA-256 en `tokenHash`, nunca el token en claro.
- Rotación: en cada refresh, el token usado se marca `revokedAt` con `replacedBy`, y se crea uno nuevo.
- Reuso: si llega un refresh token inexistente o ya revocado, se revocan todas las sesiones activas de ese `userId` y se responde 401.
- El refresh acepta el token en cookie `refreshToken` o en body. El logout hace lo mismo y responde 204.

## Middlewares

- `src/middlewares/auth.middleware.ts` (`authenticate`): verifica el access token con `issuer` y `audience`, y pone el usuario en `req.user`.
- `src/middlewares/role.middleware.ts` (`authorize(...roles)`): compara `req.user.role` contra los roles permitidos. Roles actuales: `ADMIN` y `USER_OWNER`.
- Rutas protegidas: `authenticate` primero, luego `authorize`. Mantener ese orden.

## Cuidados al cambiar

- No cambiar el nombre del claim `userId` sin revisar todos los accesos a `req.user` y a `decoded.userId`.
- Si se agrega una ruta protegida, definir qué roles puede usarla. Considerar que hoy la autorización no filtra por dueño: no asumir que `USER_OWNER` solo ve sus datos.
- Cualquier cambio de issuer, audience, TTL o rotación es un cambio de contrato: afecta `fe-taller` (NextAuth). Usar `cross-repo-contract` y OpenSpec en `fe-taller/openspec/`.
- Los rate limits de auth (`authLimiter`) aplican hoy también a refresh y me. Si se toca, aclararlo en el cambio.

## Bugs conocidos (no corregir sin pedido)

1. `GET /auth/me` probablemente responde 500: el controller lee `req.user!.id` y el JWT firma `userId`.
2. El refresh verifica sin `issuer` ni `audience`, aunque se firma con ellos.
3. Autorización plana: todas las rutas usan `authorize("ADMIN","USER_OWNER")` sin filtro por dueño. Cada login de Google crea `USER_OWNER` sin allowlist.
4. `authLimiter` (10/min por IP) se aplica a `/auth/refresh` y `/auth/me`.
5. `.agents/skills/auth-skill/SKILL.md` (Copilot) dice que el refresh es solo por cookie; el código también acepta body. No editar `.agents/` desde una tarea normal.

Si una tarea toca un bug de esta lista, decirlo en el cambio y pedir confirmación antes de arreglar fuera de alcance.

## Antes de cerrar

1. Ejecutar `verify-be` (type-check y build).
2. Revisar el JSDoc Swagger de las rutas de auth tocadas. Hoy faltan docs de auth (ver `be-taller/CLAUDE.md`).
3. No probar contra bases reales con tokens de producción. No ejecutar migraciones sin confirmación.

## Reporte

Indicar qué flujo cambió (login, refresh, logout, middleware), qué comandos corrieron y su resultado. No declarar que la auth funciona sin probarla.
