import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { SkeletonRows } from "../../components/ui/Skeleton";
import FarmerForm from "./FarmerForm";
import { getFarmers } from "../../api/farmers";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import { CROP_SUGGESTIONS, PER_PAGE } from "../../constants";

export default function Farmers() {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [ward, setWard] = useState("");
  const [crop, setCrop] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  // Wait until typing stops before asking the server
  const debouncedSearch = useDebounce(search.trim());
  const debouncedWard = useDebounce(ward.trim());
  const debouncedCrop = useDebounce(crop.trim());

  const { data, loading, error, reload } = useFetch(
    () =>
      getFarmers({
        search: debouncedSearch,
        ward: debouncedWard,
        crop: debouncedCrop,
        page,
        per_page: PER_PAGE,
      }),
    [debouncedSearch, debouncedWard, debouncedCrop, page]
  );
  const farmers = data?.items || [];
  const filtering = Boolean(search || ward || crop);

  // Any filter change goes back to page 1
  const changeFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setWard("");
    setCrop("");
    setPage(1);
  };

  const handleSaved = (farmer) => {
    setFormOpen(false);
    toast.success(`${farmer.name} added`);
    navigate(`/farmers/${farmer.id}`);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.name}</span>,
    },
    { key: "phone", header: "Phone" },
    { key: "ward", header: "Ward", render: (row) => row.ward || "—" },
    { key: "main_crop", header: "Main crop", render: (row) => row.main_crop || "—" },
    {
      key: "registered_via",
      header: "Registered",
      render: (row) =>
        row.registered_via === "ussd" ? <Badge tone="green">USSD</Badge> : <Badge tone="gray">Web</Badge>,
    },
    { key: "created_at", header: "Date", render: (row) => formatDate(row.created_at), hideOnMobile: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Farmers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Farmers who registered on USSD or were added by an officer.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setFormOpen(true)}>
          Add farmer
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search farmers"
            placeholder="Search by name or phone"
            value={search}
            onChange={changeFilter(setSearch)}
            inputClassName="pl-11"
          />
        </div>
        <Input aria-label="Filter by ward" placeholder="Ward" value={ward} onChange={changeFilter(setWard)} />
        <div>
          <Input
            aria-label="Filter by crop"
            placeholder="Crop"
            list="farmer-filter-crops"
            value={crop}
            onChange={changeFilter(setCrop)}
          />
          <datalist id="farmer-filter-crops">
            {CROP_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
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
        ) : farmers.length === 0 ? (
          filtering ? (
            <EmptyState
              icon={Search}
              title="No farmers match"
              message="Try a different name, phone number, ward or crop."
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No farmers yet"
              message="Farmers appear here when they register on USSD, or when you add them."
              action={<Button icon={Plus} onClick={() => setFormOpen(true)}>Add farmer</Button>}
            />
          )
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <Table columns={columns} rows={farmers} onRowClick={(row) => navigate(`/farmers/${row.id}`)} />
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "farmer" : "farmers"}
            />
          </div>
        )}
      </div>

      <FarmerForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
    </div>
  );
}