import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import HistoryItem from "@/components/history/HistoryItem";

export default function HistoryList({ limit = 50 }) {
  const [items, setItems] = useState(null);

  const load = useCallback(async () => {
    try {
      const page = await base44.entities.Calculation.list({ sort: "-created_date", limit });
      setItems(page?.items ?? page ?? []);
    } catch (error) {
      setItems([]);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    try {
      await base44.entities.Calculation.delete(id);
      toast.success("Cálculo excluído");
      load();
    } catch (error) {
      toast.error("Não foi possível excluir o cálculo");
    }
  };

  if (items === null) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl border border-border bg-card/60" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <p className="text-sm text-foreground">Nenhum cálculo salvo ainda</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Briefings e cálculos de altitude salvos aparecem aqui com a memória completa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} onDelete={handleDelete} />
      ))}
    </div>
  );
}
