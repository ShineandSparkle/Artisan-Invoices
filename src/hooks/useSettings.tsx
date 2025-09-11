import { useState } from "react";

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxNumber: string;
  logo: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountHolderName?: string;
  branchAddress?: string;
  swiftCode?: string;
}

export interface InvoiceSettings {
  prefix: string;
  quotationPrefix: string;
  defaultTerms: string;
  defaultNotes: string;
  currency: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
  reminderDays: number;
}

export const useSettings = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "Your Company Name",
    email: "info@yourcompany.com",
    phone: "+91 98765 43210",
    address: "123 Business Street, City, State 12345",
    website: "www.yourcompany.com",
    taxNumber: "GSTIN123456789",
    logo: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    branchAddress: "",
    swiftCode: ""
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    prefix: "INV",
    quotationPrefix: "QUO",
    defaultTerms: "Payment is due within 30 days of invoice date.",
    defaultNotes: "Thank you for your business!",
    currency: "INR"
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    paymentReminders: false,
    reminderDays: 3
  });

  const [loading] = useState(false);

  const saveCompanySettings = async (settings: CompanySettings) => {
    setCompanySettings(settings);
    return true;
  };

  const saveInvoiceSettings = async (settings: InvoiceSettings) => {
    setInvoiceSettings(settings);
    return true;
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    return true;
  };

  return {
    companySettings,
    invoiceSettings,
    notificationSettings,
    loading,
    setCompanySettings,
    setInvoiceSettings,
    setNotificationSettings,
    saveCompanySettings,
    saveInvoiceSettings,
    saveNotificationSettings
  };
};