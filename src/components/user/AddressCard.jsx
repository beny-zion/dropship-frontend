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
    <Card className={address.isDefault ? 'border-primary border-2' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
              <LabelIcon className="h-4 w-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold">{address.fullName}</h3>
                {address.isDefault && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    ברירת מחדל
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {labelText[address.label]}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {address.street}
                  {(address.apartment || address.floor || address.entrance) && (
                    <span className="text-xs mr-2">
                      {[
                        address.apartment && `דירה ${address.apartment}`,
                        address.floor && `קומה ${address.floor}`,
                        address.entrance && `כניסה ${address.entrance}`
                      ].filter(Boolean).join(', ')}
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
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                מחק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}