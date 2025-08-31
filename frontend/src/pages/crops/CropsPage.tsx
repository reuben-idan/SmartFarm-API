import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CropsPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Crops</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Crops management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
