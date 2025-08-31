import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter, Download, ArrowUpDown } from "lucide-react"
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

type Crop = {
  id: string
  name: string
  variety: string
  plantingDate: string
  harvestDate: string
  area: number
  status: 'growing' | 'harvested' | 'planned'
  farmer: string
  yieldEstimate: number
}

export default function CropsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{key: keyof Crop; direction: 'asc' | 'desc'} | null>(null)
  
  // Mock data - replace with API call in production
  const crops: Crop[] = [
    {
      id: "C1001",
      name: "Maize",
      variety: "DH04",
      plantingDate: "2023-03-15",
      harvestDate: "2023-07-20",
      area: 2.5,
      status: "growing",
      farmer: "John Kamau",
      yieldEstimate: 3.2
    },
    {
      id: "C1002",
      name: "Beans",
      variety: "GLP-2",
      plantingDate: "2023-04-01",
      harvestDate: "2023-06-15",
      area: 1.2,
      status: "harvested",
      farmer: "Mary Wanjiku",
      yieldEstimate: 0.8
    },
    {
      id: "C1003",
      name: "Wheat",
      variety: "KWALE",
      plantingDate: "2023-05-10",
      harvestDate: "2023-09-15",
      area: 3.0,
      status: "growing",
      farmer: "James Mwangi",
      yieldEstimate: 4.5
    },
    {
      id: "C1004",
      name: "Potatoes",
      variety: "Shangi",
      plantingDate: "2023-06-01",
      harvestDate: "2023-10-15",
      area: 1.8,
      status: "planned",
      farmer: "Grace Wambui",
      yieldEstimate: 0
    },
  ]

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.farmer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedCrops = [...filteredCrops].sort((a, b) => {
    if (!sortConfig) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const requestSort = (key: keyof Crop) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getStatusBadge = (status: Crop['status']) => {
    switch (status) {
      case 'growing':
        return <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">Growing</Badge>
      case 'harvested':
        return <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">Harvested</Badge>
      case 'planned':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-800 bg-yellow-50">Planned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crops</h1>
          <p className="text-muted-foreground">
            Track and manage all crop information
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Crop
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col justify-between p-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search crops..."
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
                <DropdownMenuItem>Growing</DropdownMenuItem>
                <DropdownMenuItem>Harvested</DropdownMenuItem>
                <DropdownMenuItem>Planned</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">
                  Crop
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => requestSort('plantingDate')}
              >
                <div className="flex items-center">
                  Planted
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Area (acres)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCrops.length > 0 ? (
              sortedCrops.map((crop) => (
                <TableRow key={crop.id}>
                  <TableCell className="font-medium">{crop.name}</TableCell>
                  <TableCell>{crop.variety}</TableCell>
                  <TableCell>{crop.farmer}</TableCell>
                  <TableCell>{new Date(crop.plantingDate).toLocaleDateString()}</TableCell>
                  <TableCell>{crop.area} acres</TableCell>
                  <TableCell>{getStatusBadge(crop.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No crops found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
