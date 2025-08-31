import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, ArrowRight, Calendar, Droplets, Sun, Leaf } from "lucide-react"

type Recommendation = {
  id: string
  title: string
  description: string
  category: 'irrigation' | 'fertilization' | 'pest_control' | 'harvesting' | 'other'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  date: string
  farm: string
  impact?: string
  estimatedTime?: string
  cost?: {
    amount: number
    currency: string
  }
}

const categoryIcons = {
  irrigation: Droplets,
  fertilization: Leaf,
  pest_control: AlertCircle,
  harvesting: Calendar,
  other: Sun,
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  
  // Mock data - replace with API call in production
  const recommendations: Recommendation[] = [
    {
      id: 'R1001',
      title: 'Adjust irrigation schedule',
      description: 'Soil moisture levels indicate over-watering in the north field. Recommend reducing irrigation frequency from daily to every other day.',
      category: 'irrigation',
      priority: 'high',
      status: 'pending',
      date: '2023-11-05',
      farm: 'North Field',
      impact: 'High - Can reduce water usage by 30%',
      estimatedTime: '1 hour',
      cost: {
        amount: 0,
        currency: 'KSh'
      }
    },
    {
      id: 'R1002',
      title: 'Apply nitrogen fertilizer',
      description: 'Soil test shows nitrogen levels are low. Recommend applying 50kg of CAN fertilizer per acre before the next rain.',
      category: 'fertilization',
      priority: 'medium',
      status: 'in_progress',
      date: '2023-11-03',
      farm: 'All Fields',
      impact: 'Medium - Expected yield increase of 15-20%',
      estimatedTime: '4 hours',
      cost: {
        amount: 5000,
        currency: 'KSh'
      }
    },
    {
      id: 'R1003',
      title: 'Schedule pest control',
      description: 'Early signs of fall armyworm detected in the south field. Recommend applying appropriate pesticide within the next 3 days.',
      category: 'pest_control',
      priority: 'high',
      status: 'pending',
      date: '2023-11-06',
      farm: 'South Field',
      impact: 'Critical - Risk of 40-60% crop loss',
      estimatedTime: '2 hours',
      cost: {
        amount: 3500,
        currency: 'KSh'
      }
    },
    {
      id: 'R1004',
      title: 'Harvest maize in west field',
      description: 'Maize in the west field has reached physiological maturity. Recommend harvesting within the next 5-7 days for optimal yield and quality.',
      category: 'harvesting',
      priority: 'medium',
      status: 'pending',
      date: '2023-11-01',
      farm: 'West Field',
      impact: 'High - Risk of post-harvest losses if delayed',
      estimatedTime: '2 days',
      cost: {
        amount: 10000,
        currency: 'KSh'
      }
    },
  ]

  const filteredRecommendations = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.status === activeTab)

  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-800 bg-yellow-50">Pending</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">Completed</Badge>
      case 'dismissed':
        return <Badge variant="outline" className="border-gray-200 text-gray-800 bg-gray-50">Dismissed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const getCategoryIcon = (category: Recommendation['category']) => {
    const Icon = categoryIcons[category] || categoryIcons.other
    return <Icon className="h-5 w-5 text-muted-foreground" />
  }

  const markAsCompleted = (id: string) => {
    // In a real app, this would update the status via an API call
    console.log(`Marked recommendation ${id} as completed`)
  }

  const dismissRecommendation = (id: string) => {
    // In a real app, this would update the status via an API call
    console.log(`Dismissed recommendation ${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations to optimize your farm operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {filteredRecommendations.length} {filteredRecommendations.length === 1 ? 'recommendation' : 'recommendations'} found
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => (
              <Card key={rec.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="p-4 pr-0">
                    <div className="flex h-full items-center justify-center p-2">
                      {getCategoryIcon(rec.category)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {rec.farm} • {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          {getStatusBadge(rec.status)}
                          {getPriorityBadge(rec.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{rec.description}</p>
                      
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                        {rec.impact && (
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Impact</p>
                              <p className="text-muted-foreground">{rec.impact}</p>
                            </div>
                          </div>
                        )}
                        
                        {rec.estimatedTime && (
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Estimated Time</p>
                              <p className="text-muted-foreground">{rec.estimatedTime}</p>
                            </div>
                          </div>
                        )}
                        
                        {rec.cost && (
                          <div className="flex items-start">
                            <span className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0">KSh</span>
                            <div>
                              <p className="font-medium">Estimated Cost</p>
                              <p className="text-muted-foreground">
                                {new Intl.NumberFormat('en-KE').format(rec.cost.amount)} {rec.cost.currency}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t px-6 py-3">
                      <Button variant="ghost" onClick={() => dismissRecommendation(rec.id)}>
                        Dismiss
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline">
                          Schedule <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button onClick={() => markAsCompleted(rec.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </Button>
                      </div>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No recommendations found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {activeTab === 'all' 
                  ? 'You have no recommendations at this time.' 
                  : `You have no ${activeTab.replace('_', ' ')} recommendations.`}
              </p>
              <Button variant="outline">Refresh</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
