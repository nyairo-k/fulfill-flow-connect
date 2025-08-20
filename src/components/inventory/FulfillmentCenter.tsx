import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { InvoiceAssignmentDialog } from "./InvoiceAssignmentDialog";
import { DispatchApprovalDialog } from "./DispatchApprovalDialog";
import { OutsourcedItemsHub } from "./OutsourcedItemsHub";
import type { Invoice } from "@/types/inventory";

// Mock data for demonstration
const mockInvoices: Invoice[] = [
  {
    invoiceId: "INV-001",
    customerName: "Acme Corp",
    customerPhone: "+254712345678",
    invoiceDate: "2024-01-15",
    status: "AWAITING_FULFILLMENT",
    totalAmount: 15000,
    lineItems: [
      {
        id: "1",
        productId: "PROD-001",
        productName: "Laptop Dell XPS 13",
        quantity: 2,
        unitPrice: 65000,
      },
      {
        id: "2",
        productId: "PROD-002", 
        productName: "Wireless Mouse",
        quantity: 3,
        unitPrice: 2500,
      }
    ]
  },
  {
    invoiceId: "INV-002",
    customerName: "Tech Solutions Ltd",
    customerPhone: "+254723456789",
    invoiceDate: "2024-01-16",
    status: "ASSIGNED",
    totalAmount: 25000,
    lineItems: [
      {
        id: "3",
        productId: "PROD-003",
        productName: "Office Chair",
        quantity: 5,
        unitPrice: 5000,
      }
    ]
  },
  {
    invoiceId: "INV-003",
    customerName: "Enterprise Corp",
    customerPhone: "+254734567890",
    invoiceDate: "2024-01-17",
    status: "AWAITING_FULFILLMENT",
    totalAmount: 850000,
    lineItems: [
      { id: "4", productId: "PROD-001", productName: "Laptop Dell XPS 13", quantity: 5, unitPrice: 65000 },
      { id: "5", productId: "PROD-002", productName: "Wireless Mouse", quantity: 10, unitPrice: 2500 },
      { id: "6", productId: "PROD-004", productName: "Mechanical Keyboard", quantity: 8, unitPrice: 4500 },
      { id: "7", productId: "PROD-005", productName: "USB-C Hub", quantity: 12, unitPrice: 3200 },
      { id: "8", productId: "PROD-006", productName: "External Monitor 24\"", quantity: 6, unitPrice: 18000 },
      { id: "9", productId: "PROD-007", productName: "Webcam HD", quantity: 15, unitPrice: 2800 },
      { id: "10", productId: "PROD-008", productName: "Desk Lamp LED", quantity: 20, unitPrice: 1500 },
      { id: "11", productId: "PROD-009", productName: "Ergonomic Mouse Pad", quantity: 25, unitPrice: 800 },
      { id: "12", productId: "PROD-010", productName: "Cable Management Kit", quantity: 18, unitPrice: 1200 },
      { id: "13", productId: "PROD-011", productName: "Surge Protector", quantity: 10, unitPrice: 2200 },
      { id: "14", productId: "PROD-012", productName: "Wireless Presenter", quantity: 5, unitPrice: 3500 },
      { id: "15", productId: "PROD-013", productName: "Bluetooth Headphones", quantity: 12, unitPrice: 5500 },
      { id: "16", productId: "PROD-014", productName: "Portable SSD 1TB", quantity: 8, unitPrice: 8500 },
      { id: "17", productId: "PROD-015", productName: "USB Flash Drive 64GB", quantity: 30, unitPrice: 1200 },
      { id: "18", productId: "PROD-016", productName: "Laptop Stand", quantity: 10, unitPrice: 2800 },
      { id: "19", productId: "PROD-017", productName: "Document Scanner", quantity: 3, unitPrice: 15000 },
      { id: "20", productId: "PROD-018", productName: "Label Printer", quantity: 4, unitPrice: 12000 },
      { id: "21", productId: "PROD-019", productName: "Network Switch 8-Port", quantity: 2, unitPrice: 8500 },
      { id: "22", productId: "PROD-020", productName: "Wireless Router", quantity: 3, unitPrice: 6500 },
      { id: "23", productId: "PROD-021", productName: "UPS Battery Backup", quantity: 5, unitPrice: 12500 },
      { id: "24", productId: "PROD-022", productName: "Conference Phone", quantity: 2, unitPrice: 22000 },
      { id: "25", productId: "PROD-023", productName: "Projector Portable", quantity: 1, unitPrice: 35000 }
    ]
  }
];

export function FulfillmentCenter() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [dispatchInvoice, setDispatchInvoice] = useState<Invoice | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AWAITING_FULFILLMENT":
        return <Clock className="h-4 w-4" />;
      case "ASSIGNED":
        return <Package className="h-4 w-4" />;
      case "DISPATCHED":
        return <Truck className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "AWAITING_FULFILLMENT":
        return "awaiting";
      case "ASSIGNED":
        return "assigned";
      case "DISPATCHED":
        return "dispatched";
      case "COMPLETED":
        return "completed";
      default:
        return "pending";
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    if (invoice.status === 'ASSIGNED') {
      setDispatchInvoice(invoice);
    } else {
      setSelectedInvoice(invoice);
    }
  };

  const handleDispatchApprove = (invoiceId: string) => {
    console.log('Approving invoice for dispatch:', invoiceId);
    // Update invoice status to DISPATCHED
    setDispatchInvoice(null);
  };

  const handleDispatchReject = (invoiceId: string) => {
    console.log('Rejecting invoice dispatch:', invoiceId);
    // Update invoice status back to AWAITING_FULFILLMENT
    setDispatchInvoice(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fulfillment Center</h1>
            <p className="text-muted-foreground">Manage inventory fulfillment and outsourcing operations</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-[600px] grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Orders
            </TabsTrigger>
            <TabsTrigger value="outsourced" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Outsourced Items
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockInvoices.map((invoice) => (
                <Card key={invoice.invoiceId} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{invoice.invoiceId}</CardTitle>
                      <StatusBadge status={getStatusVariant(invoice.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status.replace('_', ' ')}
                        </div>
                      </StatusBadge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">{invoice.customerName}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Items: {invoice.lineItems.length}</p>
                      <p className="text-lg font-bold">KSh {invoice.totalAmount.toLocaleString()}</p>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleInvoiceClick(invoice)}
                      disabled={invoice.status === "COMPLETED"}
                    >
                      {invoice.status === "AWAITING_FULFILLMENT" ? "Assign Fulfillment" : "View Details"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {mockInvoices.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No pending orders</h3>
                  <p className="text-muted-foreground">All orders have been processed.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="outsourced">
            <OutsourcedItemsHub />
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Completed Orders</h3>
                <p className="text-muted-foreground">View completed fulfillment orders here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {selectedInvoice && (
        <InvoiceAssignmentDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {dispatchInvoice && (
        <DispatchApprovalDialog
          invoice={dispatchInvoice}
          open={!!dispatchInvoice}
          onClose={() => setDispatchInvoice(null)}
          onApprove={handleDispatchApprove}
          onReject={handleDispatchReject}
        />
      )}
      </div>
    </div>
  );
}