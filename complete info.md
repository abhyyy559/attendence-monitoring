# Frontend & Backend Complete Specification
## Attendance Monitoring System

---

## Document Purpose

This document provides complete details on:
1. All backend API endpoints with operations
2. All frontend pages with layouts
3. Minimal, professional UI/UX design (avoiding AI-generated look)
4. Page-by-page interactions and workflows
5. Component specifications

---

## PART 1: BACKEND ARCHITECTURE

### Complete Backend Structure

```
attendance-backend/
├── app/
│   ├── main.py              # FastAPI app with CORS, routes
│   ├── config.py            # Settings from .env
│   ├── database.py          # SQLAlchemy session
│   ├── models/              # Database models (10 files)
│   ├── schemas/             # Pydantic validation (7 files)
│   ├── routers/             # API routes (5 files)
│   ├── services/            # Business logic (5 files)
│   └── utils/               # Helpers, security (4 files)
```

### All API Endpoints Summary

**Authentication (9 endpoints)**
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login with JWT
- POST /api/auth/logout - User logout
- POST /api/auth/refresh-token - Refresh JWT
- GET /api/auth/me - Get current user
- PUT /api/auth/change-password - Change password
- POST /api/auth/forgot-password - Request reset
- POST /api/auth/reset-password/{token} - Reset password
- GET /api/auth/verify-email/{token} - Verify email

**Student Module (12 endpoints)**
- GET /api/students/dashboard - Dashboard data
- GET /api/students/profile - Profile info
- PUT /api/students/profile - Update profile
- GET /api/students/attendance - All attendance records
- GET /api/students/attendance/summary - Summary by course
- GET /api/students/attendance/calendar - Calendar view
- GET /api/students/courses - Enrolled courses
- GET /api/students/courses/{id}/details - Course details
- GET /api/students/shortage - Shortage details
- GET /api/students/notifications - Get notifications
- PUT /api/students/notifications/{id}/read - Mark read
- POST /api/students/reports/generate - Generate report

**Faculty Module (14 endpoints)**
- GET /api/faculty/dashboard - Dashboard data
- GET /api/faculty/profile - Profile info
- PUT /api/faculty/profile - Update profile
- GET /api/faculty/courses - Assigned courses
- GET /api/faculty/courses/{id}/students - Students list
- GET /api/faculty/courses/{id}/statistics - Course stats
- POST /api/faculty/attendance/mark - Mark attendance
- POST /api/faculty/attendance/bulk-upload - Excel upload
- GET /api/faculty/attendance/history - Marking history
- GET /api/faculty/attendance/{id} - Attendance details
- PUT /api/faculty/attendance/{id} - Edit attendance
- DELETE /api/faculty/attendance/{id} - Delete record
- GET /api/faculty/students/{id}/attendance - Student attendance
- POST /api/faculty/reports/class - Generate class report

**Admin Module (25+ endpoints)**
- GET /api/admin/dashboard - System dashboard
- GET /api/admin/users - All users (paginated)
- POST /api/admin/users - Create user
- GET /api/admin/users/{id} - User details
- PUT /api/admin/users/{id} - Update user
- DELETE /api/admin/users/{id} - Delete user
- POST /api/admin/users/bulk-import - CSV import
- GET /api/admin/courses - All courses
- POST /api/admin/courses - Create course
- PUT /api/admin/courses/{id} - Update course
- DELETE /api/admin/courses/{id} - Delete course
- POST /api/admin/courses/{id}/enroll - Enroll students
- GET /api/admin/threshold - Get thresholds
- POST /api/admin/threshold - Create threshold
- PUT /api/admin/threshold/{id} - Update threshold
- POST /api/admin/reports/shortage - Shortage report
- POST /api/admin/reports/department - Department report
- GET /api/admin/settings - System settings
- PUT /api/admin/settings - Update settings
- GET /api/admin/logs - System logs

---

## PART 2: FRONTEND ARCHITECTURE

### Complete Frontend Structure

```
attendance-frontend/
├── src/
│   ├── App.jsx                      # Main router
│   ├── main.jsx                     # Entry point
│   ├── index.css                    # Global Tailwind styles
│   │
│   ├── components/
│   │   ├── common/                  # 12 reusable components
│   │   ├── layout/                  # 4 layout components
│   │   ├── student/                 # 4 student-specific
│   │   ├── faculty/                 # 4 faculty-specific
│   │   └── admin/                   # 4 admin-specific
│   │
│   ├── pages/
│   │   ├── auth/                    # 4 auth pages
│   │   ├── student/                 # 7 student pages
│   │   ├── faculty/                 # 7 faculty pages
│   │   └── admin/                   # 8 admin pages
│   │
│   ├── services/                    # 5 API service files
│   ├── context/                     # 2 context files
│   ├── hooks/                       # 4 custom hooks
│   └── utils/                       # 4 utility files
```

