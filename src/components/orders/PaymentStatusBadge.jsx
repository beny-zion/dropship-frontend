import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Ban } from 'lucide-react';

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'ממתין לתשלום',
    className: 'bg-gray-100 text-gray-800 border border-gray-300',
    icon: Clock
  },
  hold: {
    label: 'מסגרת נתפסה',
    className: 'bg-blue-100 text-blue-800 border border-blue-300',
    icon: CreditCard
  },
  ready_to_charge: {
    label: 'מוכן לחיוב',
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    icon: AlertCircle
  },
  charged: {
    label: 'חויב',
    className: 'bg-green-100 text-green-800 border border-green-300',
    icon: CheckCircle
  },
  cancelled: {
    label: 'בוטל',
    className: 'bg-red-100 text-red-800 border border-red-300',
    icon: XCircle
  },
  partial_refund: {
    label: 'החזר חלקי',
    className: 'bg-orange-100 text-orange-800 border border-orange-300',
    icon: AlertCircle
  },
  full_refund: {
    label: 'החזר מלא',
    className: 'bg-purple-100 text-purple-800 border border-purple-300',
    icon: Ban
  },
  failed: {
    label: 'נכשל',
    className: 'bg-red-100 text-red-800 border border-red-300',
    icon: XCircle
  }
};

export function PaymentStatusBadge({ status, amount }) {
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${config.className}`}>
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{config.label}</span>
      {amount > 0 && (
        <span className="font-bold text-sm">₪{amount.toFixed(0)}</span>
      )}
    </div>
  );
}
