import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FulfillmentTable } from "./FulfillmentTable";
import { FulfillmentSummary } from "./FulfillmentSummary";
import type { Invoice, InvoiceLineItem } from "@/types/inventory";

interface InvoiceAssignmentDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}

export function InvoiceAssignmentDialog({ invoice, open, onClose }: InvoiceAssignmentDialogProps) {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(invoice.lineItems);

  const updateLineItem = (itemId: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const canSubmit = lineItems.every(item => {
    if (!item.fulfillmentSource) return false;
    
    switch (item.fulfillmentSource) {
      case 'MAIN_HQ':
      case 'NYAMIRA':
        return item.serialNumbers && item.serialNumbers.length > 0;
      case 'FIELD_REP':
        return item.assignedRep && item.serialNumbers && item.serialNumbers.length > 0;
      case 'OUTSOURCE':
        return !!item.poId;
      default:
        return false;
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Fulfillment - {invoice.invoiceId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{invoice.customerName}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice Date</p>
                      <p className="font-medium">{invoice.invoiceDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <FulfillmentSummary 
              lineItems={lineItems} 
              totalAmount={invoice.totalAmount} 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Line Items Assignment</h3>
            <FulfillmentTable
              lineItems={lineItems}
              invoiceId={invoice.invoiceId}
              onLineItemUpdate={updateLineItem}
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={!canSubmit}
              onClick={() => {
                // Handle submission logic here
                console.log('Submitting fulfillment assignment:', lineItems);
                onClose();
              }}
            >
              Submit for Dispatch Approval
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}