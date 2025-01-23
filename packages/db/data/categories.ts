import type { Category } from ".."

export const category_types = [
	"food",
	"earnings",
	"finances",
	"entertainment",
	"health",
	"pets",
	"lifestyle",
	"travel",
	"other",
	"savings",
	"utilities",
	"shopping",
	"charity",
	"business",
] as const

export const categories = [
	// Food
	{
		id: "coffee",
		name: "Coffee",
		type: "food",
	},
	{
		id: "groceries",
		name: "Groceries",
		type: "food",
	},
	{
		id: "food-delivery",
		name: "Food Delivery",
		type: "food",
	},
	{
		id: "restaurant",
		name: "Restaurant",
		type: "food",
	},
	// Earnings
	{
		id: "salary",
		name: "Salary",
		type: "earnings",
	},
	{
		id: "benefits",
		name: "Benefits",
		type: "earnings",
	},

	// Finances
	{
		id: "taxes",
		name: "Taxes",
		type: "finances",
	},
	{
		id: "loan",
		name: "Loan",
		type: "finances",
	},
	{
		id: "donations",
		name: "Donations",
		type: "finances",
	},
	{
		id: "subscriptions",
		name: "Subscriptions",
		type: "finances",
	},
	{
		id: "insurances",
		name: "Insurances",
		type: "finances",
	},
	// Entertainment
	{
		id: "gaming",
		name: "Gaming",
		type: "entertainment",
	},
	{
		id: "in-app-purchases",
		name: "In-App Purchases",
		type: "entertainment",
	},
	{
		id: "subscriptions",
		name: "Subscriptions",
		type: "entertainment",
	},
	{
		id: "streaming",
		name: "Streaming",
		type: "entertainment",
	},
	{
		id: "movies",
		name: "Movies",
		type: "entertainment",
	},
	{
		id: "music",
		name: "Music",
		type: "entertainment",
	},
	{
		id: "books",
		name: "Books",
		type: "entertainment",
	},
	{
		id: "vacation",
		name: "Vacation",
		type: "entertainment",
	},
	// Health
	{
		id: "gym",
		name: "Gym",
		type: "health",
	},
	{
		id: "pharmacy",
		name: "Pharmacy",
		type: "health",
	},
	{
		id: "medical-bills",
		name: "Medical Bills",
		type: "health",
	},
	// Pets
	{
		id: "pet-supplies",
		name: "Pet Supplies",
		type: "pets",
	},
	{
		id: "pet-care",
		name: "Pet Care",
		type: "pets",
	},
	// Lifestyle
	{
		id: "clothing",
		name: "Clothing",
		type: "lifestyle",
	},
	{
		id: "beauty",
		name: "Beauty",
		type: "lifestyle",
	},
	{
		id: "hair-care",
		name: "Hair Care",
		type: "lifestyle",
	},
	// Travel
	{
		id: "car",
		name: "Car",
		type: "travel",
	},
	{
		id: "public-transport",
		name: "Public Transport",
		type: "travel",
	},
	{
		id: "taxi",
		name: "Taxi",
		type: "travel",
	},
	{
		id: "bike",
		name: "Bike",
		type: "travel",
	},
	// Shopping
	{
		id: "shopping",
		name: "Shopping",
		type: "shopping",
	},
	// Charity
	{
		id: "charity",
		name: "Charity",
		type: "charity",
	},
	// Other
	{
		id: "uncategorized",
		name: "Uncategorized",
		type: "other",
	},
	// Savings
	{
		id: "savings",
		name: "Savings",
		type: "savings",
	},
	{
		id: "investments",
		name: "Investments",
		type: "savings",
	},
	// Utilities
	{
		id: "electricity",
		name: "Electricity",
		type: "utilities",
	},
	{
		id: "water",
		name: "Water",
		type: "utilities",
	},
	{
		id: "internet",
		name: "Internet",
		type: "utilities",
	},
	{
		id: "phone",
		name: "Phone",
		type: "utilities",
	},
	{
		id: "gas",
		name: "Gas",
		type: "utilities",
	},
	{
		id: "ai",
		name: "AI Tools",
		type: "utilities",
	},
	// Software Engineering
	{
		id: "cloud",
		name: "Cloud",
		type: "business",
	},
] as const satisfies Category[]
