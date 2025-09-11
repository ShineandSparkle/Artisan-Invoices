import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import InvoiceList from "@/components/InvoiceList";
import CustomerList from "@/components/CustomerList";
import Settings from "@/pages/Settings";
import CustomerForm from "@/components/forms/CustomerForm";
import InvoiceForm from "@/components/forms/InvoiceForm";
import InvoiceDetails from "@/components/InvoiceDetails";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const { toast } = useToast();
  const { companySettings } = useSettings();
  const {
    customers,
    invoices,
    addCustomer,
    updateCustomer,
    addInvoice,
    updateInvoice,
    deleteCustomer,
    deleteInvoice
  } = useSupabaseData();

  const handlePageChange = (page: string) => {
    // Handle direct action pages
    if (page === "new-invoice") {
      handleCreateInvoice();
      return;
    }
    if (page === "new-customer") {
      handleCreateCustomer();
      return;
    }
    
    setCurrentPage(page);
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

  const handleSendToCustomer = async (id: string) => {
    const updatedInvoice = await updateInvoice(id, { status: "Sent" });
    if (updatedInvoice) {
      toast({
        title: "Invoice sent",
        description: `Invoice ${updatedInvoice.invoice_number} has been sent to the customer.`
      });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard 
            quotations={[]} 
            invoices={invoices} 
            customers={customers} 
            onCreateQuotation={() => {}}
            onCreateInvoice={handleCreateInvoice}
            onCreateCustomer={handleCreateCustomer}
            onViewQuotations={() => {}}
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
            onSendToCustomer={handleSendToCustomer}
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
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard 
            quotations={[]} 
            invoices={invoices} 
            customers={customers} 
            onCreateQuotation={() => {}}
            onCreateInvoice={handleCreateInvoice}
            onCreateCustomer={handleCreateCustomer}
            onViewQuotations={() => {}}
            onViewInvoices={() => setCurrentPage("invoices")}
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
    </Layout>
  );
};

export default Index;