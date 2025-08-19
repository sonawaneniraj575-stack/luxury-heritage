import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Package,
  AlertCircle,
  Star,
  DollarSign,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  category: string;
  stock_count: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  is_bestseller: boolean;
  is_limited_edition: boolean;
  is_new_arrival: boolean;
  created_at: string;
  images: any[];
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const filters: any = {
        sortBy,
        sortOrder,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
      };
      
      if (categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const { products: fetchedProducts } = await api.getProducts(filters);
      setProducts(fetchedProducts);
      
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await api.deleteProduct(productId);
      await loadProducts();
      // Log admin action
      await api.logAdminAction('delete', 'product', productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await api.updateProduct(productId, { is_active: !currentStatus });
      await loadProducts();
      // Log admin action
      await api.logAdminAction(
        currentStatus ? 'deactivate' : 'activate', 
        'product', 
        productId
      );
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      alert('Please select products first');
      return;
    }
    
    if (!confirm(`Are you sure you want to ${action} ${selectedProducts.length} product(s)?`)) {
      return;
    }
    
    try {
      for (const productId of selectedProducts) {
        switch (action) {
          case 'activate':
            await api.updateProduct(productId, { is_active: true });
            break;
          case 'deactivate':
            await api.updateProduct(productId, { is_active: false });
            break;
          case 'delete':
            await api.deleteProduct(productId);
            break;
        }
        
        // Log admin action
        await api.logAdminAction(action, 'product', productId);
      }
      
      setSelectedProducts([]);
      await loadProducts();
      
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === products.length 
        ? [] 
        : products.map(p => p.id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-luxury-heading font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your luxury product catalog</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="bg-gold hover:bg-gold/90 text-navy">
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="perfume">Perfumes</SelectItem>
                <SelectItem value="watch">Watches</SelectItem>
                <SelectItem value="limited-edition">Limited Edition</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="price-asc">Price Low-High</SelectItem>
                <SelectItem value="price-desc">Price High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onCheckedChange={selectAllProducts}
                    />
                  </th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Rating</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {product.images?.[0] ? (
                              <img 
                                src={product.images[0].url} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                            <div className="flex space-x-2 mt-1">
                              {product.is_bestseller && (
                                <Badge variant="secondary" className="text-xs">Bestseller</Badge>
                              )}
                              {product.is_limited_edition && (
                                <Badge variant="outline" className="text-xs">Limited</Badge>
                              )}
                              {product.is_new_arrival && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {product.category.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">${product.price}</span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.original_price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={product.stock_count <= 5 ? 'text-red-600' : 'text-green-600'}>
                            {product.stock_count}
                          </span>
                          {product.stock_count <= 5 && (
                            <AlertCircle size={14} className="text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <Star size={14} className="text-gold fill-current" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({product.review_count})
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleProductStatus(product.id, product.is_active)}
                          >
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Link to={`/admin/products/${product.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye size={14} />
                            </Button>
                          </Link>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Edit size={14} />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;