### All Pages List

**Authentication Pages (4)**
1. Login Page - /login
2. Register Page - /register
3. Forgot Password - /forgot-password
4. Reset Password - /reset-password/{token}

**Student Pages (7)**
1. Dashboard - /student/dashboard
2. View Attendance - /student/attendance
3. My Courses - /student/courses
4. Shortage Alerts - /student/shortage
5. Notifications - /student/notifications
6. Profile - /student/profile
7. Generate Reports - /student/reports

**Faculty Pages (7)**
1. Dashboard - /faculty/dashboard
2. Mark Attendance - /faculty/mark-attendance
3. My Courses - /faculty/courses
4. View Students - /faculty/students
5. Marking History - /faculty/history
6. Profile - /faculty/profile
7. Generate Reports - /faculty/reports

**Admin Pages (8)**
1. Dashboard - /admin/dashboard
2. User Management - /admin/users
3. Course Management - /admin/courses
4. Enrollment Management - /admin/enrollments
5. Threshold Settings - /admin/threshold
6. Generate Reports - /admin/reports
7. System Settings - /admin/settings
8. System Logs - /admin/logs

---

## PART 3: UI/UX DESIGN SPECIFICATIONS

### Design Philosophy

**CRITICAL: Avoid AI-Generated Look**
❌ DON'T USE:
- Gradient backgrounds everywhere
- Heavy shadows and glows
- Overly rounded corners (>16px)
- Multiple bright colors
- Floating elements
- Glassmorphism effects
- Excessive animations
- Trendy/flashy design

✅ DO USE:
- Clean white backgrounds
- Subtle shadows (barely visible)
- Minimal rounded corners (4-8px)
- Professional color palette
- Grounded, solid layouts
- Simple transitions only
- Functional, not decorative
- Real-world app aesthetic

### Color Palette (Minimal & Professional)

```css
/* Primary Colors */
--primary: #2563EB           /* Blue for buttons, links */
--primary-hover: #1E40AF     /* Darker on hover */

/* Neutrals (Main Colors) */
--gray-50: #F9FAFB          /* Lightest background */
--gray-100: #F3F4F6         /* Cards background */
--gray-200: #E5E7EB         /* Borders */
--gray-600: #4B5563         /* Secondary text */
--gray-900: #111827         /* Main text */

/* Status Colors (Muted) */
--green: #10B981            /* Present, success */
--red: #EF4444              /* Absent, danger */
--amber: #F59E0B            /* Late, warning */
--blue: #3B82F6             /* Excused, info */

/* Backgrounds */
--bg-page: #FFFFFF          /* Page background */
--bg-card: #FFFFFF          /* Card background */
--bg-hover: #F9FAFB         /* Hover state */
```

### Typography

```css
/* Font */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Sizes */
--text-xs: 0.75rem    /* 12px - labels */
--text-sm: 0.875rem   /* 14px - body */
--text-base: 1rem     /* 16px - default */
--text-lg: 1.125rem   /* 18px - subheadings */
--text-xl: 1.25rem    /* 20px - headings */
--text-2xl: 1.5rem    /* 24px - page titles */

/* Weights */
--font-normal: 400
--font-medium: 500    /* Most used */
--font-semibold: 600  /* Headings */
```

### Spacing (4px base unit)

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px      /* Most common */
--space-6: 24px
--space-8: 32px
```

### Component Styles

**Button (Primary)**
```css
background: #2563EB
color: white
padding: 10px 20px
border-radius: 6px
font-weight: 500
font-size: 14px
border: none

hover:
  background: #1E40AF
  
/* NO shadows, NO gradients, NO glow */
```

**Input Field**
```css
background: white
border: 1px solid #E5E7EB
padding: 10px 12px
border-radius: 6px
font-size: 14px

focus:
  border-color: #2563EB
  outline: 2px solid rgba(37, 99, 235, 0.1)
```

**Card**
```css
background: white
border: 1px solid #E5E7EB
border-radius: 8px
padding: 24px
/* Very subtle shadow only */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
```

**Table**
```css
background: white
border: 1px solid #E5E7EB
border-radius: 8px

/* Header */
thead:
  background: #F9FAFB
  font-weight: 500

/* Rows */
tr:
  border-bottom: 1px solid #E5E7EB
  
tr:hover:
  background: #F9FAFB
