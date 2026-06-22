import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
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
  Tabs,
} from "../components";
import { shortDate, uid } from "../lib";
import { useStore } from "../store";
import type { ChecklistItem } from "../types";

const blank = (): ChecklistItem => ({
  id: uid(),
  title: "",
  category: "Geral",
  completed: false,
  owner: "As duas",
  dueDate: "",
  priority: "Média",
  notes: "",
  position: 0,
});
export function ChecklistPage() {
  const { data, setData } = useStore();
  const [view, setView] = useState("Todos");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(blank());
  const [deleteId, setDeleteId] = useState("");
  const categories = [
    "Serviços",
    "Organização",
    "Mudança",
    "Documentação",
    "Limpeza",
    "Compras",
    "Geral",
  ];
  const completed = data.checklist.filter((i) => i.completed).length;
  const progress = Math.round((completed / data.checklist.length) * 100) || 0;
  const overdue = data.checklist.filter(
    (i) =>
      !i.completed &&
      i.dueDate &&
      i.dueDate < new Date().toISOString().slice(0, 10),
  ).length;
  const items = useMemo(
    () =>
      data.checklist
        .filter(
          (i) =>
            (view === "Todos" ||
              (view === "Pendentes" && !i.completed) ||
              (view === "Concluídos" && i.completed)) &&
            (category === "Todas" || i.category === category) &&
            i.title.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => a.position - b.position),
    [data.checklist, view, category, search],
  );
  const toggle = (id: string) => {
    setData((d) => ({
      ...d,
      checklist: d.checklist.map((i) =>
        i.id === id ? { ...i, completed: !i.completed } : i,
      ),
    }));
    toast.success("Checklist atualizado");
  };
  const save = () => {
    const value = {
      ...item,
      position: item.position || data.checklist.length + 1,
    };
    setData((d) => ({
      ...d,
      checklist: d.checklist.some((i) => i.id === value.id)
        ? d.checklist.map((i) => (i.id === value.id ? value : i))
        : [...d.checklist, value],
    }));
    setOpen(false);
    toast.success("Tarefa salva");
  };
  const remove = () => {
    setData((d) => ({
      ...d,
      checklist: d.checklist.filter((i) => i.id !== deleteId),
    }));
    setDeleteId("");
    toast.success("Tarefa excluída");
  };
  return (
    <>
      <PageHeader
        eyebrow="Tudo pronto para mudar"
        title="Checklist da Mudança"
        description="Organizem serviços, documentos e tarefas essenciais até o dia da mudança."
        action={
          <AddButton
            onClick={() => {
              setItem(blank());
              setOpen(true);
            }}
          >
            Nova tarefa
          </AddButton>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Progresso"
          value={`${progress}%`}
          icon={<ClipboardCheck size={19} />}
          detail={`${completed} de ${data.checklist.length} concluídas`}
        />
        <Metric
          label="Pendentes"
          value={String(data.checklist.length - completed)}
          icon={<ListChecks size={19} />}
          tone="blue"
        />
        <Metric
          label="Concluídas"
          value={String(completed)}
          icon={<CheckCircle2 size={19} />}
          tone="rose"
        />
        <Metric
          label="Atrasadas"
          value={String(overdue)}
          icon={<Clock3 size={19} />}
          tone="sand"
        />
      </div>
      <div className="card my-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">Progresso geral da mudança</span>
          <span className="text-slate-500">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sage-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar tarefa..."
        />
        <Tabs
          items={["Todos", "Pendentes", "Concluídos"]}
          value={view}
          onChange={setView}
        />
        <select
          className="field lg:w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Todas</option>
          {categories.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((i) => (
            <div
              key={i.id}
              className={`card flex items-center gap-4 p-4 ${i.completed ? "opacity-65" : ""}`}
            >
              <button
                onClick={() => toggle(i.id)}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${i.completed ? "bg-sage-600 text-white" : "border-2 text-transparent hover:border-sage-400"}`}
              >
                {i.completed ? <Check size={18} /> : <Circle size={15} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`font-semibold ${i.completed ? "line-through" : ""}`}
                  >
                    {i.title}
                  </p>
                  <Badge tone={priorityTone(i.priority)}>{i.priority}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {i.category} • {i.owner}
                  {i.dueDate ? ` • até ${shortDate(i.dueDate)}` : ""}
                </p>
                {i.notes && (
                  <p className="mt-2 text-sm text-slate-500">{i.notes}</p>
                )}
              </div>
              <RowActions
                onEdit={() => {
                  setItem(i);
                  setOpen(true);
                }}
                onDelete={() => setDeleteId(i.id)}
              />
            </div>
          ))
        ) : (
          <div className="card">
            <Empty
              title="Nenhuma tarefa encontrada"
              description="Ajuste os filtros ou adicione uma tarefa."
            />
          </div>
        )}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tarefa do checklist"
      >
        <FormGrid>
          <div className="sm:col-span-2">
            <Field label="Tarefa">
              <input
                className="field"
                value={item.title}
                onChange={(e) =>
                  setItem((x) => ({ ...x, title: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Categoria">
            <select
              className="field"
              value={item.category}
              onChange={(e) =>
                setItem((x) => ({ ...x, category: e.target.value }))
              }
            >
              {categories.map((x) => (
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
                  owner: e.target.value as ChecklistItem["owner"],
                }))
              }
            >
              {["Rebecca", "Naelly", "As duas"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Prazo">
            <input
              className="field"
              type="date"
              value={item.dueDate}
              onChange={(e) =>
                setItem((x) => ({ ...x, dueDate: e.target.value }))
              }
            />
          </Field>
          <Field label="Prioridade">
            <select
              className="field"
              value={item.priority}
              onChange={(e) =>
                setItem((x) => ({
                  ...x,
                  priority: e.target.value as ChecklistItem["priority"],
                }))
              }
            >
              {["Alta", "Média", "Baixa"].map((x) => (
                <option key={x}>{x}</option>
              ))}
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
            Salvar tarefa
          </button>
        </div>
      </Modal>
      <Modal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId("")}
        title="Excluir tarefa?"
      >
        <p className="text-sm leading-6 text-slate-600">
          Esta tarefa será removida da casa compartilhada e não poderá ser
          recuperada.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setDeleteId("")}>
            Cancelar
          </button>
          <button className="btn bg-red-600 text-white" onClick={remove}>
            Excluir
          </button>
        </div>
      </Modal>
    </>
  );
}
