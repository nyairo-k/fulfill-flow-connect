import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, User, ShoppingCart, X } from "lucide-react";
import type { FulfillmentSource } from "@/types/inventory";

interface BulkAssignmentActionsProps {
  selectedCount: number;
  onBulkAssign: (source: FulfillmentSource) => void;
  onClearSelection: () => void;
}

export function BulkAssignmentActions({ selectedCount, onBulkAssign, onClearSelection }: BulkAssignmentActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="font-medium">
              {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
            </Badge>
            <span className="text-sm text-muted-foreground">Bulk assign to:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAssign('MAIN_HQ')}
              className="h-8"
            >
              <Building className="h-4 w-4 mr-1" />
              Main HQ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAssign('NYAMIRA')}
              className="h-8"
            >
              <Building className="h-4 w-4 mr-1" />
              Nyamira
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAssign('FIELD_REP')}
              className="h-8"
            >
              <User className="h-4 w-4 mr-1" />
              Field Rep
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAssign('OUTSOURCE')}
              className="h-8"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Outsource
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}