```

### Layout Guidelines

**Page Structure**
```
┌─────────────────────────────────────────────┐
│ [HEADER - 64px height]                      │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ [SIDEBAR │  [PAGE CONTENT]                  │
│  240px]  │  - Max width: 1200px            │
│          │  - Padding: 24px                 │
│          │  - Background: white             │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

**Grid System**
- Use 12-column grid
- Gap: 24px
- Responsive: Stack on mobile (<768px)

---

## PART 4: DETAILED PAGE SPECIFICATIONS

### LOGIN PAGE

**Layout**
```
Clean centered card (400px width)
- Logo/text at top
- Email input
- Password input
- Login button (full width)
- Forgot password link (small, gray)
- Simple, no decoration
```

**Design Details**
- Background: Plain white
- Card: White with 1px gray border
- NO background image
- NO gradient
- Just functional form

**Interactions**
1. User enters credentials
2. Click login
3. Button shows "Logging in..."
4. On success → redirect to dashboard
5. On error → show red text below form

---

### STUDENT DASHBOARD

**Layout**
```
Header (64px)
├─ Student name (left)
├─ Notification icon (right)
└─ Profile icon (right)

Sidebar (240px)
├─ Dashboard
├─ Attendance
├─ Courses
├─ Shortage
├─ Reports
└─ Profile

Content Area
├─ Page Title: "Dashboard"
├─ Overall Attendance Card (large)
│   └─ Percentage in center
│   └─ "X of Y classes attended" below
│
├─ Stats Row (3 cards)
│   ├─ Total Classes
│   ├─ Present
│   └─ Absent
│
├─ Course List (cards)
│   └─ Course name
│   └─ Progress bar
│   └─ Percentage
│
└─ Shortage Alerts (if any)
    └─ Warning icon
    └─ Course name
    └─ Required attendance
```

**Design Details**
- White background
- Cards: white with gray border
- Progress bars: simple colored bars (no gradients)
- Clean spacing (24px between sections)
- No shadows except very subtle on cards

**Data Displayed**
- Overall attendance percentage
- Total classes, present, absent counts
- Course-wise attendance with progress bars
- Shortage alerts (if below 75%)
- Recent notifications (last 3)

**Interactions**
- Click course card → go to attendance page
- Click shortage alert → go to shortage page
- Auto-refresh every 30 seconds

---

### FACULTY MARK ATTENDANCE PAGE

**Layout**
```
Header + Sidebar (same as before)

Content:
├─ Page Title: "Mark Attendance"
│
├─ Selection Form
│   ├─ Course Dropdown
│   ├─ Date Picker (default: today)
│   └─ Quick buttons: [Mark All Present] [Mark All Absent]
│
└─ Student Table
    ├─ Headers: Roll No | Name | Status | Remarks
    │
    ├─ Row 1:
    │   ├─ 21CS001
    │   ├─ John Doe
    │   ├─ Radio buttons: ⚪Present ⚪Absent ⚪Late ⚪Excused
    │   └─ [ Remarks input ]
    │
    ├─ Row 2: (same structure)
    └─ ...
    
    └─ Bottom: [Cancel] [Save Attendance]
```

**Design Details**
- Simple table layout
- Radio buttons for status
- Optional remarks field
- Save button highlighted in blue
- No fancy interactions

**Data Flow**
1. Faculty selects course
2. Selects date
3. System loads student list
4. Faculty marks status for each
5. Clicks save
6. Confirmation dialog appears
7. Data saved to database
8. Triggers execute automatically

**Validation**
- Cannot mark future dates
- Cannot duplicate (course + date)
- Show error if validation fails

---

### ADMIN DASHBOARD

**Layout**
```
Same Header + Sidebar

Content:
├─ Page Title: "Admin Dashboard"
│
├─ Stats Row (4 cards)
│   ├─ Total Users
│   ├─ Total Courses
│   ├─ Total Students
│   └─ Overall Attendance
│
├─ Department Attendance (progress bars)
│   ├─ Computer Science [████████░░] 85%
│   ├─ Electronics      [█████████░] 90%
│   └─ ...
│
├─ Shortage Summary Card
│   ├─ Total with shortage: 45
│   ├─ Critical: 12
│   ├─ Warning: 33
│   └─ [View Report] button
│
└─ Charts
    ├─ User Distribution (pie chart)
    └─ Attendance Trend (line chart)
```

**Design Details**
- Same clean style
- Simple bar charts
- Muted colors
- No 3D effects

---

### ADMIN USER MANAGEMENT PAGE

