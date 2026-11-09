import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Fuel,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  CarFront,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getExpenses, getExpenseAnalytics, createExpense, deleteExpense, getVehicles } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/Alert'
import { useToast } from '../context/ToastContext'

const EXPENSE_CATEGORIES = [
  'Fuel',
  'Maintenance & Repairs',
  'Insurance Premium',
  'Tolls & Permits',
  'Parking',
  'Cleaning & Detailing',
  'Accessories & Upgrades',
  'Fines & Violations',
  'Road Tax',
  'Other',
]

const PAYMENT_METHODS = [
  'Credit / Debit Card',
  'UPI / Digital Wallet',
  'Cash',
  'Net Banking',
  'Fleet Card',
  'Company Account',
]

const PALETTE = ['#2563EB', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B']

const emptyExpenseForm = {
  vehicleId: '',
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: PAYMENT_METHODS[0],
  vendorOrStation: '',
  receiptNumber: '',
  fuelQuantityLiters: '',
  notes: '',
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState(emptyExpenseForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [expRes, analyticsRes, vehRes] = await Promise.all([
        getExpenses({
          vehicleId: filterVehicle || undefined,
          category: filterCategory !== 'ALL' ? filterCategory : undefined,
        }),
        getExpenseAnalytics(),
        getVehicles().catch(() => ({ vehicles: [] })),
      ])
      setExpenses(expRes.expenses || [])
      setAnalytics(analyticsRes)
      setVehicles(vehRes.vehicles || [])
    } catch (err) {
      setError(err.message || 'Failed to load expense data')
    } finally {
      setLoading(false)
    }
  }, [filterVehicle, filterCategory])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreate = () => {
    setForm({
      ...emptyExpenseForm,
      vehicleId: vehicles[0]?._id || '',
    })
    setFormErrors({})
    setShowAddModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.vehicleId) errs.vehicleId = 'Please select a vehicle'
    if (!form.category) errs.category = 'Category is required'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Valid positive amount is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await createExpense({
        vehicleId: form.vehicleId,
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        paymentMethod: form.paymentMethod,
        vendorOrStation: form.vendorOrStation.trim(),
        receiptNumber: form.receiptNumber.trim(),
        fuelQuantityLiters: form.fuelQuantityLiters ? Number(form.fuelQuantityLiters) : undefined,
        notes: form.notes.trim(),
      })
      toast.success('Expense recorded successfully')
      setShowAddModal(false)
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to log expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteExpense(confirmDelete._id)
      toast.success('Expense record removed')
      setConfirmDelete(null)
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense')
    } finally {
      setDeleting(false)
    }
  }

  const totalSpend = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  }, [expenses])

  const fuelSpend = useMemo(() => {
    return expenses.filter((e) => e.category === 'Fuel').reduce((acc, curr) => acc + curr.amount, 0)
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return expenses.filter((e) => {
      const matchesSearch =
        !term ||
        e.category.toLowerCase().includes(term) ||
        (e.vendorOrStation && e.vendorOrStation.toLowerCase().includes(term)) ||
        (e.vehicle?.registrationNumber &&
          e.vehicle.registrationNumber.toLowerCase().includes(term))
      return matchesSearch
    })
  }, [expenses, searchTerm])

  return (
    <div className="expenses-page animate-fade-in">
      <PageHeader
        title="Vehicle Expense Management &amp; Analytics"
        subtitle="Monitor fuel consumption, insurance premiums, road tolls, and lifetime vehicle operating costs."
        badge={
          <span className="badge-subtle font-semibold">
            {expenses.length} Expense Entry{expenses.length !== 1 ? 's' : ''}
          </span>
        }
        actions={
          <Button
            variant="primary"
            leftIcon={Plus}
            onClick={openCreate}
            disabled={vehicles.length === 0}
          >
            Log New Expense
          </Button>
        }
      />

      {error && <Alert type="error">{error}</Alert>}

      {/* Metrics Grid */}
      <div className="stats-metric-grid">
        <div className="dashboard-stat-card scheme-blue">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <DollarSign size={22} />
            </div>
            <span className="stat-trend-tag trend-positive">Filtered Total</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value font-mono">₹{totalSpend.toLocaleString()}</div>
            <div className="stat-card-label">Total Current Spend</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>

        <div className="dashboard-stat-card scheme-amber">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Fuel size={22} />
            </div>
            <span className="stat-trend-tag trend-warning">Fuel Total</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value font-mono">₹{fuelSpend.toLocaleString()}</div>
            <div className="stat-card-label">Fuel &amp; Gas Expenses</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>

        <div className="dashboard-stat-card scheme-purple">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Receipt size={22} />
            </div>
            <span className="stat-trend-tag trend-neutral">Entries</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value">{expenses.length}</div>
            <div className="stat-card-label">Receipts Logged</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>

        <div className="dashboard-stat-card scheme-rose">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <TrendingUp size={22} />
            </div>
            <span className="stat-trend-tag trend-positive">Average</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value font-mono">
              ₹{expenses.length > 0 ? Math.round(totalSpend / expenses.length).toLocaleString() : 0}
            </div>
            <div className="stat-card-label">Average per Entry</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      {analytics && (
        <div className="dashboard-split-layout mb-6">
          {/* Monthly Trend Bar Chart */}
          <div className="dashboard-card">
            <div className="card-header-clean">
              <div className="card-header-title-box">
                <BarChart3 size={20} className="text-primary" />
                <h3 className="card-heading">Monthly Expenditure Trend</h3>
              </div>
              <span className="card-header-badge">Last 6 Months</span>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyTrend || []}>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Spent']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="dashboard-card">
            <div className="card-header-clean">
              <div className="card-header-title-box">
                <PieIcon size={20} className="text-secondary" />
                <h3 className="card-heading">Category Spending Breakdown</h3>
              </div>
              <span className="card-header-badge">All Categories</span>
            </div>
            <div style={{ width: '100%', height: 240, display: 'flex', alignItems: 'center' }}>
              {analytics.categoryBreakdown?.length === 0 ? (
                <p className="text-center text-xs text-muted w-full">No expenses to display yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(analytics.categoryBreakdown || []).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹${val.toLocaleString()}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="collection-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by category, station, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control-search-input"
            />
          </div>

          <div className="filter-select-wrapper">
            <CarFront size={16} className="filter-icon" />
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="control-select"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.make}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="control-select"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Expenses Table */}
      {loading ? (
        <LoadingSpinner message="Calculating financial telemetry..." />
      ) : expenses.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={Receipt}
            title="No expenses logged yet"
            description="Log gas fill-ups, insurance premiums, maintenance bills, and road tolls to analyze operating expenditure."
            actionText="Log First Expense"
            actionIcon={Plus}
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Vendor / Station</th>
                <th>Notes</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp._id} className="table-row-hover">
                  <td className="text-secondary text-sm">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="plate-pill sm">
                      {exp.vehicle?.registrationNumber || 'Vehicle'}
                    </span>
                  </td>
                  <td>
                    <span className="badge-subtle-primary">{exp.category}</span>
                  </td>
                  <td className="font-mono font-bold text-main">
                    ₹{exp.amount.toLocaleString()}
                  </td>
                  <td className="text-sm text-secondary">{exp.paymentMethod}</td>
                  <td className="text-sm font-medium">{exp.vendorOrStation || '—'}</td>
                  <td className="table-notes-cell">{exp.notes || '—'}</td>
                  <td>
                    <div className="table-actions-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Trash2}
                        onClick={() => setConfirmDelete(exp)}
                        className="btn-danger-ghost"
                        title="Delete expense"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Log Vehicle Expense"
        subtitle="Record fuel receipts, toll charges, or maintenance bills"
        size="md"
      >
        <form onSubmit={handleSubmit} className="vehicle-form-layout">
          <div className="form-grid-two">
            <Select
              label="Vehicle"
              required
              value={form.vehicleId}
              onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
              error={formErrors.vehicleId}
            >
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.make} {v.model}
                </option>
              ))}
            </Select>

            <Select
              label="Expense Category"
              required
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              options={EXPENSE_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            />
          </div>

          <div className="form-grid-two">
            <Input
              label="Amount (₹)"
              type="number"
              required
              placeholder="e.g. 2400"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              error={formErrors.amount}
            />

            <Input
              label="Expense Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="form-grid-two">
            <Select
              label="Payment Method"
              value={form.paymentMethod}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />

            <Input
              label="Vendor / Station Name"
              placeholder="e.g. Shell Petrol Station, NH Toll"
              value={form.vendorOrStation}
              onChange={(e) => setForm((f) => ({ ...f, vendorOrStation: e.target.value }))}
            />
          </div>

          {form.category === 'Fuel' && (
            <div className="form-grid-two">
              <Input
                label="Fuel Quantity (Liters)"
                type="number"
                placeholder="e.g. 35.5"
                value={form.fuelQuantityLiters}
                onChange={(e) => setForm((f) => ({ ...f, fuelQuantityLiters: e.target.value }))}
              />
              <Input
                label="Invoice / Receipt #"
                placeholder="e.g. SH-89212"
                value={form.receiptNumber}
                onChange={(e) => setForm((f) => ({ ...f, receiptNumber: e.target.value }))}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="exp-notes">
              Notes &amp; Particulars
            </label>
            <textarea
              id="exp-notes"
              className="form-textarea"
              rows={2}
              placeholder="Optional notes or trip details..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="modal-actions-right">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Record Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Expense Record"
        message={`Delete ${confirmDelete?.category} expense entry of ₹${confirmDelete?.amount}?`}
        isLoading={deleting}
      />
    </div>
  )
}

