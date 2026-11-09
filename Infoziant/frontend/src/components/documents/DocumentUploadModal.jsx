import { useState, useRef, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Alert from '../Alert'
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Loader2,
  ScanText,
} from 'lucide-react'
import { scanDocumentOcr, validateDocument } from '../../services/api'

const DOCUMENT_TYPES = [
  'Insurance',
  'Registration Certificate',
  'Pollution Certificate',
  'Road Tax',
  'Fitness Certificate',
  'Permit',
  'Other',
]

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles = [],
  preselectedVehicleId = '',
}) {
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    title: '',
    documentType: DOCUMENT_TYPES[0],
    vehicleId: preselectedVehicleId || '',
    expiryDate: '',
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)

  // OCR scanning state
  const [isScanningOcr, setIsScanningOcr] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setForm({
        title: '',
        documentType: DOCUMENT_TYPES[0],
        vehicleId: preselectedVehicleId || vehicles[0]?._id || '',
        expiryDate: '',
      })
      setUploadProgress(0)
      setIsUploading(false)
      setIsScanningOcr(false)
      setOcrResult(null)
      setDuplicateWarning(null)
      setErrors({})
      setApiError(null)
    }
  }, [isOpen, preselectedVehicleId, vehicles])

  // Run duplicate check whenever vehicle or documentType changes
  useEffect(() => {
    if (form.vehicleId && form.documentType) {
      validateDocument({
        vehicleId: form.vehicleId,
        documentType: form.documentType,
        filename: file?.name,
      })
        .then((res) => {
          if (res.hasDuplicateWarning) {
            setDuplicateWarning(res.warningMessage)
          } else {
            setDuplicateWarning(null)
          }
        })
        .catch(() => {})
    }
  }, [form.vehicleId, form.documentType, file])

  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'Please choose a PDF file'
    if (
      !selectedFile.name.toLowerCase().endsWith('.pdf') &&
      selectedFile.type !== 'application/pdf'
    ) {
      return 'Only PDF documents are allowed'
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      return 'File size exceeds maximum 10 MB limit'
    }
    return null
  }

  const handleFileChange = (newFile) => {
    if (!newFile) return
    const errorMsg = validateFile(newFile)
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, file: errorMsg }))
      return
    }
    setFile(newFile)
    setErrors((prev) => ({ ...prev, file: null }))
    setOcrResult(null)

    // Prefill title if empty
    if (!form.title) {
      const cleanName = newFile.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .trim()
      setForm((prev) => ({
        ...prev,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      }))
    }
  }

  // Trigger OCR scan on selected file
  const handleOcrScan = async () => {
    if (!file) return
    setIsScanningOcr(true)
    setApiError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await scanDocumentOcr(fd)

      setOcrResult(res)

      // Auto-populate extracted fields
      setForm((prev) => {
        const next = { ...prev }
        if (res.suggestedTitle) next.title = res.suggestedTitle
        if (res.documentType && DOCUMENT_TYPES.includes(res.documentType)) {
          next.documentType = res.documentType
        }
        if (res.expiryDate) next.expiryDate = res.expiryDate

        // If OCR detected a vehicle registration number, auto-select it if registered
        if (res.registrationNumber) {
          const matchedVeh = vehicles.find(
            (v) =>
              v.registrationNumber.replace(/[- ]/g, '').toUpperCase() ===
              res.registrationNumber.replace(/[- ]/g, '').toUpperCase()
          )
          if (matchedVeh) {
            next.vehicleId = matchedVeh._id
          }
        }
        return next
      })
    } catch (err) {
      setApiError(err.message || 'OCR text extraction failed')
    } finally {
      setIsScanningOcr(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const validate = () => {
    const errs = {}
    if (!file) errs.file = 'A PDF file is required'
    if (!form.title.trim()) errs.title = 'Document title is required'
    if (!form.vehicleId) errs.vehicleId = 'Please select an associated vehicle'
    if (!form.documentType) errs.documentType = 'Please select a document type'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return

    setIsUploading(true)
    setUploadProgress(20)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', form.title.trim())
      formData.append('documentType', form.documentType)
      formData.append('vehicleId', form.vehicleId)
      if (form.expiryDate) {
        formData.append('expiryDate', form.expiryDate)
      }
      if (ocrResult) {
        formData.append('ocrData', JSON.stringify(ocrResult))
      }

      const progressTimer = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 85) {
            clearInterval(progressTimer)
            return 85
          }
          return p + 15
        })
      }, 100)

      await onSubmit(formData)
      clearInterval(progressTimer)
      setUploadProgress(100)
      setTimeout(() => {
        onClose()
      }, 300)
    } catch (err) {
      setApiError(err.message || 'Failed to upload document')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Vehicle Document"
      subtitle="Attach a certified PDF document to your vehicle vault"
      size="md"
    >
      <form onSubmit={handleSubmit} className="upload-form-layout">
        {apiError && <Alert type="error">{apiError}</Alert>}

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <Alert type="warning" title="Duplicate Document Alert">
            {duplicateWarning} You can still proceed if this is an updated renewal policy.
          </Alert>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          className={`dropzone-container ${isDragging ? 'drag-active' : ''} ${
            file ? 'file-ready' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden-file-input"
            id="file-input"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />

          {!file ? (
            <div className="dropzone-idle">
              <div className="dropzone-icon-box">
                <UploadCloud size={36} className="text-primary" />
              </div>
              <div className="dropzone-text-group">
                <p className="dropzone-main-text">
                  <span className="text-primary font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="dropzone-sub-text">Standard PDF documents only (up to 10 MB)</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Browse Files
              </Button>
            </div>
          ) : (
            <div className="dropzone-file-card" onClick={(e) => e.stopPropagation()}>
              <div className="file-card-icon">
                <FileText size={26} className="text-primary" />
              </div>
              <div className="file-card-details">
                <span className="file-card-name" title={file.name}>
                  {file.name}
                </span>
                <span className="file-card-meta">
                  {formatBytes(file.size)} • PDF Ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={ScanText}
                  onClick={handleOcrScan}
                  isLoading={isScanningOcr}
                  title="Extract dates and fields automatically using OCR"
                >
                  {isScanningOcr ? 'Scanning...' : 'OCR Scan'}
                </Button>
                {!isUploading && (
                  <button
                    type="button"
                    className="file-card-remove"
                    onClick={() => {
                      setFile(null)
                      setOcrResult(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    title="Remove selected file"
                    aria-label="Remove selected file"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* OCR Result Indicator Pill */}
        {ocrResult && (
          <div className="ocr-feedback-box animate-fade-in">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Sparkles size={14} />
              <span>OCR Extraction Complete ({ocrResult.confidence}% confidence)</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              Auto-filled: {ocrResult.documentType} • Expiry:{' '}
              {ocrResult.expiryDate ? new Date(ocrResult.expiryDate).toLocaleDateString() : 'Not detected'}
              {ocrResult.registrationNumber ? ` • Reg: ${ocrResult.registrationNumber}` : ''}
            </p>
          </div>
        )}

        {errors.file && <p className="form-error-msg mt-1">{errors.file}</p>}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="upload-progress-card animate-fade-in">
            <div className="upload-progress-info">
              <div className="upload-progress-status">
                <Loader2 size={15} className="animate-spin text-primary" />
                <span>Uploading document to volume storage...</span>
              </div>
              <span className="font-semibold text-sm">{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="form-group mt-3">
          <Input
            label="Document Title"
            required
            id="doc-title"
            placeholder="e.g. Comprehensive Vehicle Insurance 2026-27"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={errors.title}
            maxLength={100}
          />
        </div>

        <div className="form-grid-two">
          <Select
            label="Document Category"
            required
            id="doc-type"
            value={form.documentType}
            onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}
            error={errors.documentType}
            options={DOCUMENT_TYPES.map((t) => ({ value: t, label: t }))}
          />

          <Select
            label="Associated Vehicle"
            required
            id="doc-vehicle"
            value={form.vehicleId}
            onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
            error={errors.vehicleId}
            placeholder={vehicles.length === 0 ? 'No registered vehicles' : 'Select vehicle...'}
            disabled={vehicles.length === 0}
          >
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.registrationNumber} — {v.make} {v.model} ({v.fleetGroup || 'Personal'})
              </option>
            ))}
          </Select>
        </div>

        <div className="form-group">
          <Input
            label="Document Expiry Date (Optional)"
            type="date"
            id="doc-expiry"
            value={form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            helperText="Set a date to receive automated 30, 15, 7 and 1-day reminders"
            leftIcon={Calendar}
          />
        </div>

        <div className="modal-actions-right">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isUploading}
            disabled={vehicles.length === 0}
            id="submit-upload-btn"
          >
            {isUploading ? 'Uploading...' : 'Save & Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