**Layout**
```
Header + Sidebar

Content:
├─ Page Title: "User Management"
│
├─ Actions Row
│   ├─ [+ Create User] button
│   └─ [Import CSV] button
│
├─ Filters Row
│   ├─ Role dropdown
│   ├─ Department dropdown
│   ├─ Search input
│   └─ [Apply] button
│
└─ Users Table
    ├─ Headers: Name | Email | Role | Dept | Status | Actions
    │
    ├─ Row: John Doe | john@... | Student | CS | ●Active | [...]
    │   Actions dropdown:
    │   - View
    │   - Edit
    │   - Delete
    │   - Reset Password
    │
    └─ Pagination at bottom
```

**Design Details**
- Standard table
- Actions in dropdown (three dots icon)
- Status badge (green/red)
- Pagination: [< 1 2 3 ... >]

**Interactions**
1. Click "Create User" → modal opens
2. Fill form → save
3. Click "Edit" → modal with prefilled data
4. Click "Delete" → confirmation dialog
5. Click "Reset Password" → new password generated

---

## PART 5: COMPONENT LIBRARY

### Button Component

```jsx
<Button 
  variant="primary" | "secondary" | "danger"
  size="sm" | "md" | "lg"
  onClick={handler}
  disabled={false}
>
  Click me
</Button>
```

**Variants**
- Primary: Blue background, white text
- Secondary: White background, blue border
- Danger: Red background, white text

---

### Input Component

```jsx
<Input
  label="Email"
  type="email"
  value={value}
  onChange={handler}
  error="Error message"
  required={true}
/>
```

**States**
- Normal: Gray border
- Focus: Blue border with subtle outline
- Error: Red border, error text below

---

### Table Component

```jsx
<Table
  headers={['Name', 'Email', 'Role']}
  data={rows}
  onRowClick={handler}
  sortable={true}
/>
```

**Features**
- Sortable columns
- Hover effect on rows
- Pagination built-in

---

### Card Component

```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

## PART 6: DATA FLOW & OPERATIONS

### Attendance Marking Flow

```
Faculty Page
    ↓
Select course + date
    ↓
API: GET /api/faculty/courses/{id}/students
    ↓
Display student list with radio buttons
    ↓
Faculty marks attendance
    ↓
Click "Save"
    ↓
API: POST /api/faculty/attendance/mark
    ↓
Backend validates data
    ↓
Insert into attendance_records table
    ↓
DATABASE TRIGGER executes automatically:
  - Updates attendance_summary table
  - Calculates percentage
  - Checks shortage threshold
  - Generates shortage report if needed
  - Creates notification
    ↓
Response sent to frontend
    ↓
Success message shown
    ↓
Redirect to dashboard
```

### Database Trigger Operations

**Trigger 1: Update Summary**
- Fires after INSERT/UPDATE/DELETE on attendance_records
- Calculates total classes, present, absent counts
- Computes attendance percentage
- Updates attendance_summary table

**Trigger 2: Check Shortage**
- Fires after UPDATE on attendance_summary
- Compares percentage with threshold (75%)
- Sets shortage_status flag
- Inserts record into shortage_reports

**Trigger 3: Send Notification**
- Fires after INSERT on shortage_reports
- Creates notification for student
- Inserts into notifications table

---

## PART 7: RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  - Hide sidebar
  - Stack all cards
  - Full-width tables
  - Hamburger menu
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  - Collapsible sidebar
  - 2-column grid
}

/* Desktop */
@media (min-width: 1024px) {
  - Full sidebar
  - Multi-column grid
  - Normal layout
}
```

---

## PART 8: IMPLEMENTATION NOTES

### Backend Implementation Order

1. Setup FastAPI project
2. Create database models
3. Implement authentication (JWT)
4. Create student APIs
5. Create faculty APIs
6. Create admin APIs
7. Add validation
8. Add error handling
9. Write tests

### Frontend Implementation Order

1. Setup React + Vite
2. Configure Tailwind
3. Create layout components
4. Build authentication pages
5. Build student pages
6. Build faculty pages
7. Build admin pages
8. Add state management
9. Add error handling
10. Make responsive

### Database Implementation Order

1. Create all tables
2. Add foreign keys
3. Create indexes
4. Write trigger functions
5. Create triggers
6. Write stored procedures
7. Create views
8. Insert sample data
9. Test triggers
10. Test procedures

---

## CONCLUSION

This document provides:
- Complete backend API structure (60+ endpoints)
- Complete frontend page structure (26 pages)
- Minimal, professional UI/UX design
- Detailed component specifications
- Data flow and operations
- Implementation guidelines

Key Design Principles:
✅ Clean and minimal
✅ Professional appearance
✅ Functional over decorative
✅ Real-world app feel
✅ Easy to implement
✅ No AI-generated look

---

**End of Document**
