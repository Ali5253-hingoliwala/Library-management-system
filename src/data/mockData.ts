import type { Book, Member, BorrowingRecord, LibraryEvent, Notification, DashboardStats } from "../types";

export const mockBooks: Book[] = [
  { id: "B001", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0-06-112008-4", genre: "Fiction", publishedYear: 1960, totalCopies: 5, availableCopies: 3, status: "available", addedDate: "2022-03-15" },
  { id: "B002", title: "1984", author: "George Orwell", isbn: "978-0-45-228423-4", genre: "Dystopian", publishedYear: 1949, totalCopies: 4, availableCopies: 0, status: "borrowed", addedDate: "2022-01-10" },
  { id: "B003", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0-74-321356-5", genre: "Fiction", publishedYear: 1925, totalCopies: 3, availableCopies: 2, status: "available", addedDate: "2022-06-20" },
  { id: "B004", title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0-14-143951-8", genre: "Romance", publishedYear: 1813, totalCopies: 6, availableCopies: 4, status: "available", addedDate: "2021-11-05" },
  { id: "B005", title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0-31-676948-0", genre: "Fiction", publishedYear: 1951, totalCopies: 3, availableCopies: 1, status: "available", addedDate: "2023-02-14" },
  { id: "B006", title: "Brave New World", author: "Aldous Huxley", isbn: "978-0-06-085052-4", genre: "Dystopian", publishedYear: 1932, totalCopies: 4, availableCopies: 0, status: "borrowed", addedDate: "2022-09-08" },
  { id: "B007", title: "The Lord of the Rings", author: "J.R.R. Tolkien", isbn: "978-0-54-792822-7", genre: "Fantasy", publishedYear: 1954, totalCopies: 5, availableCopies: 3, status: "available", addedDate: "2021-07-22" },
  { id: "B008", title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", isbn: "978-0-06-088328-7", genre: "Magical Realism", publishedYear: 1967, totalCopies: 2, availableCopies: 0, status: "reserved", addedDate: "2023-05-01" },
  { id: "B009", title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0-06-231500-7", genre: "Adventure", publishedYear: 1988, totalCopies: 7, availableCopies: 5, status: "available", addedDate: "2022-12-12" },
  { id: "B010", title: "Crime and Punishment", author: "Fyodor Dostoevsky", isbn: "978-0-14-305814-2", genre: "Classic", publishedYear: 1866, totalCopies: 3, availableCopies: 1, status: "available", addedDate: "2023-01-30" },
  { id: "B011", title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", isbn: "978-0-34-539180-3", genre: "Sci-Fi", publishedYear: 1979, totalCopies: 4, availableCopies: 2, status: "available", addedDate: "2022-08-18" },
  { id: "B012", title: "Dune", author: "Frank Herbert", isbn: "978-0-44-101359-0", genre: "Sci-Fi", publishedYear: 1965, totalCopies: 5, availableCopies: 0, status: "borrowed", addedDate: "2022-04-03" },
];

export const mockMembers: Member[] = [
  { id: "M001", name: "Eleanor Whitfield", email: "e.whitfield@email.com", phone: "555-0101", membershipType: "premium", joinDate: "2021-03-10", expiryDate: "2026-03-10", borrowedCount: 47, status: "active" },
  { id: "M002", name: "James Thornton", email: "j.thornton@email.com", phone: "555-0102", membershipType: "standard", joinDate: "2022-06-15", expiryDate: "2024-06-15", borrowedCount: 12, status: "expired" },
  { id: "M003", name: "Priya Nair", email: "p.nair@email.com", phone: "555-0103", membershipType: "student", joinDate: "2023-09-01", expiryDate: "2025-09-01", borrowedCount: 28, status: "active" },
  { id: "M004", name: "Marcus Chen", email: "m.chen@email.com", phone: "555-0104", membershipType: "standard", joinDate: "2020-11-20", expiryDate: "2025-11-20", borrowedCount: 63, status: "active" },
  { id: "M005", name: "Sofia Reyes", email: "s.reyes@email.com", phone: "555-0105", membershipType: "senior", joinDate: "2019-02-14", expiryDate: "2026-02-14", borrowedCount: 91, status: "active" },
  { id: "M006", name: "Oliver Blackwood", email: "o.blackwood@email.com", phone: "555-0106", membershipType: "premium", joinDate: "2022-01-05", expiryDate: "2027-01-05", borrowedCount: 35, status: "suspended" },
  { id: "M007", name: "Amara Diallo", email: "a.diallo@email.com", phone: "555-0107", membershipType: "student", joinDate: "2023-08-20", expiryDate: "2025-08-20", borrowedCount: 15, status: "active" },
  { id: "M008", name: "Victor Novak", email: "v.novak@email.com", phone: "555-0108", membershipType: "standard", joinDate: "2021-07-08", expiryDate: "2025-07-08", borrowedCount: 22, status: "active" },
  { id: "M009", name: "Isabelle Fontaine", email: "i.fontaine@email.com", phone: "555-0109", membershipType: "senior", joinDate: "2018-12-01", expiryDate: "2025-12-01", borrowedCount: 108, status: "active" },
  { id: "M010", name: "Rohan Mehta", email: "r.mehta@email.com", phone: "555-0110", membershipType: "student", joinDate: "2024-01-15", expiryDate: "2026-01-15", borrowedCount: 8, status: "active" },
];

export const mockBorrowingRecords: BorrowingRecord[] = [
  { id: "L001", bookId: "B002", bookTitle: "1984", memberId: "M001", memberName: "Eleanor Whitfield", borrowDate: "2026-06-01", dueDate: "2026-06-15", status: "overdue", fine: 5.50 },
  { id: "L002", bookId: "B006", bookTitle: "Brave New World", memberId: "M003", memberName: "Priya Nair", borrowDate: "2026-06-10", dueDate: "2026-06-24", status: "overdue", fine: 1.00 },
  { id: "L003", bookId: "B012", bookTitle: "Dune", memberId: "M004", memberName: "Marcus Chen", borrowDate: "2026-06-15", dueDate: "2026-06-29", status: "active" },
  { id: "L004", bookId: "B001", bookTitle: "To Kill a Mockingbird", memberId: "M005", memberName: "Sofia Reyes", borrowDate: "2026-06-18", dueDate: "2026-07-02", status: "active" },
  { id: "L005", bookId: "B007", bookTitle: "The Lord of the Rings", memberId: "M007", memberName: "Amara Diallo", borrowDate: "2026-06-20", dueDate: "2026-07-04", status: "active" },
  { id: "L006", bookId: "B003", bookTitle: "The Great Gatsby", memberId: "M008", memberName: "Victor Novak", borrowDate: "2026-05-20", dueDate: "2026-06-03", returnDate: "2026-06-02", status: "returned" },
  { id: "L007", bookId: "B009", bookTitle: "The Alchemist", memberId: "M009", memberName: "Isabelle Fontaine", borrowDate: "2026-05-25", dueDate: "2026-06-08", returnDate: "2026-06-07", status: "returned" },
  { id: "L008", bookId: "B005", bookTitle: "The Catcher in the Rye", memberId: "M010", memberName: "Rohan Mehta", borrowDate: "2026-06-22", dueDate: "2026-07-06", status: "active" },
];

export const mockEvents: LibraryEvent[] = [
  { id: "E001", title: "Summer Reading Kickoff", description: "Join us for the annual summer reading program launch with prizes for all age groups.", date: "2026-06-28", time: "10:00 AM", location: "Main Hall", type: "reading", capacity: 100, registered: 72, isUpcoming: true },
  { id: "E002", title: "Author Talk: The Modern Novel", description: "Award-winning novelist Dr. Sarah Ellison discusses contemporary literary fiction.", date: "2026-07-05", time: "2:00 PM", location: "Lecture Theater", type: "lecture", capacity: 80, registered: 65, isUpcoming: true },
  { id: "E003", title: "Children's Story Hour", description: "Interactive storytelling session for children aged 4–8 with crafts afterward.", date: "2026-07-10", time: "11:00 AM", location: "Children's Wing", type: "children", capacity: 30, registered: 28, isUpcoming: true },
  { id: "E004", title: "Photography Exhibition Opening", description: "Local photographers present \"Urban Stories\" — a visual journey through city life.", date: "2026-07-15", time: "6:00 PM", location: "Gallery Room", type: "exhibition", capacity: 150, registered: 48, isUpcoming: true },
  { id: "E005", title: "Digital Research Workshop", description: "Learn to use online databases, e-journals, and citation tools effectively.", date: "2026-07-20", time: "3:00 PM", location: "Computer Lab", type: "workshop", capacity: 20, registered: 14, isUpcoming: true },
  { id: "E006", title: "Book Club — Monthly Meeting", description: "This month: \"The Remains of the Day\" by Kazuo Ishiguro.", date: "2026-08-01", time: "5:30 PM", location: "Reading Room B", type: "reading", capacity: 25, registered: 18, isUpcoming: true },
];

export const mockNotifications: Notification[] = [
  { id: "N001", message: "Summer Reading Kickoff starts in 3 days — 72 members registered!", type: "event", timestamp: "2026-06-25T09:00:00", read: false },
  { id: "N002", message: "2 books are overdue — Eleanor Whitfield and Priya Nair have outstanding returns.", type: "overdue", timestamp: "2026-06-25T08:30:00", read: false },
  { id: "N003", message: "New arrival: \"The Ministry of Future\" by Kim Stanley Robinson added to catalog.", type: "new_book", timestamp: "2026-06-24T14:00:00", read: false },
  { id: "N004", message: "Children's Story Hour is nearly full — only 2 spots remaining!", type: "event", timestamp: "2026-06-24T10:00:00", read: true },
  { id: "N005", message: "Library will close early on June 30 for annual stock-take — 5:00 PM closing.", type: "announcement", timestamp: "2026-06-23T16:00:00", read: true },
];

export const mockDashboardStats: DashboardStats = {
  totalBooks: 1247,
  totalMembers: 892,
  activeLoans: 184,
  overdueLoans: 23,
  booksAddedThisMonth: 34,
  newMembersThisMonth: 18,
};

export const borrowingTrendData = [
  { month: "Jan", borrowed: 142, returned: 138 },
  { month: "Feb", borrowed: 128, returned: 131 },
  { month: "Mar", borrowed: 165, returned: 158 },
  { month: "Apr", borrowed: 180, returned: 172 },
  { month: "May", borrowed: 195, returned: 187 },
  { month: "Jun", borrowed: 184, returned: 168 },
];

export const genreDistributionData = [
  { name: "Fiction", value: 312, color: "#c8843a" },
  { name: "Non-Fiction", value: 248, color: "#0f2640" },
  { name: "Sci-Fi", value: 186, color: "#2e7d6b" },
  { name: "History", value: 145, color: "#7c3d8a" },
  { name: "Children", value: 203, color: "#c0392b" },
  { name: "Other", value: 153, color: "#8b7355" },
];

export const membershipData = [
  { month: "Jan", new: 12, total: 820 },
  { month: "Feb", new: 8, total: 828 },
  { month: "Mar", new: 15, total: 843 },
  { month: "Apr", new: 22, total: 865 },
  { month: "May", new: 9, total: 874 },
  { month: "Jun", new: 18, total: 892 },
];
