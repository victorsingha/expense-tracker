import type { Expense } from "@/types/expense"

const TITLES: Record<string, string[]> = {
  Food: ["Grocery shopping", "Zomato order", "Swiggy order", "Cafe coffee", "Pizza delivery", "Burger", "Lunch", "Dinner", "Bakery", "Ice cream"],
  Transport: ["Uber ride", "Ola ride", "Petrol", "Bus ticket", "Metro pass", "Cab", "Auto ride", "Train ticket", "Parking", "Toll"],
  Shopping: ["Amazon order", "Clothing", "Shoes", "Electronics", "Home decor", "Books", "Kitchen item", "Watch", "Bag", "Furniture"],
  Bills: ["Electricity bill", "Rent", "Wifi recharge", "Phone recharge", "Water bill", "Gas bill", "EMI", "Insurance", "Maintenance", "Loan payment"],
  Entertainment: ["Netflix subscription", "Movie ticket", "Spotify premium", "Concert", "Game purchase", "YouTube premium", "Hotstar", "Event ticket", "Arcade", "Streaming"],
  Health: ["Doctor visit", "Medicine", "Gym membership", "Health checkup", "Dental", "Eye checkup", "Pharmacy", "Vitamins", "Therapy", "Blood test"],
  Other: ["Gift", "Donation", "Charity", "Misc", "Cash withdrawal", "ATM fee", "Subscription", "Membership", "Tax", "Fine"],
}

const CATEGORIES = Object.keys(TITLES)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomAmount(category: string): number {
  switch (category) {
    case "Food": return Math.round((Math.random() * 1200 + 80) / 10) * 10
    case "Transport": return Math.round((Math.random() * 800 + 50) / 10) * 10
    case "Shopping": return Math.round((Math.random() * 5000 + 200) / 10) * 10
    case "Bills": return Math.round((Math.random() * 8000 + 300) / 10) * 10
    case "Entertainment": return Math.round((Math.random() * 1500 + 100) / 10) * 10
    case "Health": return Math.round((Math.random() * 2000 + 100) / 10) * 10
    default: return Math.round((Math.random() * 1000 + 50) / 10) * 10
  }
}

function randomDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  return d.toISOString().slice(0, 10)
}

export function generateSeedData(count: number): Expense[] {
  const data: Expense[] = []
  for (let i = 0; i < count; i++) {
    const cat = pick(CATEGORIES)
    data.push({
      id: `seed-${i}`,
      title: pick(TITLES[cat]),
      amount: randomAmount(cat),
      category: cat,
      date: randomDate(90),
    })
  }
  return data
}
