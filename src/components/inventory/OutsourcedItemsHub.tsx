import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { PaymentDialog } from "./PaymentDialog";
import { Building, Phone, DollarSign, Package, CreditCard } from "lucide-react";
import type { PurchaseOrder } from "@/types/inventory";

// Mock data for demonstration
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    poId: "PO-1705123456",
    relatedInvoiceId: "INV-001",
    productId: "PROD-001",
    supplierName: "Tech Supplies Ltd",
    supplierPhone: "+254712345678",
    purchasePrice: 55000,
    sellingPrice: 65000,
    paymentStatusToSupplier: "UNPAID",
    paymentDetailsToSupplier: []
  },
  {
    poId: "PO-1705123457",
    relatedInvoiceId: "INV-002",
    productId: "PROD-003",
    supplierName: "Office Furniture Co",
    supplierPhone: "+254723456789",
    purchasePrice: 4000,
    sellingPrice: 5000,
    paymentStatusToSupplier: "PAID",
    paymentDetailsToSupplier: [
      {
        amountPaid: 4000,
        mpesaCode: "RBK1234567",
        paymentDate: "2024-01-18"
      }
    ]
  },
  {
    poId: "PO-1705123458",
    relatedInvoiceId: "INV-003",
    productId: "PROD-004",
    supplierName: "Electronics Hub",
    supplierPhone: "+254734567890",
    purchasePrice: 12000,
    sellingPrice: 15000,
    paymentStatusToSupplier: "PARTIAL",
    paymentDetailsToSupplier: [
      {
        amountPaid: 6000,
        mpesaCode: "RBK2345678",
        paymentDate: "2024-01-17"
      }
    ]
  }
];

export function OutsourcedItemsHub() {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handlePaymentClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setPaymentDialogOpen(true);
  };

  const getTotalPaid = (po: PurchaseOrder) => {
    return po.paymentDetailsToSupplier?.reduce((sum, payment) => sum + payment.amountPaid, 0) || 0;
  };

  const getOutstandingAmount = (po: PurchaseOrder) => {
    return po.purchasePrice - getTotalPaid(po);
  };

  const getProfitMargin = (po: PurchaseOrder) => {
    return po.sellingPrice - po.purchasePrice;
  };

  const getProfitPercentage = (po: PurchaseOrder) => {
    return ((getProfitMargin(po) / po.sellingPrice) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Outsourced Items Hub</h2>
          <p className="text-muted-foreground">Manage supplier purchases and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total POs</p>
                <p className="text-2xl font-bold">{mockPurchaseOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-status-unpaid" />
              <div>
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold text-status-unpaid">
                  {mockPurchaseOrders.filter(po => po.paymentStatusToSupplier === 'UNPAID').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-status-processing" />
              <div>
                <p className="text-sm text-muted-foreground">Partial</p>
                <p className="text-2xl font-bold text-status-processing">
                  {mockPurchaseOrders.filter(po => po.paymentStatusToSupplier === 'PARTIAL').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-status-paid" />
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-status-paid">
                  {mockPurchaseOrders.filter(po => po.paymentStatusToSupplier === 'PAID').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchaseOrders.map((po) => (
                <TableRow key={po.poId}>
                  <TableCell className="font-medium">{po.poId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="font-medium">{po.supplierName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {po.supplierPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">Product {po.productId}</p>
                      <p className="text-xs text-muted-foreground">Invoice: {po.relatedInvoiceId}</p>
                    </div>
                  </TableCell>
                  <TableCell>KSh {po.purchasePrice.toLocaleString()}</TableCell>
                  <TableCell>KSh {po.sellingPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-status-completed">
                        +KSh {getProfitMargin(po).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getProfitPercentage(po).toFixed(1)}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={po.paymentStatusToSupplier === 'PAID' ? 'paid' : 
                             po.paymentStatusToSupplier === 'PARTIAL' ? 'processing' : 'unpaid'}
                    >
                      {po.paymentStatusToSupplier}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <span className={getOutstandingAmount(po) > 0 ? 'text-status-unpaid font-medium' : 'text-muted-foreground'}>
                      KSh {getOutstandingAmount(po).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {po.paymentStatusToSupplier !== 'PAID' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePaymentClick(po)}
                        className="text-xs"
                      >
                        Log Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPO && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setSelectedPO(null);
          }}
          purchaseOrder={selectedPO}
          onPaymentLogged={() => {
            // In real implementation, refresh the data
            console.log('Payment logged successfully');
          }}
        />
      )}
    </div>
  );
}