import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Eye, Plus, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useUserRole } from "@/hooks/useUserRole";

interface ProductStockData {
  product: string;
  sizes: {
    [size: string]: {
      openingStock: number;
      production: number;
      sales: number;
      closingStock: number;
    };
  };
}

interface StockEntry {
  id: string;
  product_name: string;
  size: string;
  month: number;
  year: number;
  opening_stock: number;
  production: number;
  sales: number;
  closing_stock: number;
}

const SIZES = ["39", "40", "42", "44", "46"];
const PRODUCTS = ["Dark Blue", "Ratan Blue", "White", "Black Plain", "Brown", "Jacuard White", "Jacuard Black",  "White Dotted", "Blue Dotted"];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

const StockRegister = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [products, setProducts] = useState<ProductStockData[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  
  const { toast } = useToast();
  const { fetchStockRegister, addStockEntry, updateStockEntry, deleteStockEntry } = useSupabaseData();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    loadStockData();
  }, [selectedMonth, selectedYear]);

  const loadStockData = async () => {
    const entries = await fetchStockRegister(selectedMonth, selectedYear);
    setStockEntries(entries);
    
    // Get previous month's closing stock for opening stock
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = prevYear - 1;
    }
    const prevEntries = await fetchStockRegister(prevMonth, prevYear);
    
    const productData: ProductStockData[] = PRODUCTS.map(productName => {
      const sizes: { [size: string]: any } = {};
      
      SIZES.forEach(size => {
        const existingEntry = entries.find(
          entry => entry.product_name === productName && entry.size === size
        );
        
        const prevEntry = prevEntries.find(
          entry => entry.product_name === productName && entry.size === size
        );
        
        if (existingEntry) {
          sizes[size] = {
            openingStock: existingEntry.opening_stock,
            production: existingEntry.production,
            sales: existingEntry.sales,
            closingStock: existingEntry.closing_stock
          };
        } else {
          // Use previous month's closing stock as opening stock
          sizes[size] = {
            openingStock: prevEntry?.closing_stock || 0,
            production: 0,
            sales: 0,
            closingStock: prevEntry?.closing_stock || 0
          };
        }
      });
      
      return { product: productName, sizes };
    });
    
    setProducts(productData);
  };

  const calculateClosingStock = (openingStock: number, production: number, sales: number): number => {
    return openingStock + production - sales;
  };

  const handleEdit = (productName: string) => {
    setEditingProduct(productName);
    setIsEditDialogOpen(true);
  };

  const handleView = (productName: string) => {
    setViewingProduct(productName);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (productName: string) => {
    const entriesToDelete = stockEntries.filter(
      entry => entry.product_name === productName
    );
    
    try {
      for (const entry of entriesToDelete) {
        await deleteStockEntry(entry.id);
      }
      
      await loadStockData();
      
      toast({
        title: "Product deleted",
        description: "Product stock entries have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product stock entries.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    const productData = products.find(p => p.product === editingProduct);
    if (!productData) return;

    try {
      // Update/create entries for each size
      for (const size of SIZES) {
        const sizeData = productData.sizes[size];
        const closingStock = calculateClosingStock(
          sizeData.openingStock,
          sizeData.production,
          sizeData.sales
        );

        const existingEntry = stockEntries.find(
          entry => entry.product_name === editingProduct && 
                  entry.size === size &&
                  entry.month === selectedMonth &&
                  entry.year === selectedYear
        );

        const stockData = {
          product_name: editingProduct,
          size: size,
          month: selectedMonth,
          year: selectedYear,
          opening_stock: sizeData.openingStock,
          production: sizeData.production,
          sales: sizeData.sales,
          closing_stock: closingStock
        };

        if (existingEntry) {
          await updateStockEntry(existingEntry.id, stockData);
        } else {
          await addStockEntry(stockData);
        }
      }

      await loadStockData();

      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Stock updated",
        description: "Product stock has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save stock data.",
        variant: "destructive",
      });
    }
  };

  const handleStockChange = (
    size: string, 
    field: 'openingStock' | 'production' | 'sales', 
    value: string
  ) => {
    if (!editingProduct) return;

    const numValue = parseInt(value) || 0;
    const updatedProducts = products.map(product => {
      if (product.product === editingProduct) {
        return {
          ...product,
          sizes: {
            ...product.sizes,
            [size]: {
              ...product.sizes[size],
              [field]: numValue,
            }
          }
        };
      }
      return product;
    });

    setProducts(updatedProducts);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #stock-register-print, #stock-register-print * {
            visibility: visible;
          }
          #stock-register-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-title {
            display: block !important;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          #stock-register-print table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          #stock-register-print th,
          #stock-register-print td {
            border: 2px solid #000;
            padding: 4px;
          }
          #stock-register-print tr {
            border: 3px solid #000;
          }
          #stock-register-print thead tr {
            background-color: #f0f0f0;
          }
        }
        .print-title {
          display: none;
        }
      `}</style>
      
      <Card className="w-full" id="stock-register-print">
        <CardHeader>
          <div className="print-title">
            Stock Register - {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </div>
          <div className="flex items-center justify-between gap-4 no-print">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="month-select">Month:</Label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="year-select">Year:</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026, 2027].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center flex-1">
              Stock Register - {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardTitle>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 font-semibold text-lg min-w-[120px]">Product</th>
                  {SIZES.map(size => (
                    <th key={size} className="text-center p-4 font-semibold text-lg min-w-[140px]">Size {size}</th>
                  ))}
                  <th className="text-center p-4 font-semibold text-lg min-w-[120px] no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4 font-medium text-base">{product.product}</td>
                    {SIZES.map((size) => {
                      const sizeData = product.sizes[size];
                      return (
                        <td key={size} className="p-4 text-center">
                          <div className="text-sm space-y-1">
                            <div className="font-medium">OS: {sizeData.openingStock}</div>
                            <div className="font-medium">P: {sizeData.production}</div>
                            <div className="font-medium">S: {sizeData.sales}</div>
                            <div className="font-bold text-primary text-base">
                              CS: {calculateClosingStock(sizeData.openingStock, sizeData.production, sizeData.sales)}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-4 no-print">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(product.product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product.product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stock - {editingProduct}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {SIZES.map((size) => {
                  const productData = products.find(p => p.product === editingProduct);
                  const sizeData = productData?.sizes[size];
                  
                  if (!sizeData) return null;
                  
                  return (
                    <div key={size} className="space-y-3 p-4 border border-border rounded-lg">
                      <h4 className="font-medium text-center">Size {size}</h4>
                      
                      <div>
                        <Label htmlFor={`opening-${size}`}>Opening Stock</Label>
                        <Input
                          id={`opening-${size}`}
                          type="number"
                          value={sizeData.openingStock}
                          onChange={(e) => handleStockChange(size, 'openingStock', e.target.value)}
                          min="0"
                          disabled={!isAdmin}
                          className={!isAdmin ? "opacity-50 cursor-not-allowed" : ""}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`production-${size}`}>Production</Label>
                        <Input
                          id={`production-${size}`}
                          type="number"
                          value={sizeData.production}
                          onChange={(e) => handleStockChange(size, 'production', e.target.value)}
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`sales-${size}`}>Sales</Label>
                        <Input
                          id={`sales-${size}`}
                          type="number"
                          value={sizeData.sales}
                          onChange={(e) => handleStockChange(size, 'sales', e.target.value)}
                          min="0"
                          disabled={!isAdmin}
                          className={!isAdmin ? "opacity-50 cursor-not-allowed" : ""}
                        />
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <Label>Closing Stock</Label>
                        <div className="text-lg font-bold text-primary">
                          {calculateClosingStock(sizeData.openingStock, sizeData.production, sizeData.sales)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Stock - {viewingProduct}</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {SIZES.map((size) => {
                  const productData = products.find(p => p.product === viewingProduct);
                  const sizeData = productData?.sizes[size];
                  
                  if (!sizeData) return null;
                  
                  return (
                    <div key={size} className="space-y-3 p-4 border border-border rounded-lg">
                      <h4 className="font-medium text-center">Size {size}</h4>
                      
                      <div>
                        <Label>Opening Stock</Label>
                        <div className="text-lg">{sizeData.openingStock}</div>
                      </div>
                      
                      <div>
                        <Label>Production</Label>
                        <div className="text-lg">{sizeData.production}</div>
                      </div>
                      
                      <div>
                        <Label>Sales</Label>
                        <div className="text-lg">{sizeData.sales}</div>
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <Label>Closing Stock</Label>
                        <div className="text-lg font-bold text-primary">
                          {calculateClosingStock(sizeData.openingStock, sizeData.production, sizeData.sales)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockRegister;