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
		id: "coffee" as Category["id"],
		name: "Coffee",
		type: "food",
	},
	{
		id: "groceries" as Category["id"],
		name: "Groceries",
		type: "food",
	},
	{
		id: "food-delivery" as Category["id"],
		name: "Food Delivery",
		type: "food",
	},
	{
		id: "restaurant" as Category["id"],
		name: "Restaurant",
		type: "food",
	},
	// Earnings
	{
		id: "salary" as Category["id"],
		name: "Salary",
		type: "earnings",
	},
	{
		id: "benefits" as Category["id"],
		name: "Benefits",
		type: "earnings",
	},

	// Finances
	{
		id: "taxes" as Category["id"],
		name: "Taxes",
		type: "finances",
	},
	{
		id: "loan" as Category["id"],
		name: "Loan",
		type: "finances",
	},
	{
		id: "donations" as Category["id"],
		name: "Donations",
		type: "finances",
	},
	{
		id: "subscriptions" as Category["id"],
		name: "Subscriptions",
		type: "finances",
	},
	{
		id: "insurances" as Category["id"],
		name: "Insurances",
		type: "finances",
	},
	// Entertainment
	{
		id: "gaming" as Category["id"],
		name: "Gaming",
		type: "entertainment",
	},
	{
		id: "in-app-purchases" as Category["id"],
		name: "In-App Purchases",
		type: "entertainment",
	},
	{
		id: "subscriptions" as Category["id"],
		name: "Subscriptions",
		type: "entertainment",
	},
	{
		id: "streaming" as Category["id"],
		name: "Streaming",
		type: "entertainment",
	},
	{
		id: "movies" as Category["id"],
		name: "Movies",
		type: "entertainment",
	},
	{
		id: "music" as Category["id"],
		name: "Music",
		type: "entertainment",
	},
	{
		id: "books" as Category["id"],
		name: "Books",
		type: "entertainment",
	},
	{
		id: "vacation" as Category["id"],
		name: "Vacation",
		type: "entertainment",
	},
	// Health
	{
		id: "gym" as Category["id"],
		name: "Gym",
		type: "health",
	},
	{
		id: "pharmacy" as Category["id"],
		name: "Pharmacy",
		type: "health",
	},
	{
		id: "medical-bills" as Category["id"],
		name: "Medical Bills",
		type: "health",
	},
	// Pets
	{
		id: "pet-supplies" as Category["id"],
		name: "Pet Supplies",
		type: "pets",
	},
	{
		id: "pet-care" as Category["id"],
		name: "Pet Care",
		type: "pets",
	},
	// Lifestyle
	{
		id: "clothing" as Category["id"],
		name: "Clothing",
		type: "lifestyle",
	},
	{
		id: "beauty" as Category["id"],
		name: "Beauty",
		type: "lifestyle",
	},
	{
		id: "hair-care" as Category["id"],
		name: "Hair Care",
		type: "lifestyle",
	},
	// Travel
	{
		id: "car" as Category["id"],
		name: "Car",
		type: "travel",
	},
	{
		id: "public-transport" as Category["id"],
		name: "Public Transport",
		type: "travel",
	},
	{
		id: "taxi" as Category["id"],
		name: "Taxi",
		type: "travel",
	},
	{
		id: "bike" as Category["id"],
		name: "Bike",
		type: "travel",
	},
	// Shopping
	{
		id: "shopping" as Category["id"],
		name: "Shopping",
		type: "shopping",
	},
	// Charity
	{
		id: "charity" as Category["id"],
		name: "Charity",
		type: "charity",
	},
	// Other
	{
		id: "uncategorized" as Category["id"],
		name: "Uncategorized",
		type: "other",
	},
	// Savings
	{
		id: "savings" as Category["id"],
		name: "Savings",
		type: "savings",
	},
	{
		id: "investments" as Category["id"],
		name: "Investments",
		type: "savings",
	},
	// Utilities
	{
		id: "electricity" as Category["id"],
		name: "Electricity",
		type: "utilities",
	},
	{
		id: "water" as Category["id"],
		name: "Water",
		type: "utilities",
	},
	{
		id: "internet" as Category["id"],
		name: "Internet",
		type: "utilities",
	},
	{
		id: "phone" as Category["id"],
		name: "Phone",
		type: "utilities",
	},
	{
		id: "gas" as Category["id"],
		name: "Gas",
		type: "utilities",
	},
	{
		id: "ai" as Category["id"],
		name: "AI Tools",
		type: "utilities",
	},
	// Software Engineering
	{
		id: "cloud" as Category["id"],
		name: "Cloud",
		type: "business",
	},
] as const satisfies Category[]
