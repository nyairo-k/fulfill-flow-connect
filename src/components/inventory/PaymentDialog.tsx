import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, DollarSign, CreditCard, Receipt, Building, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseOrder, PaymentDetails } from "@/types/inventory";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder;
  onPaymentLogged: () => void;
}

export function PaymentDialog({ open, onClose, purchaseOrder, onPaymentLogged }: PaymentDialogProps) {
  const [amountPaid, setAmountPaid] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalPaid = purchaseOrder.paymentDetailsToSupplier?.reduce((sum, payment) => sum + payment.amountPaid, 0) || 0;
  const outstandingAmount = purchaseOrder.purchasePrice - totalPaid;
  const amountPaidNum = parseFloat(amountPaid) || 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file for proof of payment.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amountPaid || !mpesaCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount paid and M-PESA code.",
        variant: "destructive",
      });
      return;
    }

    if (amountPaidNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (amountPaidNum > outstandingAmount) {
      toast({
        title: "Amount Exceeds Outstanding",
        description: `Maximum payable amount is KSh ${outstandingAmount.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPayment: PaymentDetails = {
        amountPaid: amountPaidNum,
        mpesaCode,
        proofOfPayment: proofFile ? `proof_${Date.now()}.jpg` : undefined,
        paymentDate: new Date().toISOString().split('T')[0]
      };
      
      // In real implementation, this would update the Purchase_Orders sheet
      const updatedPayments = [...(purchaseOrder.paymentDetailsToSupplier || []), newPayment];
      const newTotalPaid = totalPaid + amountPaidNum;
      const newStatus = newTotalPaid >= purchaseOrder.purchasePrice ? 'PAID' : 'PARTIAL';
      
      console.log('Logging payment:', {
        poId: purchaseOrder.poId,
        payment: newPayment,
        newStatus,
        updatedPayments
      });
      
      toast({
        title: "Payment Logged Successfully",
        description: `Payment of KSh ${amountPaidNum.toLocaleString()} has been recorded.`,
      });
      
      onPaymentLogged();
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmountPaid("");
    setMpesaCode("");
    setProofFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Supplier Payment - {purchaseOrder.poId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier & PO Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{purchaseOrder.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    {purchaseOrder.supplierPhone}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Related Invoice</p>
                  <p className="font-medium">{purchaseOrder.relatedInvoiceId}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Price</p>
                  <p className="text-lg font-bold">KSh {purchaseOrder.purchasePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid So Far</p>
                  <p className="text-lg font-bold text-status-completed">KSh {totalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-lg font-bold text-status-unpaid">KSh {outstandingAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {purchaseOrder.paymentDetailsToSupplier && purchaseOrder.paymentDetailsToSupplier.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>M-PESA Code</TableHead>
                      <TableHead>Proof</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.paymentDetailsToSupplier.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.paymentDate}</TableCell>
                        <TableCell>KSh {payment.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">{payment.mpesaCode}</TableCell>
                        <TableCell>
                          {payment.proofOfPayment ? (
                            <Badge variant="secondary">
                              <Receipt className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No proof</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Log New Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Amount Paid *
                    </Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      min="0"
                      max={outstandingAmount}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum: KSh {outstandingAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mpesaCode">
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      M-PESA Code *
                    </Label>
                    <Input
                      id="mpesaCode"
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      placeholder="RBK1234567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofFile">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Proof of Payment (Optional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="proofFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {proofFile && (
                      <Badge variant="secondary">
                        {proofFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an image file (max 5MB)
                  </p>
                </div>

                {amountPaidNum > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <p className="font-medium">Payment Summary</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">New Payment</p>
                            <p className="font-semibold">KSh {amountPaidNum.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining Balance</p>
                            <p className="font-semibold">KSh {(outstandingAmount - amountPaidNum).toLocaleString()}</p>
                          </div>
                        </div>
                        {(outstandingAmount - amountPaidNum) <= 0 && (
                          <Badge className="bg-status-completed text-status-completed-foreground">
                            This payment will mark the PO as PAID
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || outstandingAmount <= 0}>
                    {isSubmitting ? "Logging Payment..." : "Log Payment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}