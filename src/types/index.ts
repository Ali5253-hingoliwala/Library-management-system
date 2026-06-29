export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  status: "available" | "borrowed" | "reserved" | "damaged";
  addedDate: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: "standard" | "premium" | "student" | "senior";
  joinDate: string;
  expiryDate: string;
  borrowedCount: number;
  status: "active" | "suspended" | "expired";
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "active" | "returned" | "overdue";
  fine?: number;
  paidFine?: number;
}

export interface LibraryEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "workshop" | "reading" | "exhibition" | "lecture" | "children";
  capacity: number;
  registered: number;
  isUpcoming: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: "event" | "overdue" | "new_book" | "announcement";
  timestamp: string;
  read: boolean;
}

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  booksAddedThisMonth: number;
  newMembersThisMonth: number;
}
