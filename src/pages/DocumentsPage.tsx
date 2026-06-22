import { useState } from "react";
import { FileCheck2, FileClock, FolderOpen, Upload } from "lucide-react";
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
import { fileNameFromUrl, shortDate, uid } from "../lib";
import { supabase } from "../supabase";
import { useStore } from "../store";
import type { HouseDocument } from "../types";

const bucket =
  import.meta.env.VITE_SUPABASE_DOCUMENTS_BUCKET || "house-documents";

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

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fileExtension = (file: File) => {
  const name = file.name.trim();
  const parts = name.split(".");
  if (parts.length < 2) return "";
  return `.${parts.pop()}`;
};

async function uploadDocumentFile(file: File, houseName: string, documentId: string) {
  if (!supabase) throw new Error("Supabase n\u00e3o configurado");
  const safeHouse = slugify(houseName) || "nossa-casa";
  const path = `houses/${safeHouse}/documents/${documentId}-${Date.now()}${fileExtension(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
  });
  if (error) {
    if (error.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        `Bucket "${bucket}" não encontrado no Supabase. Crie esse bucket ou ajuste VITE_SUPABASE_DOCUMENTS_BUCKET.`,
      );
    }
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function DocumentsPage() {
  const { data, setData } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(blank());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const list = data.documents.filter(
    (i) =>
      (filter === "Todos" || i.status === filter) &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );
  const attention = data.documents.filter(
    (i) => i.status === "Pendente" || i.status === "Vencido",
  ).length;

  const closeModal = () => {
    setOpen(false);
    setSelectedFile(null);
    setUploading(false);
  };

  const save = async () => {
    try {
      setUploading(true);
      let fileUrl = item.file;
      if (selectedFile) {
        fileUrl = await uploadDocumentFile(selectedFile, data.house.name, item.id);
      }
      const nextItem = { ...item, file: fileUrl };
      setData((d) => ({
        ...d,
        documents: d.documents.some((x) => x.id === item.id)
          ? d.documents.map((x) => (x.id === item.id ? nextItem : x))
          : [...d.documents, nextItem],
      }));
      toast.success("Documento salvo");
      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar documento");
    } finally {
      setUploading(false);
    }
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
              setSelectedFile(null);
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
                      <a
                        className="font-semibold text-sage-700 hover:underline"
                        href={i.file}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {fileNameFromUrl(i.file)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <RowActions
                      onEdit={() => {
                        setItem(i);
                        setSelectedFile(null);
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
      <Modal open={open} onClose={closeModal} title="Documento">
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
            <Field label="Arquivo">
              <div className="space-y-2">
                <input
                  className="field"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-slate-500">
                  Envie PDF, imagem ou outro arquivo. O upload será salvo no
                  Supabase Storage.
                </p>
                {(selectedFile || item.file) && (
                  <div className="rounded-2xl border border-dashed border-sage-200 bg-sage-50 px-4 py-3 text-sm text-slate-600">
                    {selectedFile ? (
                      <span className="flex items-center gap-2">
                        <Upload size={16} className="text-sage-600" />
                        Novo arquivo selecionado: {selectedFile.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload size={16} className="text-sage-600" />
                        Arquivo atual: {fileNameFromUrl(item.file)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Observações">
              <textarea
                className="field min-h-24"
                value={item.notes}
                onChange={(e) => setItem((x) => ({ ...x, notes: e.target.value }))}
              />
            </Field>
          </div>
        </FormGrid>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-secondary" onClick={closeModal} type="button">
            Cancelar
          </button>
          <button className="btn-primary" onClick={save} disabled={uploading}>
            {uploading ? "Enviando..." : "Salvar documento"}
          </button>
        </div>
      </Modal>
    </>
  );
}
