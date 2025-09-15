import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Send, Eye } from "lucide-react";

interface QuotationDetailsProps {
  quotation: any;
  isOpen: boolean;
  onClose: () => void;
}

const QuotationDetails = ({ quotation, isOpen, onClose }: QuotationDetailsProps) => {
  if (!quotation) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      save: { variant: "secondary", label: "Save" },
      sent: { variant: "outline", label: "Sent" },
      pending: { variant: "secondary", label: "Pending" },
      accepted: { variant: "default", label: "Accepted", className: "bg-success text-success-foreground" },
      rejected: { variant: "destructive", label: "Rejected" },
      expired: { variant: "secondary", label: "Expired" }
    };

    const config = variants[status] || variants.save;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <span>Quotation Details - {quotation.quotation_number}</span>
            {getStatusBadge(quotation.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quotation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Quotation Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Quotation Number:</strong> {quotation.quotation_number}</div>
                <div><strong>Date:</strong> {quotation.date}</div>
                <div><strong>Valid Until:</strong> {quotation.valid_until || "N/A"}</div>
                <div><strong>Status:</strong> {getStatusBadge(quotation.status)}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Customer ID:</strong> {quotation.customer_id || "N/A"}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Rate</th>
                    <th className="text-right p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">₹{item.rate?.toFixed(2)}</td>
                      <td className="text-right p-3">₹{item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{quotation.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{quotation.tax_amount?.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{quotation.amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {quotation.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <Eye className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDetails;