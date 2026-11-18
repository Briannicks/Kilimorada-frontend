import { useState } from "react";
import { Pencil, Plus, Store, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonRows } from "../../components/ui/Skeleton";
import AgrovetForm from "./AgrovetForm";
import { deleteAgrovet, getAgrovets } from "../../api/registry";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { formatDate } from "../../utils/format";
import { PER_PAGE } from "../../constants";

export default function Agrovets() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, reload } = useFetch(() => getAgrovets({ page, per_page: PER_PAGE }), [page]);
  const agrovets = data?.items || [];

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (agrovet) => {
    setEditing(agrovet);
    setFormOpen(true);
  };

  const handleSaved = (saved, wasEditing) => {
    setFormOpen(false);
    setEditing(null);
    toast.success(wasEditing ? `${saved.name} updated` : `${saved.name} added`);
    if (!wasEditing && page !== 1) setPage(1);
    else reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAgrovet(toDelete.id);
      toast.success(`${toDelete.name} removed`);
      setToDelete(null);
      // If we removed the last item on this page, go back one page
      if (agrovets.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Shop",
      render: (row) => <span className="font-semibold text-slate-900">{row.name}</span>,
    },
    { key: "ward", header: "Ward" },
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <a href={`tel:${row.phone}`} className="text-green-700 hover:underline" onClick={(e) => e.stopPropagation()}>
          {row.phone}
        </a>
      ),
    },
    { key: "license_no", header: "Licence", render: (row) => row.license_no || "—" },
    { key: "created_at", header: "Added", render: (row) => formatDate(row.created_at), hideOnMobile: true },
  ];

  if (isAdmin) {
    columns.push({
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setToDelete(row)}
            className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Verified agrovets</h2>
          <p className="mt-1 text-sm text-slate-500">
            Farmers see the latest three shops on USSD option 7.
            {!isAdmin && " Only admins can add or change shops."}
          </p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={openAdd}>
            Add agrovet
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !data ? (
          <SkeletonRows rows={5} cols={4} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : agrovets.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No agrovets yet"
            message={
              isAdmin
                ? "Add verified shops so farmers know where to buy genuine inputs."
                : "An admin has not added any verified shops yet."
            }
            action={isAdmin && <Button icon={Plus} onClick={openAdd}>Add agrovet</Button>}
          />
        ) : (
          <>
            <Table columns={columns} rows={agrovets} />
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "agrovet" : "agrovets"}
            />
          </>
        )}
      </div>

      {isAdmin && (
        <>
          <AgrovetForm
            open={formOpen}
            agrovet={editing}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSaved={handleSaved}
          />
          <ConfirmDialog
            open={Boolean(toDelete)}
            title="Remove agrovet?"
            message={toDelete ? `${toDelete.name} will no longer be shown to farmers on USSD.` : ""}
            confirmLabel="Remove"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
          />
        </>
      )}
    </div>
  );
}