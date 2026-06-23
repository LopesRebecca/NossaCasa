import { useState } from "react";
import { ExternalLink, Image, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AddButton, Badge, Empty, Field, FormGrid, Modal, PageHeader, RowActions, priorityTone, statusTone, Tabs } from "../components";
import { uid } from "../lib";
import { useStore } from "../store";
import type { Inspiration } from "../types";

const blank = (): Inspiration => ({
  id: uid(),
  title: "",
  room: "Sala",
  category: "Decoração",
  image: "",
  priority: "Média",
  status: "Gostamos",
  notes: "",
});

export function InspirationsPage() {
  const { data, setData } = useStore();
  const rooms = data.rooms.length ? data.rooms : ["Geral"];
  const [room, setRoom] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(blank());
  const list = data.inspirations.filter((i) => room === "Todos" || i.room === room);

  const save = () => {
    setData((d) => ({
      ...d,
      inspirations: d.inspirations.some((x) => x.id === item.id)
        ? d.inspirations.map((x) => (x.id === item.id ? item : x))
        : [...d.inspirations, item],
    }));
    setOpen(false);
    toast.success("Inspiração salva");
  };

  return (
    <>
      <PageHeader
        eyebrow="Moodboard da casa"
        title="Ideias e Inspirações"
        description="Guardem referências, comparem estilos e decidam juntas o que combina com a casa."
        action={
          <AddButton
            onClick={() => {
              setItem(blank());
              setOpen(true);
            }}
          >
            Nova inspiração
          </AddButton>
        }
      />
      <div className="mb-5">
        <Tabs items={["Todos", ...rooms]} value={room} onChange={setRoom} />
      </div>
      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => (
            <article
              key={i.id}
              className="group overflow-hidden rounded-3xl border bg-white shadow-card"
            >
              <div className="relative aspect-[16/11] overflow-hidden bg-sage-50">
                {i.image ? (
                  <img
                    src={i.image}
                    alt={i.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sage-400">
                    <Image size={34} />
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <Badge tone={statusTone(i.status)}>{i.status}</Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-bold">{i.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {i.room} • {i.category}
                    </p>
                  </div>
                  <Sparkles size={18} className="text-rose-400" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{i.notes}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge tone={priorityTone(i.priority)}>Prioridade {i.priority}</Badge>
                  <RowActions
                    onEdit={() => {
                      setItem(i);
                      setOpen(true);
                    }}
                    onDelete={() =>
                      setData((d) => ({
                        ...d,
                        inspirations: d.inspirations.filter((x) => x.id !== i.id),
                      }))
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card">
          <Empty />
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Inspiração">
        <FormGrid>
          <Field label="Título">
            <input
              className="field"
              value={item.title}
              onChange={(e) => setItem((x) => ({ ...x, title: e.target.value }))}
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
            <input
              className="field"
              value={item.category}
              onChange={(e) =>
                setItem((x) => ({ ...x, category: e.target.value }))
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
                  priority: e.target.value as Inspiration["priority"],
                }))
              }
            >
              {["Alta", "Média", "Baixa"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Imagem / link">
              <div className="relative">
                <input
                  className="field pr-10"
                  value={item.image}
                  onChange={(e) => setItem((x) => ({ ...x, image: e.target.value }))}
                />
                <ExternalLink className="absolute right-3 top-3 text-slate-400" size={17} />
              </div>
            </Field>
          </div>
          <Field label="Status">
            <select
              className="field"
              value={item.status}
              onChange={(e) => setItem((x) => ({ ...x, status: e.target.value }))}
            >
              {["Gostamos", "Talvez", "Descartado", "Comprado/feito"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
        </FormGrid>
        <div className="mt-5 flex justify-end">
          <button className="btn-primary" onClick={save}>
            Salvar inspiração
          </button>
        </div>
      </Modal>
    </>
  );
}
