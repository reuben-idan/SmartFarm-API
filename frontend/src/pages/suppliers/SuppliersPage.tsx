import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuppliersPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Suppliers management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
