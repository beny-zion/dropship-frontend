// components/admin/orders/AdvancedFilters.jsx
// Phase 11: Advanced Filters for Orders Dashboard

'use client';

import { useState } from 'react';
import {
  Calendar,
  CreditCard,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  Filter
} from 'lucide-react';

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'הכל', color: 'gray' },
  { value: 'pending', label: 'ממתין לתשלום', color: 'yellow' },
  { value: 'hold', label: 'מסגרת תפוסה', color: 'orange' },
  { value: 'ready_to_charge', label: 'מוכן לגבייה', color: 'blue' },
  { value: 'retry_pending', label: 'ממתין לניסיון חוזר', color: 'amber' },
  { value: 'charged', label: 'נגבה', color: 'green' },
  { value: 'cancelled', label: 'בוטל', color: 'gray' },
  { value: 'partial_refund', label: 'החזר חלקי', color: 'purple' },
  { value: 'full_refund', label: 'החזר מלא', color: 'indigo' },
  { value: 'failed', label: 'נכשל', color: 'red' }
];

const ITEM_STATUS_OPTIONS = [
  { value: 'all', label: 'הכל', color: 'gray' },
  { value: 'pending', label: 'ממתין להזמנה', color: 'yellow' },
  { value: 'ordered', label: 'הוזמן מספק', color: 'blue' },
  { value: 'in_transit', label: 'בדרך (בכל השלבים)', color: 'purple' },
  { value: 'arrived_israel', label: 'הגיע לישראל', color: 'indigo' },
  { value: 'shipped_to_customer', label: 'נשלח ללקוח', color: 'cyan' },
  { value: 'delivered', label: 'נמסר', color: 'green' },
  { value: 'cancelled', label: 'בוטל', color: 'red' }
];

const DATE_PRESETS = [
  { value: 'today', label: 'היום' },
  { value: 'yesterday', label: 'אתמול' },
  { value: 'last7days', label: '7 ימים' },
  { value: 'last30days', label: '30 ימים' },
  { value: 'thisMonth', label: 'החודש' },
  { value: 'lastMonth', label: 'חודש שעבר' },
  { value: 'custom', label: 'מותאם אישית' }
];

function SelectDropdown({ label, icon: Icon, value, options, onChange, helpText }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </label>
        {helpText && (
          <span className="text-xs text-gray-400">{helpText}</span>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRangeSelector({ dateRange, datePreset, onDateRangeChange, onPresetChange }) {
  const [showCustom, setShowCustom] = useState(datePreset === 'custom');

  const handlePresetClick = (preset) => {
    onPresetChange(preset);
    setShowCustom(preset === 'custom');

    if (preset !== 'custom') {
      // חשב תאריכים לפי ה-preset
      const now = new Date();
      let from, to;

      switch (preset) {
        case 'today':
          from = to = now.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          from = to = yesterday.toISOString().split('T')[0];
          break;
        case 'last7days':
          to = now.toISOString().split('T')[0];
          const last7 = new Date(now);
          last7.setDate(last7.getDate() - 7);
          from = last7.toISOString().split('T')[0];
          break;
        case 'last30days':
          to = now.toISOString().split('T')[0];
          const last30 = new Date(now);
          last30.setDate(last30.getDate() - 30);
          from = last30.toISOString().split('T')[0];
          break;
        case 'thisMonth':
          from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          to = now.toISOString().split('T')[0];
          break;
        case 'lastMonth':
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          from = lastMonthStart.toISOString().split('T')[0];
          to = lastMonthEnd.toISOString().split('T')[0];
          break;
        default:
          from = '';
          to = '';
      }

      onDateRangeChange({ from, to });
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" />
        טווח תאריכים
      </label>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors
              ${datePreset === preset.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {showCustom && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">עד</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}

export default function AdvancedFilters({ filters, onFiltersChange, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.paymentStatus !== 'all' ||
    filters.itemStatus !== 'all' ||
    filters.dateRange.from ||
    filters.dateRange.to;

  const activeFiltersCount = [
    filters.paymentStatus !== 'all',
    filters.itemStatus !== 'all',
    filters.dateRange.from || filters.dateRange.to
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">פילטרים מתקדמים</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {activeFiltersCount} פעילים
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Date Range */}
          <DateRangeSelector
            dateRange={filters.dateRange}
            datePreset={filters.datePreset}
            onDateRangeChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
            onPresetChange={(preset) => onFiltersChange({ ...filters, datePreset: preset })}
          />

          {/* Status Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectDropdown
              label="סטטוס תשלום"
              icon={CreditCard}
              value={filters.paymentStatus}
              options={PAYMENT_STATUS_OPTIONS}
              onChange={(value) => onFiltersChange({ ...filters, paymentStatus: value })}
              helpText="מצב העסקה בכרטיס"
            />

            <SelectDropdown
              label="סטטוס פריט"
              icon={Package}
              value={filters.itemStatus}
              options={ITEM_STATUS_OPTIONS}
              onChange={(value) => onFiltersChange({ ...filters, itemStatus: value })}
              helpText="מצב המשלוח"
            />
          </div>

          {/* Action Buttons */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                נקה פילטרים
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {filters.paymentStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              <CreditCard className="w-3 h-3" />
              {PAYMENT_STATUS_OPTIONS.find(o => o.value === filters.paymentStatus)?.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFiltersChange({ ...filters, paymentStatus: 'all' });
                }}
                className="ml-1 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.itemStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              <Package className="w-3 h-3" />
              {ITEM_STATUS_OPTIONS.find(o => o.value === filters.itemStatus)?.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFiltersChange({ ...filters, itemStatus: 'all' });
                }}
                className="ml-1 hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
              <Calendar className="w-3 h-3" />
              {filters.dateRange.from} - {filters.dateRange.to}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFiltersChange({ ...filters, dateRange: { from: '', to: '' }, datePreset: '' });
                }}
                className="ml-1 hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
