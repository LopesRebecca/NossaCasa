import { useState } from "react";
import { FileCheck2, FileClock, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import {
  AddButton,
  Badge,
  Empty,
  Field,
  FormGrid,
  Modal,
  PageHeader,
  RowActions,
  SearchBox,
  statusTone,
} from "../components";
import { shortDate, uid } from "../lib";
import { useStore } from "../store";
import type { HouseDocument } from "../types";
const blank = (): HouseDocument => ({
  id: uid(),
  name: "",
  category: "Caixa",
  status: "Pendente",
  sentDate: "",
  expiryDate: "",
  owner: "As duas",
  file: "",
  notes: "",
});
export function DocumentsPage() {
  const { data, setData } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(blank());
  const list = data.documents.filter(
    (i) =>
      (filter === "Todos" || i.status === filter) &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );
  const attention = data.documents.filter(
    (i) => i.status === "Pendente" || i.status === "Vencido",
  ).length;
  const save = () => {
    setData((d) => ({
      ...d,
      documents: d.documents.some((x) => x.id === item.id)
        ? d.documents.map((x) => (x.id === item.id ? item : x))
        : [...d.documents, item],
    }));
    setOpen(false);
    toast.success("Documento salvo");
  };
  return (
    <>
      <PageHeader
        eyebrow="Arquivo da casa"
        title="Documentos"
        description="Contratos, certidões e comprovantes com status, validade e responsável."
        action={
          <AddButton
            onClick={() => {
              setItem(blank());
              setOpen(true);
            }}
          >
            Novo documento
          </AddButton>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <FolderOpen className="text-sage-500" />
          <div>
            <p className="text-2xl font-bold">{data.documents.length}</p>
            <p className="text-xs text-slate-500">Documentos cadastrados</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <FileCheck2 className="text-sky-600" />
          <div>
            <p className="text-2xl font-bold">
              {data.documents.filter((i) => i.status === "Aprovado").length}
            </p>
            <p className="text-xs text-slate-500">Aprovados</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <FileClock className="text-amber-600" />
          <div>
            <p className="text-2xl font-bold">{attention}</p>
            <p className="text-xs text-slate-500">Pedem atenção</p>
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar documento..."
        />
        <select
          className="field md:w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>Todos</option>
          {["Pendente", "Enviado", "Aprovado", "Recusado", "Vencido"].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </select>
      </div>
      <div className="table-wrap">
        {list.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Envio</th>
                <th>Validade</th>
                <th>Responsável</th>
                <th>Arquivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id}>
                  <td className="font-semibold">{i.name}</td>
                  <td>{i.category}</td>
                  <td>
                    <Badge tone={statusTone(i.status)}>{i.status}</Badge>
                  </td>
                  <td>{shortDate(i.sentDate)}</td>
                  <td>{shortDate(i.expiryDate)}</td>
                  <td>{i.owner}</td>
                  <td>
                    {i.file ? (
                      <a className="font-semibold text-sage-700" href={i.file}>
                        Abrir
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <RowActions
                      onEdit={() => {
                        setItem(i);
                        setOpen(true);
                      }}
                      onDelete={() =>
                        setData((d) => ({
                          ...d,
                          documents: d.documents.filter((x) => x.id !== i.id),
                        }))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty />
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Documento">
        <FormGrid>
          <Field label="Documento">
            <input
              className="field"
              value={item.name}
              onChange={(e) => setItem((x) => ({ ...x, name: e.target.value }))}
            />
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
                "Caixa",
                "Cartório",
                "Imóvel",
                "Pessoal",
                "Obra",
                "Compra",
                "Outros",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className="field"
              value={item.status}
              onChange={(e) =>
                setItem((x) => ({ ...x, status: e.target.value }))
              }
            >
              {["Pendente", "Enviado", "Aprovado", "Recusado", "Vencido"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="Responsável">
            <select
              className="field"
              value={item.owner}
              onChange={(e) =>
                setItem((x) => ({
                  ...x,
                  owner: e.target.value as HouseDocument["owner"],
                }))
              }
            >
              {["Rebecca", "Naelly", "As duas"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Data de envio">
            <input
              className="field"
              type="date"
              value={item.sentDate}
              onChange={(e) =>
                setItem((x) => ({ ...x, sentDate: e.target.value }))
              }
            />
          </Field>
          <Field label="Validade">
            <input
              className="field"
              type="date"
              value={item.expiryDate}
              onChange={(e) =>
                setItem((x) => ({ ...x, expiryDate: e.target.value }))
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Arquivo / link">
              <input
                className="field"
                value={item.file}
                onChange={(e) =>
                  setItem((x) => ({ ...x, file: e.target.value }))
                }
              />
            </Field>
          </div>
        </FormGrid>
        <div className="mt-5 flex justify-end">
          <button className="btn-primary" onClick={save}>
            Salvar documento
          </button>
        </div>
      </Modal>
    </>
  );
}
