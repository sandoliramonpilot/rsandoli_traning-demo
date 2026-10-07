import React, { useState, useEffect } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "rsandoli_terms_accepted";

const TERMS_TEXT = [
  "O aplicativo #RSANDOLI PILOTS Helicopter Training foi desenvolvido exclusivamente para fins de instrução, treinamento teórico, capacitação e aperfeiçoamento profissional de pilotos e tripulantes.",
  "A formatação, a organização visual, a interface gráfica e o layout deste aplicativo foram desenvolvidos com o auxílio de ferramentas de Inteligência Artificial, sob supervisão humana especializada.",
  "Todo o conteúdo técnico, operacional e instrucional foi elaborado, validado e revisado por instrutor qualificado, com base nas publicações oficiais, manuais e documentos técnicos aplicáveis.",
  "Este aplicativo possui caráter exclusivamente educacional e não substitui, em nenhuma circunstância, os manuais aprovados da aeronave, o POH, AFM, FCOM, QRH, checklists, boletins, diretrizes do fabricante, regulamentações da ANAC ou quaisquer outras publicações oficiais vigentes.",
  "Em caso de divergência entre as informações aqui apresentadas e a documentação oficial aplicável, prevalecerá sempre a publicação oficial mais atualizada.",
  "O uso deste aplicativo implica na concordância com estes termos e no reconhecimento de que o usuário permanece integralmente responsável pela consulta e utilização das publicações oficiais exigidas para a operação da aeronave.",
  "Este aplicativo é uma ferramenta independente e não possui vínculo, patrocínio, certificação ou aprovação da Leonardo Helicopters ou de qualquer outro fabricante.",
  "© RSANDOLI - Serviços de Pilotos de Aeronave Ltda. Todos os direitos autorais, de propriedade intelectual, conteúdo, identidade visual e materiais instrucionais são reservados. A reprodução total ou parcial sem autorização expressa é proibida.",
];

/**
 * Gate obrigatório: exibe o pop-up de Informações Legais e Técnicas antes de
 * qualquer acesso. Sem aceite, nada além do modal é renderizado. O aceite é
 * válido apenas para a sessão atual do navegador (sessionStorage) — ao fechar
 * e reabrir o aplicativo, o pop-up reaparece.
 */
export default function TermsGate({ children }) {
  const [accepted, setAccepted] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (accepted) return <>{children}</>;
  return <TermsModal onAccept={() => setAccepted(true)} />;
}

function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Bloqueia ESC e tenta impedir navegação que contorne o aceite.
  useEffect(() => {
    const blockEsc = (e) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", blockEsc);
    return () => window.removeEventListener("keydown", blockEsc);
  }, []);

  const handleAccept = async () => {
    if (!checked || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // Registra o aceite no backend (log de auditoria persistente).
      await base44.functions.invoke("recordTermsAcceptance", {}).catch(() => {});
    } catch {
      // Mesmo se o registro falhar, o aceite visual permite prosseguir —
      // o log é complementar, não bloqueante para o interessado.
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setSubmitting(false);
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto bg-[#1A1D25] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-700/60 bg-gradient-to-b from-amber-500/[0.06] to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">Informações Legais e Técnicas</h2>
              <p className="text-xs text-amber-400/80 uppercase tracking-widest font-semibold">Leitura obrigatória</p>
            </div>
          </div>
          {/* Destaques visuais */}
          <div className="flex flex-col sm:flex-row gap-2">
            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wide">
              Não substitui publicações oficiais
            </span>
            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wide">
              Exclusivamente para treinamento e instrução
            </span>
          </div>
        </div>

        {/* Texto rolável */}
        <div className="px-6 sm:px-8 py-5 max-h-[42vh] overflow-y-auto text-sm text-slate-300 space-y-3 leading-relaxed">
          {TERMS_TEXT.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Aceite + botão */}
        <div className="px-6 sm:px-8 py-5 border-t border-slate-700/60 bg-[#12141A]">
          {error && <div className="mb-3 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
          <label className="flex items-start gap-3 cursor-pointer select-none mb-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/40 shrink-0"
            />
            <span className="text-sm text-slate-200">
              Li e concordo com as <strong className="text-slate-100">Informações Legais e Técnicas</strong>.
            </span>
          </label>
          <Button
            onClick={handleAccept}
            disabled={!checked || submitting}
            className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              "CONCORDO"
            )}
          </Button>
          <p className="mt-3 text-center text-[11px] text-slate-600">
            Não é possível prosseguir sem concordar com os termos.
          </p>
        </div>
      </div>
    </div>
  );
}