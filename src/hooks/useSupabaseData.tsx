import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  address?: string;
  gst_no?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_gst_no?: string;
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
}

export const useSupabaseData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch customers
      const { data: customersData } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch quotations with customer data
      const { data: quotationsData } = await supabase
        .from("quotations")
        .select(`
          *,
          customer:customers(*)
        `)
        .order("created_at", { ascending: false });

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("customers")
      .insert([customerData])
      .select()
      .single();

    if (!error && data) {
      setCustomers(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const addInvoice = async (invoiceData: Omit<Invoice, "id" | "invoice_number" | "created_at" | "updated_at">) => {
    // Generate invoice number
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert([{ 
        ...invoiceData, 
        invoice_number: invoiceNumber 
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
    return null;
  };

  const updateInvoice = async (invoiceId: string, invoiceData: Partial<Invoice>) => {
    const { data, error } = await supabase
      .from("invoices")
      .update(invoiceData)
      .eq("id", invoiceId)
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
    return null;
  };

  const deleteInvoice = async (invoiceId: string) => {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (!error) {
      setInvoices(prev => prev.filter(i => i.id !== invoiceId));
      return true;
    }
    return false;
  };

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .select()
      .single();

    if (!error && data) {
      setCustomers(prev => prev.map(c => c.id === customerId ? data : c));
      return data;
    }
    return null;
  };

  const deleteCustomer = async (customerId: string) => {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (!error) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      return true;
    }
    return false;
  };

  const addPayment = async (paymentData: Omit<Payment, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();

    if (!error && data) {
      setPayments(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const addQuotation = async (quotationData: Omit<Quotation, "id" | "quotation_number" | "created_at" | "updated_at">) => {
    // Generate quotation number
    const { count } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true });

    const quotationNumber = `QUO-${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from("quotations")
      .insert([{ 
        ...quotationData, 
        quotation_number: quotationNumber,
        user_id: (await supabase.auth.getUser()).data.user?.id || null
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
    return null;
  };

  const updateQuotation = async (quotationId: string, quotationData: Partial<Quotation>) => {
    const { data, error } = await supabase
      .from("quotations")
      .update(quotationData)
      .eq("id", quotationId)
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
    return null;
  };

  const deleteQuotation = async (quotationId: string) => {
    const { error } = await supabase
      .from("quotations")
      .delete()
      .eq("id", quotationId);

    if (!error) {
      setQuotations(prev => prev.filter(q => q.id !== quotationId));
      return true;
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