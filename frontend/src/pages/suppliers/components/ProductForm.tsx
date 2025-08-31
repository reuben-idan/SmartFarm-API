import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suppliersService } from '@/services/api/suppliers.service';

const productCategories = [
  'seeds',
  'fertilizers',
  'pesticides',
  'herbicides',
  'fungicides',
  'equipment',
  'tools',
  'machinery',
  'irrigation',
  'other'
];

const units = [
  'kg', 'g', 'lb', 'oz',
  'L', 'mL', 'gal', 'fl oz',
  'units', 'packs', 'boxes', 'pallets'
];

const currencies = ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'ZAR'];

const formSchema = z.object({
  name: z.string().min(2, { message: 'Product name is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  unit: z.string().min(1, { message: 'Unit is required' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
  currency: z.string().length(3, { message: 'Currency is required' }),
  minOrderQuantity: z.coerce.number().min(1, { message: 'Minimum order must be at least 1' }).optional(),
  leadTimeDays: z.coerce.number().min(0, { message: 'Lead time cannot be negative' }).optional(),
});

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  product?: {
    id: string;
    name: string;
    category: string;
    unit: string;
    price: number;
    currency: string;
    minOrderQuantity?: number;
    leadTimeDays?: number;
  } | null;
  onSuccess: () => void;
}

export function ProductForm({ open, onOpenChange, supplierId, product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const isEdit = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      category: product?.category || '',
      unit: product?.unit || '',
      price: product?.price || 0,
      currency: product?.currency || 'USD',
      minOrderQuantity: product?.minOrderQuantity || 1,
      leadTimeDays: product?.leadTimeDays || 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (isEdit && product) {
        await suppliersService.updateSupplierProduct(
          supplierId,
          product.id,
          {
            name: values.name,
            category: values.category,
            unit: values.unit,
            price: values.price,
            currency: values.currency,
            minOrderQuantity: values.minOrderQuantity,
            leadTimeDays: values.leadTimeDays,
          }
        );
        
        toast({
          title: 'Success',
          description: 'Product updated successfully',
          variant: 'default',
        });
      } else {
        await suppliersService.addSupplierProduct(supplierId, {
          name: values.name,
          category: values.category,
          unit: values.unit,
          price: values.price,
          currency: values.currency,
          minOrderQuantity: values.minOrderQuantity,
          leadTimeDays: values.leadTimeDays,
        });
        
        toast({
          title: 'Success',
          description: 'Product added successfully',
          variant: 'default',
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minOrderQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="leadTimeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Add'} Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
