import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter, Download, Phone, MapPin, Mail } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Supplier = {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  location: string
  supplies: string[]
  rating: number
  status: 'active' | 'inactive' | 'suspended'
}

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Mock data - replace with API call in production
  const suppliers: Supplier[] = [
    {
      id: "S1001",
      name: "AgroSupplies Ltd",
      contactPerson: "David Kimani",
      email: "david@agrosupplies.co.ke",
      phone: "+254712345678",
      location: "Nairobi",
      supplies: ["Fertilizers", "Seeds", "Pesticides"],
      rating: 4.5,
      status: "active"
    },
    {
      id: "S1002",
      name: "GreenFarm Inputs",
      contactPerson: "Sarah Muthoni",
      email: "info@greenfarm.co.ke",
      phone: "+254723456789",
      location: "Nakuru",
      supplies: ["Seeds", "Irrigation"],
      rating: 4.2,
      status: "active"
    },
    {
      id: "S1003",
      name: "FarmTech Solutions",
      contactPerson: "Peter Kariuki",
      email: "sales@farmtech.co.ke",
      phone: "+254734567890",
      location: "Eldoret",
      supplies: ["Farm Equipment", "Spare Parts"],
      rating: 3.8,
      status: "inactive"
    },
    {
      id: "S1004",
      name: "AgriChem Kenya",
      contactPerson: "Lucy Wanjiru",
      email: "lucy@agrichem.co.ke",
      phone: "+254745678901",
      location: "Kisumu",
      supplies: ["Fertilizers", "Herbicides", "Pesticides"],
      rating: 4.0,
      status: "suspended"
    },
  ]

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplies.some(supply => 
      supply.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const getStatusBadge = (status: Supplier['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'inactive':
        return <Badge variant="outline" className="border-gray-300 text-gray-600">Inactive</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and their information
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col justify-between p-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search suppliers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Inactive</DropdownMenuItem>
                <DropdownMenuItem>Suspended</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                  </div>
                  {getStatusBadge(supplier.status)}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${supplier.email}`} className="hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${supplier.phone}`} className="hover:underline">
                      {supplier.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{supplier.location}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Supplies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplier.supplies.map((supply) => (
                      <Badge key={supply} variant="secondary">
                        {supply}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  {renderRatingStars(supplier.rating)}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
