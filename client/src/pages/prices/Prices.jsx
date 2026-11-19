import { useState } from "react";
import { Info, Lock, Pencil, Plus, Search, Trash2, TrendingUp, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonRows } from "../../components/ui/Skeleton";
import PriceForm, { itemName } from "./PriceForm";
import { deletePrice, getPrices } from "../../api/prices";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import { formatKES, timeAgo } from "../../utils/format";
import { PER_PAGE, PRICE_SELECT_GROUPS, priceCategory } from "../../constants";

export default function Prices() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [item, setItem] = useState("");
  const [market, setMarket] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedMarket = useDebounce(market.trim());

  const { data, loading, error, reload } = useFetch(
    () => getPrices({ crop: item, market: debouncedMarket, page, per_page: PER_PAGE }),
    [item, debouncedMarket, page]
  );
  const prices = data?.items || [];
  const filtering = Boolean(item || market);

  // Only the officer who posted a price, or an admin, can change it (the server checks too)
  const canEdit = (price) => isAdmin || price.user_id === user?.id;

  const clearFilters = () => {
    setItem("");
    setMarket("");
    setPage(1);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (price) => {
    setEditing(price);
    setFormOpen(true);
  };

  const handleSaved = (saved, wasEditing) => {
    setFormOpen(false);
    setEditing(null);
    toast.success(`${itemName(saved.crop)} price ${wasEditing ? "updated" : "posted"}`);
    if (!wasEditing && page !== 1) setPage(1);
    else reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePrice(toDelete.id);
      toast.success(`${itemName(toDelete.crop)} price removed`);
      setToDelete(null);
      if (prices.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "crop",
      header: "Item",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{itemName(row.crop)}</span>
          <Badge tone="gray">{priceCategory(row.crop)}</Badge>
        </div>
      ),
    },
    { key: "market", header: "Market" },
    { key: "unit", header: "Unit" },
    {
      key: "price",
      header: "Price",
      render: (row) => <span className="font-semibold text-slate-900">{formatKES(row.price)}</span>,
    },
    {
      key: "posted_by",
      header: "Posted by",
      hideOnMobile: true,
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          {row.posted_by || "—"}
          {row.user_id === user?.id && <Badge tone="green">You</Badge>}
        </span>
      ),
    },
    { key: "updated_at", header: "Updated", render: (row) => timeAgo(row.updated_at) },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      render: (row) =>
        canEdit(row) ? (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label={`Edit ${itemName(row.crop)} price`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setToDelete(row)}
              className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${itemName(row.crop)} price`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> View only
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Market prices</h2>
          <p className="mt-1 text-sm text-slate-500">Input, fuel and produce prices for farmers.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add market price
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Prices posted here are what farmers see on USSD options 1 to 4 (Fertilizer, Seeds, Fuel and Market Prices).
          The three most recent prices for each item are shown. Only post prices you have checked.
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Select
          aria-label="Filter by item"
          placeholder="All items"
          groups={PRICE_SELECT_GROUPS}
          value={item}
          onChange={(event) => {
            setItem(event.target.value);
            setPage(1);
          }}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Filter by market"
            placeholder="Market, e.g. Nakuru"
            value={market}
            onChange={(event) => {
              setMarket(event.target.value);
              setPage(1);
            }}
            inputClassName="pl-11"
          />
        </div>
        {filtering ? (
          <Button variant="ghost" icon={X} onClick={clearFilters}>
            Clear
          </Button>
        ) : (
          <span className="hidden sm:block sm:w-20" />
        )}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !data ? (
          <SkeletonRows rows={6} cols={5} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : prices.length === 0 ? (
          filtering ? (
            <EmptyState
              icon={Search}
              title="No prices match"
              message="Try a different item or market."
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No prices posted yet"
              message="Until prices are posted, farmers see 'No price posted yet' on USSD."
              action={<Button icon={Plus} onClick={openAdd}>Add market price</Button>}
            />
          )
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <Table columns={columns} rows={prices} />
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "price" : "prices"}
            />
          </div>
        )}
      </div>

      <PriceForm
        open={formOpen}
        price={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove price?"
        message={
          toDelete
            ? `${itemName(toDelete.crop)} at ${toDelete.market} (${formatKES(toDelete.price)} per ${toDelete.unit}) will no longer be shown to farmers.`
            : ""
        }
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}