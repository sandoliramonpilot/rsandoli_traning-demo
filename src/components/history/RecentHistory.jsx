import { useEffect, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import HistoryItem from "@/components/history/HistoryItem";

export default function RecentHistory() {
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return undefined;
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    base44.entities.Calculation.list({ sort: "-created_date", limit: 3 })
      .then((page) => {
        if (alive) setItems(page?.items ?? page ?? []);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, isLoadingAuth]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl border border-border bg-card/60" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <HistoryIcon className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-foreground">Entre para ver o histórico</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Os cálculos salvos ficam vinculados à sua conta.
        </p>
        <button
          type="button"
          onClick={() => navigateToLogin()}
          className="mt-4 rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
        >
          Entrar
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <HistoryIcon className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-foreground">Nenhum cálculo salvo ainda</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Briefings e cálculos de altitude salvos aparecem aqui com a memória completa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}
