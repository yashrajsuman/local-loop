export type EventType = "event" | "deal"

export type Category = "Food" | "Music" | "Workshop" | "Sale" | "Community Meetup" | "Garage Sale"

export interface Item {
  id: string
  type: EventType
  title: string
  description: string
  category: Category
  startDate: string
  endDate: string
  address: string
  location: {
    lat: number
    lng: number
  }
  image: string
  createdBy: string
  createdAt: string
  updatedAt: string
  distance?: number  // Distance in kilometers from user's location
}

export interface User {
  id: string
  name: string
  email: string
  items?: Item[]
}

export interface FilterOptions {
  category?: Category | null
  dateRange?: {
    start: Date | null
    end: Date | null
  } | null
  type?: EventType | null
  searchTerm?: string
  location?: {
    lat: number
    lng: number
  } | null
  radius?: number
  createdBy?: string  // Added to filter items by creator
}
