import { useMemo, useState } from "react";
import {
  CheckCircle2,
  PackageOpen,
  PiggyBank,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { rooms } from "../data";
import {
  AddButton,
  Badge,
  Empty,
  Field,
  FormGrid,
  Metric,
  Modal,
  PageHeader,
  RowActions,
  SearchBox,
  priorityTone,
  statusTone,
  Tabs,
} from "../components";
import { money, uid } from "../lib";
import { useStore } from "../store";
import type { ShoppingItem } from "../types";

const blank = (): ShoppingItem => ({
  id: uid(),
  name: "",
  room: "Sala",
  category: "Móvel",
  estimated: 0,
  actual: 0,
  store: "",
  link: "",
  priority: "Média",
  status: "Quero comprar",
  purchased: false,
  owner: "As duas",
  purchaseDate: "",
  notes: "",
});

const priorityRank: Record<ShoppingItem["priority"], number> = {
  Alta: 0,
  "Média": 1,
  Baixa: 2,
};

export function ShoppingPage() {
  const { data, setData } = useStore();
  const [room, setRoom] = useState("Todos");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(blank());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const items = useMemo(
    () =>
      data.shopping
        .filter(
          (i) =>
            (room === "Todos" || i.room === room) &&
            (priority === "Todas" || i.priority === priority) &&
            (status === "Todos" || i.status === status) &&
            i.name.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => {
          const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
          if (byPriority !== 0) return byPriority;
          const byRoom = a.room.localeCompare(b.room, "pt-BR");
          if (byRoom !== 0) return byRoom;
          return a.name.localeCompare(b.name, "pt-BR");
        }),
    [data.shopping, room, priority, status, search],
  );
  const bought = data.shopping.filter((i) => i.purchased);
  const estimated = data.shopping.reduce((s, i) => s + i.estimated, 0);
  const actual = bought.reduce((s, i) => s + (i.actual || i.estimated), 0);
  const progress =
    Math.round((bought.length / data.shopping.length) * 100) || 0;
  const allVisibleSelected =
    items.length > 0 && items.every((i) => selected.has(i.id));
  const selectedVisible = items.filter((i) => selected.has(i.id)).length;
  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) items.forEach((i) => next.delete(i.id));
      else items.forEach((i) => next.add(i.id));
      return next;
    });
  const save = () => {
    const normalized = {
      ...item,
      purchased:
        item.purchased ||
        ["Comprado", "Entregue", "Montado"].includes(item.status),
    };
    setData((d) => ({
      ...d,
      shopping: d.shopping.some((x) => x.id === item.id)
        ? d.shopping.map((x) => (x.id === item.id ? normalized : x))
        : [...d.shopping, normalized],
    }));
    setOpen(false);
    toast.success("Item do enxoval salvo");
  };
  const confirmDelete = () => {
    const ids = new Set(pendingDelete);
    setData((d) => ({
      ...d,
      shopping: d.shopping.filter((i) => !ids.has(i.id)),
    }));
    setSelected((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(
      pendingDelete.length === 1
        ? "Item excluído"
        : `${pendingDelete.length} itens excluídos`,
    );
    setPendingDelete([]);
  };
  return (
    <>
      <PageHeader
        eyebrow="Lista por cômodo e prioridade"
        title="Enxoval"
        description="Planejem, pesquisem e marquem cada conquista — do primeiro copo ao sofá."
        action={
          <AddButton
            onClick={() => {
              setItem(blank());
              setOpen(true);
            }}
          >
            Novo item
          </AddButton>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Previsão total"
          value={money(estimated)}
          icon={<PiggyBank size={19} />}
        />
        <Metric
          label="Valor realizado"
          value={money(actual)}
          icon={<ShoppingBag size={19} />}
          tone="rose"
        />
        <Metric
          label="Itens comprados"
          value={`${bought.length} de ${data.shopping.length}`}
          icon={<CheckCircle2 size={19} />}
          tone="blue"
        />
        <Metric
          label="Progresso geral"
          value={`${progress}%`}
          icon={<PackageOpen size={19} />}
          detail={`${money(Math.max(0, estimated - actual))} de previsão restante`}
          tone="sand"
        />
      </div>
      <div className="my-5">
        <Tabs items={["Todos", ...rooms]} value={room} onChange={setRoom} />
      </div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar item..."
        />
        <select
          className="field md:w-44"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Todas</option>
          <option>Alta</option>
          <option>Média</option>
          <option>Baixa</option>
        </select>
        <select
          className="field md:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Todos</option>
          {[
            "Quero comprar",
            "Pesquisando",
            "Comprado",
            "Entregue",
            "Montado",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-col items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-3 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-red-800">
            {selected.size}{" "}
            {selected.size === 1 ? "item selecionado" : "itens selecionados"}
            {selectedVisible !== selected.size && (
              <span className="font-normal text-red-600">
                {" "}
                • {selectedVisible} visíveis neste filtro
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              className="btn-secondary py-2"
              onClick={() => setSelected(new Set())}
            >
              Limpar seleção
            </button>
            <button
              className="btn bg-red-600 py-2 text-white hover:bg-red-700"
              onClick={() => setPendingDelete([...selected])}
            >
              <Trash2 size={16} />
              Excluir selecionados
            </button>
          </div>
        </div>
      )}
      <div className="table-wrap">
        {items.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    aria-label="Selecionar todos os itens filtrados"
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-sage-700"
                  />
                </th>
                <th>Item</th>
                <th>Cômodo</th>
                <th>Prioridade</th>
                <th>Estimado</th>
                <th>Real</th>
                <th>Status</th>
                <th>Responsável</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  key={i.id}
                  className={selected.has(i.id) ? "bg-sage-50/60" : ""}
                >
                  <td>
                    <input
                      aria-label={`Selecionar ${i.name}`}
                      type="checkbox"
                      checked={selected.has(i.id)}
                      onChange={() => toggle(i.id)}
                      className="h-4 w-4 accent-sage-700"
                    />
                  </td>
                  <td>
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-xs text-slate-400">{i.category}</p>
                  </td>
                  <td>{i.room}</td>
                  <td>
                    <Badge tone={priorityTone(i.priority)}>{i.priority}</Badge>
                  </td>
                  <td>{money(i.estimated)}</td>
                  <td>{i.actual ? money(i.actual) : "—"}</td>
                  <td>
                    <button
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          shopping: d.shopping.map((x) =>
                            x.id === i.id
                              ? {
                                  ...x,
                                  purchased: !x.purchased,
                                  status: !x.purchased
                                    ? "Comprado"
                                    : "Quero comprar",
                                }
                              : x,
                          ),
                        }))
                      }
                    >
                      <Badge tone={statusTone(i.status)}>{i.status}</Badge>
                    </button>
                  </td>
                  <td>{i.owner}</td>
                  <td>
                    <RowActions
                      onEdit={() => {
                        setItem(i);
                        setOpen(true);
                      }}
                      onDelete={() => setPendingDelete([i.id])}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty
            title="Nenhum item encontrado"
            description="Ajuste os filtros ou adicione um novo item."
          />
        )}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Item do enxoval"
        wide
      >
        <FormGrid>
          <Field label="Item">
            <input
              className="field"
              value={item.name}
              onChange={(e) => setItem((x) => ({ ...x, name: e.target.value }))}
            />
          </Field>
          <Field label="Cômodo">
            <select
              className="field"
              value={item.room}
              onChange={(e) => setItem((x) => ({ ...x, room: e.target.value }))}
            >
              {rooms.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Categoria">
            <select
              className="field"
              value={item.category}
              onChange={(e) =>
                setItem((x) => ({ ...x, category: e.target.value }))
              }
            >
              {[
                "Móvel",
                "Eletrodoméstico",
                "Decoração",
                "Utensílio",
                "Organização",
                "Limpeza",
                "Tecnologia",
                "Outro",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select
              className="field"
              value={item.priority}
              onChange={(e) =>
                setItem((x) => ({
                  ...x,
                  priority: e.target.value as ShoppingItem["priority"],
                }))
              }
            >
              {["Alta", "Média", "Baixa"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Valor estimado">
            <input
              className="field"
              type="number"
              value={item.estimated}
              onChange={(e) =>
                setItem((x) => ({ ...x, estimated: +e.target.value }))
              }
            />
          </Field>
          <Field label="Valor real">
            <input
              className="field"
              type="number"
              value={item.actual}
              onChange={(e) =>
                setItem((x) => ({ ...x, actual: +e.target.value }))
              }
            />
          </Field>
          <Field label="Loja">
            <input
              className="field"
              value={item.store}
              onChange={(e) =>
                setItem((x) => ({ ...x, store: e.target.value }))
              }
            />
          </Field>
          <Field label="Link do produto">
            <input
              className="field"
              value={item.link}
              onChange={(e) => setItem((x) => ({ ...x, link: e.target.value }))}
            />
          </Field>
          <Field label="Status">
            <select
              className="field"
              value={item.status}
              onChange={(e) =>
                setItem((x) => ({
                  ...x,
                  status: e.target.value as ShoppingItem["status"],
                }))
              }
            >
              {[
                "Quero comprar",
                "Pesquisando",
                "Comprado",
                "Entregue",
                "Montado",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Responsável">
            <select
              className="field"
              value={item.owner}
              onChange={(e) =>
                setItem((x) => ({
                  ...x,
                  owner: e.target.value as ShoppingItem["owner"],
                }))
              }
            >
              {["Rebecca", "Naelly", "As duas"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Data da compra">
            <input
              className="field"
              type="date"
              value={item.purchaseDate}
              onChange={(e) =>
                setItem((x) => ({ ...x, purchaseDate: e.target.value }))
              }
            />
          </Field>
          <Field label="Comprado?">
            <select
              className="field"
              value={item.purchased ? "Sim" : "Não"}
              onChange={(e) =>
                setItem((x) => ({ ...x, purchased: e.target.value === "Sim" }))
              }
            >
              <option>Não</option>
              <option>Sim</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Observações">
              <textarea
                className="field"
                value={item.notes}
                onChange={(e) =>
                  setItem((x) => ({ ...x, notes: e.target.value }))
                }
              />
            </Field>
          </div>
        </FormGrid>
        <div className="mt-5 flex justify-end">
          <button className="btn-primary" onClick={save}>
            Salvar item
          </button>
        </div>
      </Modal>
      <Modal
        open={pendingDelete.length > 0}
        onClose={() => setPendingDelete([])}
        title="Confirmar exclusão"
      >
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700">
              <Trash2 size={19} />
            </div>
            <div>
              <p className="font-semibold text-red-900">
                {pendingDelete.length === 1
                  ? "Excluir este item?"
                  : `Excluir ${pendingDelete.length} itens?`}
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                Esta ação será aplicada ao Supabase e não poderá ser desfeita.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="btn-secondary"
            onClick={() => setPendingDelete([])}
          >
            Cancelar
          </button>
          <button
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={confirmDelete}
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </Modal>
    </>
  );
}
