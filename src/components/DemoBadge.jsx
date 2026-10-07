import React, { useState } from "react";
import { Sparkles, X, Info } from "lucide-react";
import { isDemoUser, isDemoMode, SOLICITAR_VERSAO_COMPLETA_TEXT } from "@/lib/demoMode";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

/**
 * Badge discreto "VERSÃO DEMONSTRAÇÃO" exibido no cabeçalho/menu quando o
 * usuário ativo possui perfil DEMO. Inclui o modal "Solicitar versão completa".
 */
export default function DemoBadge() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  if (!isDemoMode() || !isDemoUser(user)) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/25 transition-colors"
        title="Você está utilizando a versão de demonstração"
      >
        <Sparkles className="w-3 h-3" />
        Versão Demo
      </button>
      {showModal && <SolicitarVersaoModal onClose={() => setShowModal(false)} />}
    </>
  );
}

/** Marca d'água discreta fixa no canto das páginas internas (perfil DEMO). */
export function DemoWatermark() {
  const { user } = useAuth();
  if (!isDemoMode() || !isDemoUser(user)) return null;
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-30 select-none">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-700/50">
        Versão Demonstração
      </span>
    </div>
  );
}

function SolicitarVersaoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1A1D25] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Info className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-100">Conheça a versão completa</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-700/40">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{SOLICITAR_VERSAO_COMPLETA_TEXT}</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-700/60 bg-[#12141A]">
          <Button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900">
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}