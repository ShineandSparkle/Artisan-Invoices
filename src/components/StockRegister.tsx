import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockData {
  size: string;
  openingStock: number;
  production: number;
  sales: number;
  closingStock: number;
}

interface Product {
  id: string;
  name: string;
  sizes: StockData[];
}

const SIZES = ["39", "40", "42", "44", "46"];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Shirt A",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "2",
    name: "Shirt B",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "3",
    name: "Shirt C",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "4",
    name: "Shirt D",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "5",
    name: "Shirt E",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "6",
    name: "Shirt F",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "7",
    name: "Shirt G",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "8",
    name: "Shirt H",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "9",
    name: "Shirt I",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
  {
    id: "10",
    name: "Shirt J",
    sizes: SIZES.map(size => ({
      size,
      openingStock: 0,
      production: 0,
      sales: 0,
      closingStock: 0,
    })),
  },
];

const StockRegister = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const calculateClosingStock = (openingStock: number, production: number, sales: number): number => {
    return openingStock + production - sales;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({
      title: "Product deleted",
      description: "Product has been removed from stock register.",
    });
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    const updatedProduct = {
      ...editingProduct,
      sizes: editingProduct.sizes.map(sizeData => ({
        ...sizeData,
        closingStock: calculateClosingStock(
          sizeData.openingStock,
          sizeData.production,
          sizeData.sales
        ),
      })),
    };

    setProducts(products.map(p => 
      p.id === editingProduct.id ? updatedProduct : p
    ));

    // Update opening stock for next selection to be closing stock
    const nextTimeProduct = {
      ...updatedProduct,
      sizes: updatedProduct.sizes.map(sizeData => ({
        ...sizeData,
        openingStock: sizeData.closingStock,
        production: 0,
        sales: 0,
      })),
    };

    setProducts(prev => prev.map(p => 
      p.id === editingProduct.id ? nextTimeProduct : p
    ));

    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({
      title: "Stock updated",
      description: "Product stock has been updated successfully.",
    });
  };

  const handleStockChange = (
    sizeIndex: number, 
    field: 'openingStock' | 'production' | 'sales', 
    value: string
  ) => {
    if (!editingProduct) return;

    const numValue = parseInt(value) || 0;
    const updatedSizes = [...editingProduct.sizes];
    updatedSizes[sizeIndex] = {
      ...updatedSizes[sizeIndex],
      [field]: numValue,
    };

    setEditingProduct({
      ...editingProduct,
      sizes: updatedSizes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Register</h1>
          <p className="text-muted-foreground">Manage inventory for all shirt products</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Stock Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Product</th>
                  {SIZES.map(size => (
                    <th key={size} className="text-center p-3 font-medium">Size {size}</th>
                  ))}
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{product.name}</td>
                    {product.sizes.map((sizeData, index) => (
                      <td key={index} className="p-3 text-center">
                        <div className="text-xs space-y-1">
                          <div>OS: {sizeData.openingStock}</div>
                          <div>P: {sizeData.production}</div>
                          <div>S: {sizeData.sales}</div>
                          <div className="font-bold text-primary">
                            CS: {calculateClosingStock(sizeData.openingStock, sizeData.production, sizeData.sales)}
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            <DialogTitle>Edit Stock - {editingProduct?.name}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {editingProduct.sizes.map((sizeData, index) => (
                  <div key={index} className="space-y-3 p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-center">Size {sizeData.size}</h4>
                    
                    <div>
                      <Label htmlFor={`opening-${index}`}>Opening Stock</Label>
                      <Input
                        id={`opening-${index}`}
                        type="number"
                        value={sizeData.openingStock}
                        onChange={(e) => handleStockChange(index, 'openingStock', e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`production-${index}`}>Production</Label>
                      <Input
                        id={`production-${index}`}
                        type="number"
                        value={sizeData.production}
                        onChange={(e) => handleStockChange(index, 'production', e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`sales-${index}`}>Sales</Label>
                      <Input
                        id={`sales-${index}`}
                        type="number"
                        value={sizeData.sales}
                        onChange={(e) => handleStockChange(index, 'sales', e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <Label>Closing Stock</Label>
                      <div className="text-lg font-bold text-primary">
                        {calculateClosingStock(sizeData.openingStock, sizeData.production, sizeData.sales)}
                      </div>
                    </div>
                  </div>
                ))}
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
            <DialogTitle>View Stock - {viewingProduct?.name}</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {viewingProduct.sizes.map((sizeData, index) => (
                  <div key={index} className="space-y-3 p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-center">Size {sizeData.size}</h4>
                    
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
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockRegister;