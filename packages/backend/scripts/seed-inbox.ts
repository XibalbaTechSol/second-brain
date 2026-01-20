
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_MESSAGES = [
    // TASKS (High Confidence)
    "Buy milk and eggs on the way home",
    "Schedule dentist appointment for next Tuesday",
    "Email Sarah about the quarterly report",
    "Fix the bug in the login page",
    "Pay the electricity bill before Friday",
    "Call mom for her birthday",
    "Book flight tickets to London",
    "Submit tax returns",
    "Review the pull request from John",
    "Update the project documentation",

    // PROJECTS (Medium/High Confidence)
    "Plan the marketing strategy for Q4",
    "Organize the team building event",
    "Redesign the company website",
    "Launch the new mobile app",
    "Start learning Spanish",
    "Build a garden shed",
    "Plan a trip to Japan",
    "Write a book about productivity",
    "Renovate the kitchen",
    "Create a new fitness routine",

    // NOTES (Various Confidence)
    "Remember to ask about the API rate limits",
    "The capital of France is Paris",
    "Idea for a blog post: AI in healthcare",
    "Grocery list: apples, bananas, bread",
    "Meeting notes: key takeaway was to focus on user retention",
    "Quote: 'The only way to do great work is to love what you do.'",
    "Wifi password for the cafe is coffee123",
    "Book recommendation: Atomic Habits",
    "Dimensions of the living room: 4m x 5m",
    "Recipe for chocolate cake: flour, sugar, eggs...",

    // CONTACTS (Context dependent)
    "Meet with Alex at 2pm",
    "Contact support@example.com",
    "Dr. Smith's phone number is 555-0123",
    "Interview candidate: Michael Brown",
    "Networking event next Thursday",

    // AMBIGUOUS / MIXED / LOW CONFIDENCE
    "Blue",
    "Thinking about maybe doing something later",
    "???",
    "Check this out",
    "Just a quick thought",
    "Save",
    "12345",
    "...",
    "Running late",
    "Who was that guy?",

    // MORE TASKS to fill up to 50
    "Clean the garage",
    "Wash the car",
    "Walk the dog",
    "Water the plants",
    "Take out the trash"
];

async function main() {
    console.log('🌱 Seeding 5 mock messages into Inbox...');

    const entries = MOCK_MESSAGES.slice(0, 5).map(msg => ({
        content: msg,
        source: 'MOCK_SCRIPT',
        status: 'PENDING'
    }));

    // Clear all InboxItems and related data for a clean start
    await prisma.inboxItem.deleteMany({});

    await prisma.inboxItem.createMany({
        data: entries
    });

    console.log('✅ Successfully seeded 5 items.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
