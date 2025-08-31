import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FarmersPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Farmers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Farmers management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
