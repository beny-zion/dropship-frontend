'use client';

import { MapPin, Home, Briefcase, MoreHorizontal, Trash2, Edit, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { formatPhone } from '@/lib/utils/format';

const labelIcons = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

const labelText = {
  home: 'בית',
  work: 'עבודה',
  other: 'אחר',
};

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const LabelIcon = labelIcons[address.label];

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק כתובת זו?')) {
      onDelete(address._id);
    }
  };

  return (
    <div className={`border p-6 transition-all ${
      address.isDefault ? 'border-black bg-neutral-50' : 'border-neutral-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 shrink-0">
            <LabelIcon className="h-4 w-4 text-neutral-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-normal text-base">{address.fullName}</h3>
              {address.isDefault && (
                <span className="bg-black text-white px-2 py-0.5 text-xs font-light tracking-wider inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  ברירת מחדל
                </span>
              )}
              <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 text-xs font-light">
                {labelText[address.label]}
              </span>
            </div>

            <div className="space-y-1 text-sm font-light text-neutral-600">
              <p>
                {address.street}
                {(address.apartment || address.floor || address.entrance) && (
                  <span className="text-xs mr-2">
                    ({[
                      address.apartment && `דירה ${address.apartment}`,
                      address.floor && `קומה ${address.floor}`,
                      address.entrance && `כניסה ${address.entrance}`
                    ].filter(Boolean).join(', ')})
                  </span>
                )}
              </p>
              <p>{address.city}, {address.zipCode}</p>
              <p dir="ltr" className="text-right">{formatPhone(address.phone)}</p>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-neutral-100 transition-colors shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(address)}>
              <Edit className="h-4 w-4 mr-2" />
              ערוך
            </DropdownMenuItem>

            {!address.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(address._id)}>
                <Star className="h-4 w-4 mr-2" />
                הגדר כברירת מחדל
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDelete}
              className="text-neutral-800 focus:text-black"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              מחק
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}