import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, User, Building } from "lucide-react";
import { PurchaseOrderDialog } from "./PurchaseOrderDialog";
import type { Invoice, InvoiceLineItem, FulfillmentSource, FieldRep } from "@/types/inventory";

interface InvoiceAssignmentDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}

// Mock field reps data
const mockFieldReps: FieldRep[] = [
  { id: "rep1", name: "John Doe", phone: "+254712345678", location: "Nairobi CBD" },
  { id: "rep2", name: "Jane Smith", phone: "+254723456789", location: "Westlands" },
  { id: "rep3", name: "Mike Johnson", phone: "+254734567890", location: "Karen" },
];

export function InvoiceAssignmentDialog({ invoice, open, onClose }: InvoiceAssignmentDialogProps) {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(invoice.lineItems);
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [selectedItemForPO, setSelectedItemForPO] = useState<InvoiceLineItem | null>(null);

  const updateLineItem = (itemId: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleSourceChange = (itemId: string, source: FulfillmentSource) => {
    updateLineItem(itemId, { 
      fulfillmentSource: source,
      serialNumbers: undefined,
      assignedLocation: undefined,
      assignedRep: undefined,
      poId: undefined
    });
  };

  const handleOutsourceClick = (item: InvoiceLineItem) => {
    setSelectedItemForPO(item);
    setPODialogOpen(true);
  };

  const handlePOCreated = (poId: string) => {
    if (selectedItemForPO) {
      updateLineItem(selectedItemForPO.id, { poId });
    }
    setPODialogOpen(false);
    setSelectedItemForPO(null);
  };

  const canSubmit = lineItems.every(item => {
    if (!item.fulfillmentSource) return false;
    
    switch (item.fulfillmentSource) {
      case 'MAIN_HQ':
      case 'NYAMIRA':
        return item.serialNumbers && item.serialNumbers.length >= item.quantity;
      case 'FIELD_REP':
        return item.assignedRep && item.serialNumbers && item.serialNumbers.length >= item.quantity;
      case 'OUTSOURCE':
        return !!item.poId;
      default:
        return false;
    }
  });

  const renderSourceSpecificInputs = (item: InvoiceLineItem) => {
    switch (item.fulfillmentSource) {
      case 'MAIN_HQ':
      case 'NYAMIRA':
        return (
          <div className="space-y-2">
            <Label>Serial Numbers (one per line)</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder={`Enter ${item.quantity} serial numbers...`}
              value={item.serialNumbers?.join('\n') || ''}
              onChange={(e) => updateLineItem(item.id, { 
                serialNumbers: e.target.value.split('\n').filter(s => s.trim()),
                assignedLocation: item.fulfillmentSource === 'MAIN_HQ' ? 'Main HQ' : 'Nyamira'
              })}
            />
            <p className="text-xs text-muted-foreground">
              Required: {item.quantity} serial numbers
            </p>
          </div>
        );

      case 'FIELD_REP':
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Field Rep</Label>
              <Select 
                value={item.assignedRep || ''} 
                onValueChange={(value) => updateLineItem(item.id, { assignedRep: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a field rep..." />
                </SelectTrigger>
                <SelectContent>
                  {mockFieldReps.map(rep => (
                    <SelectItem key={rep.id} value={rep.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {rep.name} - {rep.location}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {item.assignedRep && (
              <div>
                <Label>Serial Numbers (one per line)</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder={`Enter ${item.quantity} serial numbers...`}
                  value={item.serialNumbers?.join('\n') || ''}
                  onChange={(e) => updateLineItem(item.id, { 
                    serialNumbers: e.target.value.split('\n').filter(s => s.trim())
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Required: {item.quantity} serial numbers
                </p>
              </div>
            )}
          </div>
        );

      case 'OUTSOURCE':
        return (
          <div className="space-y-2">
            {item.poId ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm">Purchase Order: {item.poId}</span>
                <Badge variant="secondary">Created</Badge>
              </div>
            ) : (
              <Button 
                onClick={() => handleOutsourceClick(item)}
                variant="outline"
                className="w-full"
              >
                Create Purchase Order
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Fulfillment - {invoice.invoiceId}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Line Items</h3>
              
              {lineItems.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{item.productName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × KSh {item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        KSh {(item.quantity * item.unitPrice).toLocaleString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Fulfillment Source</Label>
                      <Select 
                        value={item.fulfillmentSource || ''} 
                        onValueChange={(value: FulfillmentSource) => handleSourceChange(item.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fulfillment source..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAIN_HQ">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Main HQ Store
                            </div>
                          </SelectItem>
                          <SelectItem value="NYAMIRA">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Nyamira Store
                            </div>
                          </SelectItem>
                          <SelectItem value="FIELD_REP">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Field Rep Stock
                            </div>
                          </SelectItem>
                          <SelectItem value="OUTSOURCE">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Outsource from Supplier
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {item.fulfillmentSource && renderSourceSpecificInputs(item)}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">KSh {invoice.totalAmount.toLocaleString()}</p>
              </div>
              
              <div className="flex gap-3">
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
          </div>
        </DialogContent>
      </Dialog>

      {selectedItemForPO && (
        <PurchaseOrderDialog
          open={poDialogOpen}
          onClose={() => setPODialogOpen(false)}
          lineItem={selectedItemForPO}
          invoiceId={invoice.invoiceId}
          onPOCreated={handlePOCreated}
        />
      )}
    </>
  );
}