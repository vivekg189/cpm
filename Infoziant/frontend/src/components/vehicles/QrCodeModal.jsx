import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { QrCode, Download, Printer, ShieldCheck, CarFront, Loader2 } from 'lucide-react'
import { getVehicleQrCode } from '../../services/api'

export default function QrCodeModal({ isOpen, onClose, vehicle }) {
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && vehicle) {
      setLoading(true)
      getVehicleQrCode(vehicle._id)
        .then((res) => {
          setQrDataUrl(res.qrCodeDataUrl)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setQrDataUrl(null)
    }
  }, [isOpen, vehicle])

  if (!vehicle) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vehicle Verification QR Code"
      subtitle={`Instant digital compliance badge for ${vehicle.registrationNumber}`}
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={Printer} onClick={handlePrint} size="sm">
              Print Badge
            </Button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`VehicleVault_QR_${vehicle.registrationNumber}.png`}
                className="btn btn-primary btn-sm inline-flex items-center gap-1"
              >
                <Download size={14} />
                <span>Save Image</span>
              </a>
            )}
          </div>
        </div>
      }
    >
      <div className="qr-badge-modal-container">
        <div className="inspection-badge-frame">
          <div className="badge-frame-top">
            <ShieldCheck size={18} className="text-primary inline-icon" />
            <span className="font-bold text-xs uppercase tracking-wider">VehicleVault Certified</span>
          </div>

          <div className="qr-code-image-wrapper">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-xs text-muted">Generating QR...</span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${vehicle.registrationNumber}`}
                className="qr-code-img"
              />
            ) : (
              <div className="p-8 text-xs text-muted">Unable to generate QR code</div>
            )}
          </div>

          <div className="badge-frame-bottom">
            <span className="plate-pill lg">{vehicle.registrationNumber}</span>
            <p className="text-xs text-secondary mt-1">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </p>
            <span className="badge-subtle-primary text-xs mt-1">
              {vehicle.fleetGroup || 'Personal'} Fleet
            </span>
          </div>
        </div>

        <p className="text-xs text-center text-muted mt-3">
          Affix this QR sticker to the vehicle windshield or glove compartment for rapid traffic inspection and document verification.
        </p>
      </div>
    </Modal>
  )
}

