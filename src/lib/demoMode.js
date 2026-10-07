// ============================================================================
// MODO DEMO — #RSANDOLI PILOTS Helicopter Training
// ----------------------------------------------------------------------------
// APP_MODE = "DEMO" identifica esta versão como demonstração.
// Todas as restrições abaixo aplicam-se EXCLUSIVAMENTE ao perfil "demo".
// A versão completa / usuários licenciados não são afetados por estas regras.
// ============================================================================

export const APP_MODE = "DEMO";

export const DEMO_ACCESS_LEVEL = "demo";

// Credenciais de demonstração divulgadas aos interessados.
export const DEMO_CREDENTIALS = {
  login: "DEMO",
  email: "demo@rsandoli.com",
  password: "rsandoLI298",
  accessLevel: "demo",
};

// Módulos nos quais o usuário DEMO pode criar/editar (apenas registros próprios).
export const DEMO_EDITABLE_MODULES = ["pilotos", "diario_bordo", "aeronaves", "checklists"];

// Módulos em modo somente consulta/demonstração.
export const DEMO_READONLY_MODULES = ["qrh", "biblioteca", "treinamentos", "simulados", "questoes"];

// Ações globalmente bloqueadas para o perfil DEMO.
export const DEMO_BLOCKED_ACTIONS = [
  "exportar", "download", "excluir", "administrar", "aprovar", "compartilhar", "imprimir",
];

/** Verdadeiro quando o aplicativo está rodando em modo DEMO. */
export function isDemoMode() {
  return APP_MODE === "DEMO";
}

/** Verdadeiro quando o usuário informado possui o perfil DEMO. */
export function isDemoUser(user) {
  return !!user && user.access_level === DEMO_ACCESS_LEVEL;
}

/**
 * Verifica se uma ação está bloqueada para o usuário DEMO.
 * Retorna a mensagem a exibir quando bloqueada, ou null quando permitida.
 */
export function demoBlockedMessage(user, action) {
  if (!isDemoUser(user)) return null;
  if (DEMO_BLOCKED_ACTIONS.includes(action)) {
    return "Função indisponível na versão DEMO.";
  }
  return null;
}

/** Texto padrão exibido em áreas de consulta da DEMO. */
export const DEMO_READONLY_NOTICES = {
  qrh: "Conteúdo demonstrativo. Funcionalidades completas disponíveis na versão licenciada.",
  biblioteca: "Biblioteca em modo de demonstração. Recursos completos disponíveis na versão licenciada.",
  treinamentos: "Funcionalidade demonstrativa. Recursos completos disponíveis na versão licenciada.",
  simulados: "Funcionalidade demonstrativa. Recursos completos disponíveis na versão licenciada.",
  questoes: "Funcionalidade demonstrativa. Recursos completos disponíveis na versão licenciada.",
};

/** Texto do modal "Solicitar versão completa". */
export const SOLICITAR_VERSAO_COMPLETA_TEXT =
  "Você está utilizando a versão DEMO do #RSANDOLI PILOTS Helicopter Training.\n\n" +
  "A versão completa disponibiliza todos os recursos e funcionalidades previstos para usuários licenciados.\n\n" +
  "Para informações sobre aquisição e licenciamento, entre em contato com:\n" +
  "RSANDOLI – Serviços de Pilotos de Aeronave Ltda.";