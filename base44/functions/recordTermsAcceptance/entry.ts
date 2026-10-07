import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

// Registra o aceite dos Termos de Uso e Responsabilidade (pop-up obrigatório
// exibido antes da tela de login). Funciona sem autenticação — o aceite ocorre
// antes do login — e grava um log de auditoria com data/hora, IP e dispositivo
// (User-Agent) quando disponíveis. A validação visual no frontend NÃO é a única
// comprovação: este registro persistente serve como evidência de auditoria.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Tenta identificar o usuário quando já autenticado (aceite pós-login em
    // fluxos alternativos). Não exige autenticação — o aceite principal é pré-login.
    let actor = null;
    try {
      actor = await base44.auth.me();
    } catch {}

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") || null);
    const userAgent = req.headers.get("user-agent") || null;

    const now = new Date().toISOString();
    const details = [
      `Aceite em ${now}`,
      ip ? `IP: ${ip}` : "IP: indisponível",
      userAgent ? `Dispositivo: ${userAgent.slice(0, 160)}` : "Dispositivo: indisponível",
      actor ? `Usuário: ${actor.email || actor.id}` : "Usuário: não autenticado (pré-login)",
    ].join(" | ");

    await base44.asServiceRole.entities.AccessAuditLog.create({
      actor_user_id: actor?.id || null,
      actor_name: actor?.full_name || actor?.email || "Visitante (pré-login)",
      target_user_id: null,
      target_name: null,
      action: "Aceite dos Termos de Uso",
      details,
      created_at: now,
      session_info: userAgent ? userAgent.slice(0, 200) : null,
    });

    return Response.json({ ok: true, accepted_at: now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}