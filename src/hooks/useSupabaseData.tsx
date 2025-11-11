import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string | null;
  customer?: Customer | null;
  date: string;
  valid_until: string | null;
  amount: number;
  subtotal: number;
  tax_amount: number;
  tax_type: string | null;
  status: string;
  items: any[];
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  gst_no?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_company?: string;
  customer_gst_no?: string;
  customer_city?: string;
  customer_state?: string;
  customer_pincode?: string;
  subtotal: number;
  tax_amount: number;
  tax_rate?: number;
  total_amount: number;
  invoice_date: string;
  due_date?: string;
  status: string;
  items: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  customer_name: string;
  invoice_id?: string;
  notes?: string;
  created_at: string;
  user_id?: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch customers
      const { data: customersData } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch quotations with customer data
      const { data: quotationsData } = await supabase
        .from("quotations")
        .select(`
          *,
          customer:customer_id(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setCustomers(customersData || []);
      setInvoices((invoicesData || []).map(i => ({
        ...i,
        items: Array.isArray(i.items) ? i.items : []
      })));
      setQuotations((quotationsData || []).map(q => ({
        ...q,
        items: Array.isArray(q.items) ? q.items : []
      })));
      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addCustomer = async (customerData: Omit<Customer, "id" | "created_at" | "updated_at">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add customers.",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert([{ ...customerData, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setCustomers(prev => [data, ...prev]);
      return data;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer.",
        variant: "destructive",
      });
    }
    return null;
  };

  const addInvoice = async (invoiceData: Omit<Invoice, "id" | "invoice_number" | "created_at" | "updated_at">, invoicePrefix: string = "INV-") => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create invoices.",
        variant: "destructive",
      });
      return null;
    }

    // Generate invoice number
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const invoiceNumber = `${invoicePrefix}${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert([{ 
        ...invoiceData, 
        invoice_number: invoiceNumber,
        user_id: user.id
      }])
      .select()
      .single();

    if (!error && data) {
      const processedData = {
        ...data,
        items: Array.isArray(data.items) ? data.items : []
      };
      setInvoices(prev => [processedData, ...prev]);
      return processedData;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice.",
        variant: "destructive",
      });
    }
    return null;
  };

  const updateInvoice = async (invoiceId: string, invoiceData: Partial<Invoice>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update invoices.",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(invoiceData)
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (!error && data) {
      const processedData = {
        ...data,
        items: Array.isArray(data.items) ? data.items : []
      };
      setInvoices(prev => prev.map(i => i.id === invoiceId ? processedData : i));
      return processedData;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice.",
        variant: "destructive",
      });
    }
    return null;
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete invoices.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (!error) {
      setInvoices(prev => prev.filter(i => i.id !== invoiceId));
      return true;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice.",
        variant: "destructive",
      });
    }
    return false;
  };

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update customers.",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (!error && data) {
      setCustomers(prev => prev.map(c => c.id === customerId ? data : c));
      return data;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer.",
        variant: "destructive",
      });
    }
    return null;
  };

  const deleteCustomer = async (customerId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete customers.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
      .eq("user_id", user.id);

    if (!error) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      return true;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer.",
        variant: "destructive",
      });
    }
    return false;
  };

  const addPayment = async (paymentData: Omit<Payment, "id" | "created_at">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to record payments.",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from("payments")
      .insert([{ ...paymentData, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setPayments(prev => [data, ...prev]);
      return data;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment.",
        variant: "destructive",
      });
    }
    return null;
  };

  const addQuotation = async (quotationData: Omit<Quotation, "id" | "quotation_number" | "created_at" | "updated_at">, quotationPrefix?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create quotations.",
        variant: "destructive",
      });
      return null;
    }

    // Generate quotation number with prefix from settings
    const { count } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const prefix = quotationPrefix || "QUO/2526/";
    const quotationNumber = `${prefix}${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from("quotations")
      .insert([{ 
        ...quotationData, 
        quotation_number: quotationNumber,
        user_id: user.id
      }])
      .select()
      .single();

    if (!error && data) {
      const processedData = {
        ...data,
        items: Array.isArray(data.items) ? data.items : []
      };
      setQuotations(prev => [processedData, ...prev]);
      return processedData;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create quotation.",
        variant: "destructive",
      });
    }
    return null;
  };

  const updateQuotation = async (quotationId: string, quotationData: Partial<Quotation>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update quotations.",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from("quotations")
      .update(quotationData)
      .eq("id", quotationId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (!error && data) {
      const processedData = {
        ...data,
        items: Array.isArray(data.items) ? data.items : []
      };
      setQuotations(prev => prev.map(q => q.id === quotationId ? processedData : q));
      return processedData;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quotation.",
        variant: "destructive",
      });
    }
    return null;
  };

  const deleteQuotation = async (quotationId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete quotations.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("quotations")
      .delete()
      .eq("id", quotationId)
      .eq("user_id", user.id);

    if (!error) {
      setQuotations(prev => prev.filter(q => q.id !== quotationId));
      return true;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quotation.",
        variant: "destructive",
      });
    }
    return false;
  };

  return {
    customers,
    invoices,
    quotations,
    payments,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    addPayment,
    refreshData: fetchData
  };
};
