import { useState } from "react";
import { Barcode, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { StatusBadge } from "../../components/ui/Badge";
import { SkeletonRows } from "../../components/ui/Skeleton";
import BatchCodeForm from "./BatchCodeForm";
import { deleteBatchCode, getBatchCodes } from "../../api/registry";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { formatDate } from "../../utils/format";
import { PER_PAGE } from "../../constants";

export default function BatchCodes() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, reload } = useFetch(() => getBatchCodes({ page, per_page: PER_PAGE }), [page]);
  const batchCodes = data?.items || [];

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (batchCode) => {
    setEditing(batchCode);
    setFormOpen(true);
  };

  const handleSaved = (saved, wasEditing) => {
    setFormOpen(false);
    setEditing(null);
    toast.success(wasEditing ? `${saved.batch_code} updated` : `${saved.batch_code} added`);
    if (!wasEditing && page !== 1) setPage(1);
    else reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBatchCode(toDelete.id);
      toast.success(`${toDelete.batch_code} removed`);
      setToDelete(null);
      // If we removed the last item on this page, go back one page
      if (batchCodes.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "batch_code",
      header: "Batch code",
      render: (row) => <span className="font-mono font-semibold tracking-wide text-slate-900">{row.batch_code}</span>,
    },
    { key: "product", header: "Product" },
    { key: "manufacturer", header: "Manufacturer" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "added_by", header: "Added by", render: (row) => row.added_by || "—", hideOnMobile: true },
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
            aria-label={`Edit ${row.batch_code}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setToDelete(row)}
            className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${row.batch_code}`}
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
          <h2 className="text-2xl font-semibold text-slate-900">Batch code registry</h2>
          <p className="mt-1 text-sm text-slate-500">
            Official batch codes from KEPHIS, PCPB or manufacturers. Farmers verify them on USSD option 9.
            {!isAdmin && " Only admins can add or change codes."}
          </p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={openAdd}>
            Add batch code
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        A code is also shown to farmers as <strong>FAKE</strong> once it gets 3 community reports on USSD, even if it
        is not in this list. See those reports under USSD Activity.
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !data ? (
          <SkeletonRows rows={5} cols={5} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : batchCodes.length === 0 ? (
          <EmptyState
            icon={Barcode}
            title="No batch codes yet"
            message={
              isAdmin
                ? "Add batch codes from official records so farmers can check inputs before buying."
                : "An admin has not added any batch codes yet."
            }
            action={isAdmin && <Button icon={Plus} onClick={openAdd}>Add batch code</Button>}
          />
        ) : (
          <>
            <Table columns={columns} rows={batchCodes} />
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "batch code" : "batch codes"}
            />
          </>
        )}
      </div>

      {isAdmin && (
        <>
          <BatchCodeForm
            open={formOpen}
            batchCode={editing}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSaved={handleSaved}
          />
          <ConfirmDialog
            open={Boolean(toDelete)}
            title="Remove batch code?"
            message={
              toDelete
                ? `${toDelete.batch_code} will be removed from the registry. Farmers checking it on USSD will see "not in our records" unless it has 3 or more community reports.`
                : ""
            }
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