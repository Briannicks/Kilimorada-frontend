import { useState } from "react";
import { UserCog, Users as UsersIcon } from "lucide-react";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { changeRole, getUsers } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { formatDate } from "../../utils/format";
import { PER_PAGE, ROLE_OPTIONS } from "../../constants";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Admin only (the route is wrapped in AdminRoute, and the server checks too)
export default function Users() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // { user, role } waiting for confirmation
  const [saving, setSaving] = useState(false);

  const { data, setData, loading, error, reload } = useFetch(() => getUsers({ page, per_page: PER_PAGE }), [page]);
  const users = data?.items || [];

  const confirmChange = async () => {
    setSaving(true);
    try {
      const updated = await changeRole(pending.user.id, pending.role);
      setData((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updated.id ? updated : item)),
      }));
      toast.success(`${updated.name} is now ${updated.role === "admin" ? "an admin" : "an officer"}`);
      setPending(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img src={row.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-700">
              {initials(row.name)}
            </span>
          )}
          <div className="min-w-0 text-left">
            <p className="flex items-center gap-2 font-semibold text-slate-900">
              {row.name}
              {row.id === me?.id && <Badge tone="green">You</Badge>}
            </p>
            <p className="truncate text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <div className="w-40">
          <Select
            aria-label={`Role for ${row.name}`}
            options={ROLE_OPTIONS}
            value={row.role}
            disabled={row.id === me?.id}
            title={row.id === me?.id ? "You cannot change your own role" : undefined}
            onChange={(event) => setPending({ user: row, role: event.target.value })}
          />
        </div>
      ),
    },
    { key: "created_at", header: "Joined", render: (row) => formatDate(row.created_at) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
        <p className="mt-1 text-sm text-slate-500">
          Staff accounts. New sign-ups join as officers; make someone an admin to let them manage users,
          agrovets and batch codes, and delete records.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !data ? (
          <SkeletonRows rows={5} cols={3} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users yet" message="Staff who sign up will appear here." />
        ) : (
          <>
            <Table columns={columns} rows={users} />
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "user" : "users"}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        danger={pending?.role === "officer"}
        title={pending?.role === "admin" ? "Make this user an admin?" : "Remove admin rights?"}
        message={
          pending
            ? pending.role === "admin"
              ? `${pending.user.name} will be able to manage users, agrovets and batch codes, and delete farmers and reports.`
              : `${pending.user.name} will become an officer and lose admin rights.`
            : ""
        }
        confirmLabel={pending?.role === "admin" ? "Make admin" : "Make officer"}
        loading={saving}
        onConfirm={confirmChange}
        onCancel={() => setPending(null)}
      />

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <UserCog className="h-3.5 w-3.5" /> You cannot change your own role. Ask another admin.
      </p>
    </div>
  );
}