import { useState } from "react";
import { Check, Clock, UserCog, Users as UsersIcon, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { approveUser, changeRole, getUsers, rejectUser } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { formatDate, timeAgo } from "../../utils/format";
import { PER_PAGE, ROLE_OPTIONS } from "../../constants";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function Person({ row, isMe }) {
  return (
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
          {isMe && <Badge tone="green">You</Badge>}
        </p>
        <p className="truncate text-xs text-slate-500">{row.email}</p>
      </div>
    </div>
  );
}

const area = (row) => [row.ward, row.county].filter(Boolean).join(", ") || "Not set";

// Admin only (the route is wrapped in AdminRoute, and the server checks too)
export default function Users() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("active"); // "active" | "pending"
  const [page, setPage] = useState(1);
  const [roleChange, setRoleChange] = useState(null); // { user, role } waiting for confirmation
  const [rejecting, setRejecting] = useState(null); // user waiting for reject confirmation
  const [busyId, setBusyId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, setData, loading, error, reload } = useFetch(
    () => getUsers({ status: tab, page, per_page: PER_PAGE }),
    [tab, page]
  );
  const pendingCount = useFetch(() => getUsers({ status: "pending", per_page: 1 }).then((d) => d.total), []);
  const users = data?.items || [];

  const changeTab = (value) => {
    setTab(value);
    setPage(1);
  };

  const removeRow = (id) => {
    setData((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
      total: current.total - 1,
    }));
    pendingCount.setData((count) => Math.max((count || 1) - 1, 0));
  };

  const approve = async (row) => {
    setBusyId(row.id);
    try {
      await approveUser(row.id);
      removeRow(row.id);
      toast.success(`${row.name} is approved and has been emailed.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    setSaving(true);
    try {
      await rejectUser(rejecting.id);
      removeRow(rejecting.id);
      toast.success(`${rejecting.name}'s signup was rejected.`);
      setRejecting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmRoleChange = async () => {
    setSaving(true);
    try {
      const updated = await changeRole(roleChange.user.id, roleChange.role);
      setData((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === updated.id ? updated : item)),
      }));
      toast.success(`${updated.name} is now ${updated.role === "admin" ? "an admin" : "an officer"}`);
      setRoleChange(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeColumns = [
    { key: "name", header: "Name", render: (row) => <Person row={row} isMe={row.id === me?.id} /> },
    { key: "area", header: "Area", render: area },
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
            onChange={(event) => setRoleChange({ user: row, role: event.target.value })}
          />
        </div>
      ),
    },
    { key: "created_at", header: "Joined", render: (row) => formatDate(row.created_at) },
  ];

  const pendingColumns = [
    { key: "name", header: "Name", render: (row) => <Person row={row} /> },
    { key: "area", header: "Area", render: area },
    { key: "created_at", header: "Signed up", render: (row) => timeAgo(row.created_at) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" icon={X} disabled={busyId === row.id} onClick={() => setRejecting(row)}>
            Reject
          </Button>
          <Button size="sm" icon={Check} loading={busyId === row.id} onClick={() => approve(row)}>
            Approve
          </Button>
        </div>
      ),
    },
  ];

  const tabs = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Waiting for approval", count: pendingCount.data },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
        <p className="mt-1 text-sm text-slate-500">
          Officers sign up, verify their email, then wait here until you approve them. Make someone an admin to
          let them manage users, agrovets and batch codes, and delete records.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200" role="tablist">
        {tabs.map((item) => {
          const active = tab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeTab(item.value)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                active ? "border-green-700 text-green-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
              {item.count > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !data ? (
          <SkeletonRows rows={5} cols={4} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : users.length === 0 ? (
          tab === "pending" ? (
            <EmptyState icon={Clock} title="Nobody is waiting" message="New officers appear here after they verify their email." />
          ) : (
            <EmptyState icon={UsersIcon} title="No users yet" message="Approved staff will appear here." />
          )
        ) : (
          <>
            <Table columns={tab === "pending" ? pendingColumns : activeColumns} rows={users} />
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
        open={Boolean(rejecting)}
        title="Reject this signup?"
        message={
          rejecting
            ? `${rejecting.name} (${rejecting.email}) will be emailed and their signup deleted. They can sign up again later.`
            : ""
        }
        confirmLabel="Reject"
        loading={saving}
        onConfirm={confirmReject}
        onCancel={() => setRejecting(null)}
      />

      <ConfirmDialog
        open={Boolean(roleChange)}
        danger={roleChange?.role === "officer"}
        title={roleChange?.role === "admin" ? "Make this user an admin?" : "Remove admin rights?"}
        message={
          roleChange
            ? roleChange.role === "admin"
              ? `${roleChange.user.name} will be able to approve officers, manage users, agrovets and batch codes, and delete farmers and reports.`
              : `${roleChange.user.name} will become an officer and lose admin rights.`
            : ""
        }
        confirmLabel={roleChange?.role === "admin" ? "Make admin" : "Make officer"}
        loading={saving}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleChange(null)}
      />

      {tab === "active" && (
        <p className="flex items-center gap-2 text-xs text-slate-400">
          <UserCog className="h-3.5 w-3.5" /> You cannot change your own role. Ask another admin.
        </p>
      )}
    </div>
  );
}