import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building, Phone, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceLineItem } from "@/types/inventory";

interface PurchaseOrderDialogProps {
  open: boolean;
  onClose: () => void;
  lineItem: InvoiceLineItem;
  invoiceId: string;
  onPOCreated: (poId: string) => void;
}

export function PurchaseOrderDialog({ 
  open, 
  onClose, 
  lineItem, 
  invoiceId, 
  onPOCreated 
}: PurchaseOrderDialogProps) {
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const sellingPrice = lineItem.unitPrice;
  const purchasePriceNum = parseFloat(purchasePrice) || 0;
  const profitMargin = sellingPrice - purchasePriceNum;
  const profitPercentage = sellingPrice > 0 ? (profitMargin / sellingPrice) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierName || !supplierPhone || !purchasePrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to create purchase order
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const poId = `PO-${Date.now()}`;
      
      // In real implementation, this would create a row in Purchase_Orders sheet
      const purchaseOrder = {
        poId,
        relatedInvoiceId: invoiceId,
        productId: lineItem.productId,
        supplierName,
        supplierPhone,
        purchasePrice: purchasePriceNum,
        sellingPrice,
        paymentStatusToSupplier: 'UNPAID',
        paymentDetailsToSupplier: []
      };
      
      console.log('Creating purchase order:', purchaseOrder);
      
      toast({
        title: "Purchase Order Created",
        description: `PO ${poId} has been created successfully.`,
      });
      
      onPOCreated(poId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSupplierName("");
    setSupplierPhone("");
    setPurchasePrice("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{lineItem.productName}</p>
                    <p className="text-sm text-muted-foreground">Product ID: {lineItem.productId}</p>
                  </div>
                  <Badge variant="outline">Qty: {lineItem.quantity}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Selling Price (per unit):</span>
                  <span className="font-semibold">KSh {sellingPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">
                  <Building className="inline h-4 w-4 mr-1" />
                  Supplier Name *
                </Label>
                <Input
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplierPhone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Supplier Phone *
                </Label>
                <Input
                  id="supplierPhone"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Purchase Price (per unit) *
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {purchasePriceNum > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium">Profit Analysis</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Purchase Cost</p>
                        <p className="font-semibold">KSh {(purchasePriceNum * lineItem.quantity).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Selling Revenue</p>
                        <p className="font-semibold">KSh {(sellingPrice * lineItem.quantity).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit</p>
                        <p className={`font-semibold ${profitMargin >= 0 ? 'text-status-completed' : 'text-status-unpaid'}`}>
                          KSh {(profitMargin * lineItem.quantity).toLocaleString()} ({profitPercentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}