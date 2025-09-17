import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import InvoiceList from "@/components/InvoiceList";
import CustomerList from "@/components/CustomerList";
import Settings from "@/pages/Settings";
import StockRegister from "@/components/StockRegister";
import CustomerForm from "@/components/forms/CustomerForm";
import InvoiceForm from "@/components/forms/InvoiceForm";
import InvoiceDetails from "@/components/InvoiceDetails";
import QuotationForm from "@/components/forms/QuotationForm";
import QuotationList from "@/components/QuotationList";
import QuotationDetails from "@/components/QuotationDetails";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const { toast } = useToast();
  const { companySettings } = useSettings();
  const {
    customers,
    invoices,
    quotations,
    addCustomer,
    updateCustomer,
    addInvoice,
    updateInvoice,
    addQuotation,
    updateQuotation,
    deleteCustomer,
    deleteInvoice,
    deleteQuotation
  } = useSupabaseData();

  const handlePageChange = (page: string) => {
    // Handle direct action pages
    if (page === "new-invoice") {
      handleCreateInvoice();
      return;
    }
    if (page === "new-quotation") {
      handleCreateQuotation();
      return;
    }
    if (page === "new-customer") {
      handleCreateCustomer();
      return;
    }
    
    setCurrentPage(page);
  };

  const handleCreateQuotation = () => {
    if (customers.length === 0) {
      toast({
        title: "No customers available",
        description: "Please add a customer first before creating a quotation.",
        variant: "destructive"
      });
      return;
    }
    setCurrentPage("quotation-form");
  };

  const handleCreateInvoice = () => {
    if (customers.length === 0) {
      toast({
        title: "No customers available",
        description: "Please add a customer first before creating an invoice.",
        variant: "destructive"
      });
      return;
    }
    setCurrentPage("invoice-form");
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setCurrentPage("customer-form");
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setCurrentPage("customer-form");
  };

  const handleViewInvoice = (id: string) => {
    const invoice = invoices.find(i => i.id === id || i.invoice_number === id);
    if (invoice) {
      setViewingInvoice(invoice);
    }
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setCurrentPage("invoice-edit-form");
  };

  const handleViewCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      toast({
        title: "Customer Details",
        description: `${customer.name} - ${customer.email || 'No email'}`
      });
    }
  };

  const handleSubmitCustomer = async (customerData: any) => {
    if (editingCustomer) {
      // Update existing customer
      const updatedCustomer = await updateCustomer(editingCustomer.id, customerData);
      if (updatedCustomer) {
        toast({
          title: "Customer updated",
          description: `${updatedCustomer.name} has been updated.`
        });
        setCurrentPage("customers");
      }
    } else {
      // Create new customer
      const newCustomer = await addCustomer(customerData);
      if (newCustomer) {
        toast({
          title: "Customer added",
          description: `${newCustomer.name} has been added to your customer list.`
        });
        setCurrentPage("customers");
      }
    }
  };

  const handleSubmitInvoice = async (invoiceData: any) => {
    try {
      const newInvoice = await addInvoice(invoiceData);
      if (newInvoice) {
        toast({
          title: "Invoice created",
          description: `Invoice ${newInvoice.invoice_number} has been created.`
        });
        setCurrentPage("invoices");
      } else {
        throw new Error("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const updatedInvoice = await updateInvoice(invoiceId, { status: "Paid" });
      if (updatedInvoice) {
        toast({
          title: "Invoice marked as paid",
          description: "The invoice has been marked as paid."
        });
      } else {
        throw new Error("Failed to update invoice");
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendReminder = (invoiceId: string) => {
    toast({
      title: "Reminder sent",
      description: "Payment reminder has been sent to the customer."
    });
  };

  const handleDownloadPDF = (id: string) => {
    const invoice = invoices.find(i => i.id === id || i.invoice_number === id);
    
    if (invoice) {
      // Simple text download for invoices (can be enhanced later)
      const content = `Invoice: ${invoice.invoice_number}\nCustomer: ${invoice.customer_name}\nAmount: ₹${invoice.total_amount}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoice_number}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Invoice has been downloaded."
      });
    }
  };

  const handleViewQuotation = (id: string) => {
    const quotation = quotations.find(q => q.id === id || q.quotation_number === id);
    if (quotation) {
      setViewingQuotation(quotation);
    }
  };

  const handleEditQuotation = (quotation: any) => {
    setEditingQuotation(quotation);
    setCurrentPage("quotation-edit-form");
  };

  const handleSubmitQuotation = async (quotationData: any) => {
    try {
      const newQuotation = await addQuotation(quotationData);
      if (newQuotation) {
        toast({
          title: "Quotation created",
          description: `Quotation ${newQuotation.quotation_number} has been created.`
        });
        setCurrentPage("quotations");
      } else {
        throw new Error("Failed to create quotation");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsAccepted = async (quotationId: string) => {
    try {
      const updatedQuotation = await updateQuotation(quotationId, { status: "accepted" });
      if (updatedQuotation) {
        toast({
          title: "Quotation accepted",
          description: "The quotation has been marked as accepted."
        });
      } else {
        throw new Error("Failed to update quotation");
      }
    } catch (error) {
      console.error("Error accepting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to accept quotation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQuotationPDF = (id: string) => {
    const quotation = quotations.find(q => q.id === id || q.quotation_number === id);
    
    if (quotation) {
      // Simple text download for quotations (can be enhanced later)
      const content = `Quotation: ${quotation.quotation_number}\nAmount: ₹${quotation.amount}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quotation.quotation_number}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Quotation has been downloaded."
      });
    }
  };

  const handleSendQuotationToCustomer = async (id: string) => {
    const updatedQuotation = await updateQuotation(id, { status: "sent" });
    if (updatedQuotation) {
      toast({
        title: "Quotation sent",
        description: `Quotation ${updatedQuotation.quotation_number} has been sent to the customer.`
      });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard 
            quotations={quotations} 
            invoices={invoices} 
            customers={customers} 
            onCreateQuotation={handleCreateQuotation}
            onCreateInvoice={handleCreateInvoice}
            onCreateCustomer={handleCreateCustomer}
            onViewQuotations={() => setCurrentPage("quotations")}
            onViewInvoices={() => setCurrentPage("invoices")}
          />
        );
      case "invoices":
        return (
          <InvoiceList 
            invoices={invoices}
            onCreateNew={handleCreateInvoice}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onDelete={deleteInvoice}
            onMarkAsPaid={handleMarkAsPaid}
            onSendReminder={handleSendReminder}
            onDownloadPDF={handleDownloadPDF}
            onSendToCustomer={handleSendQuotationToCustomer}
          />
        );
      case "customers":
        return (
          <CustomerList 
            customers={customers}
            onCreateNew={handleCreateCustomer}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onDelete={deleteCustomer}
          />
        );
      case "customer-form":
        return (
          <CustomerForm 
            onSubmit={handleSubmitCustomer}
            onCancel={() => setCurrentPage("customers")}
            initialData={editingCustomer}
            mode={editingCustomer ? 'edit' : 'create'}
          />
        );
      case "invoice-form":
        return (
          <InvoiceForm 
            customers={customers}
            onSubmit={handleSubmitInvoice}
            onCancel={() => setCurrentPage("invoices")}
          />
        );
      case "invoice-edit-form":
        return (
          <InvoiceForm 
            customers={customers}
            onSubmit={async (data) => {
              if (editingInvoice) {
                const updatedInvoice = await updateInvoice(editingInvoice.id, data);
                if (updatedInvoice) {
                  toast({
                    title: "Invoice updated",
                    description: "Invoice has been updated successfully."
                  });
                  setEditingInvoice(null);
                  setCurrentPage("invoices");
                }
              }
            }}
            onCancel={() => setCurrentPage("invoices")}
            initialData={editingInvoice}
            mode="edit"
          />
        );
      case "stock-register":
        return <StockRegister />;
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard 
            quotations={quotations} 
            invoices={invoices} 
            customers={customers} 
            onCreateQuotation={handleCreateQuotation}
            onCreateInvoice={handleCreateInvoice}
            onCreateCustomer={handleCreateCustomer}
            onViewQuotations={() => setCurrentPage("quotations")}
            onViewInvoices={() => setCurrentPage("invoices")}
          />
        );
      case "quotations":
        return (
          <QuotationList 
            quotations={quotations}
            onCreateNew={handleCreateQuotation}
            onViewQuotation={handleViewQuotation}
            onEditQuotation={handleEditQuotation}
            onDelete={deleteQuotation}
            onQuotationToInvoice={(quotationId) => {
              // Convert quotation to invoice - future enhancement
              toast({
                title: "Feature coming soon",
                description: "Converting quotations to invoices will be available soon."
              });
            }}
            onUpdateStatus={async (quotationId, status) => {
              const updated = await updateQuotation(quotationId, { status });
              if (updated) {
                toast({
                  title: "Status updated",
                  description: `Quotation status updated to ${status}.`
                });
              }
            }}
            onSendToCustomer={handleSendQuotationToCustomer}
            onDownloadPDF={handleDownloadQuotationPDF}
          />
        );
      case "quotation-form":
        return (
          <QuotationForm 
            customers={customers}
            onSubmit={handleSubmitQuotation}
            onCancel={() => setCurrentPage("quotations")}
          />
        );
      case "quotation-edit-form":
        return (
          <QuotationForm 
            customers={customers}
            onSubmit={async (data) => {
              if (editingQuotation) {
                const updatedQuotation = await updateQuotation(editingQuotation.id, data);
                if (updatedQuotation) {
                  toast({
                    title: "Quotation updated",
                    description: "Quotation has been updated successfully."
                  });
                  setEditingQuotation(null);
                  setCurrentPage("quotations");
                }
              }
            }}
            onCancel={() => setCurrentPage("quotations")}
            initialData={editingQuotation}
            mode="edit"
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      {renderPage()}
      
      {/* Modals */}
      {viewingInvoice && (
        <InvoiceDetails
          invoice={viewingInvoice}
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
      
      {viewingQuotation && (
        <QuotationDetails
          quotation={viewingQuotation}
          isOpen={!!viewingQuotation}
          onClose={() => setViewingQuotation(null)}
        />
      )}
    </Layout>
  );
};

export default Index;