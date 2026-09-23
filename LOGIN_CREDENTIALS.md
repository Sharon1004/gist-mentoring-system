# GIST Mentoring System - Login Credentials

## 🔐 Default Login Credentials

### 👨‍💼 **ADMIN LOGIN** (admin-login.html)

#### Super Admin (Full Access)
- **Admin ID:** `admin1`
- **Password:** `admin123`
- **Access:** Can see all students and mentors from all branches

#### Branch Admins (Branch-Specific Access)
- **CSE Branch Admin:**
  - Admin ID: `admin_cse`
  - Password: `admin123`
  - Access: Only CSE students and mentors

- **ECE Branch Admin:**
  - Admin ID: `admin_ece`
  - Password: `admin123`
  - Access: Only ECE students and mentors

- **EEE Branch Admin:**
  - Admin ID: `admin_eee`
  - Password: `admin123`
  - Access: Only EEE students and mentors

- **MECH Branch Admin:**
  - Admin ID: `admin_mech`
  - Password: `admin123`
  - Access: Only MECH students and mentors

- **CIVIL Branch Admin:**
  - Admin ID: `admin_civil`
  - Password: `admin123`
  - Access: Only CIVIL students and mentors

---

### 👨‍🏫 **MENTOR LOGIN** (mentor-login.html)

- **Mentor 1 (CSE):**
  - Mentor ID: `mentor1`
  - Password: `mentor123`
  - Name: Dr. Ramesh Kumar
  - Department: CSE

- **Mentor 2 (ECE):**
  - Mentor ID: `mentor2`
  - Password: `mentor123`
  - Name: Dr. Suresh Reddy
  - Department: ECE

- **Mentor 3 (ECE):**
  - Mentor ID: `mentor3`
  - Password: `mentor123`
  - Name: Dr. Lakshmi ECE
  - Department: ECE

- **Mentor 4 (EEE):**
  - Mentor ID: `mentor4`
  - Password: `mentor123`
  - Name: Dr. EEE Head
  - Department: EEE

- **Mentor 5 (MECH):**
  - Mentor ID: `mentor5`
  - Password: `mentor123`
  - Name: Dr. MECH Head
  - Department: MECH

- **Mentor 6 (CIVIL):**
  - Mentor ID: `mentor6`
  - Password: `mentor123`
  - Name: Dr. CIVIL Head
  - Department: CIVIL

---

### 👨‍🎓 **STUDENT LOGIN** (student-login.html)

**All students use password:** `student123`

#### CSE Students (Branch Code: 05)
- `222U1A0501` - K. Sai Teja (II B.Tech) - Has full academic records
- `222U1A0502` - P. Anjali (II B.Tech)
- `222U1A0503` - R. Kiran (II B.Tech)
- `232U1A0501` - A. Divya (I B.Tech)
- `232U1A0502` - B. Rahul (I B.Tech)
- `212U1A0501` - C. Priya (III B.Tech)
- `212U1A0502` - D. Vikram (III B.Tech)
- `202U1A0501` - E. Sneha (IV B.Tech)
- `202U1A0502` - F. Arjun (IV B.Tech)

#### ECE Students (Branch Code: 03)
- `222U1A0301` - G. Vamsi (II B.Tech)
- `222U1A0302` - H. Keerthi (II B.Tech)
- `232U1A0301` - I. Sravan (I B.Tech)
- `212U1A0301` - J. Nithya (III B.Tech)
- `202U1A0301` - K. Ravi (IV B.Tech)

#### EEE Students (Branch Code: 04)
- `222U1A0401` - L. Manoj (II B.Tech)
- `222U1A0402` - M. Swathi (II B.Tech)
- `232U1A0401` - N. Teja (I B.Tech)
- `212U1A0401` - O. Kavya (III B.Tech)
- `202U1A0401` - P. Sridhar (IV B.Tech)

#### MECH Students (Branch Code: 01)
- `222U1A0101` - Q. Ramesh (II B.Tech)
- `222U1A0102` - R. Pooja (II B.Tech)
- `232U1A0101` - S. Kumar (I B.Tech)
- `212U1A0101` - T. Anusha (III B.Tech)
- `202U1A0101` - U. Venkat (IV B.Tech)

#### CIVIL Students (Branch Code: 02)
- `222U1A0201` - V. Srinivas (II B.Tech)
- `222U1A0202` - W. Lakshmi (II B.Tech)
- `232U1A0201` - X. Rajesh (I B.Tech)
- `212U1A0201` - Y. Deepa (III B.Tech)
- `202U1A0201` - Z. Karthik (IV B.Tech)

---

## 📝 Roll Number Format

**Format:** `YY2U1AXXNN`
- `YY` = Year (e.g., 22, 23, 20, 21)
- `2U1A` = Fixed pattern
- `XX` = Branch code (05=CSE, 03=ECE, 04=EEE, 01=MECH, 02=CIVIL)
- `NN` = Student number (e.g., 01, 02, 22)

**Example:** `222U1A0501` = Year 22, CSE branch, student #01

---

## 🆕 New Student Registration

Students can register themselves at **student-registration.html** with:
- Roll number (must follow format: `YY2U1AXXNN`)
- Password (minimum 6 characters)
- Name, Department, Year, etc.

After registration, they can login with their roll number and password.

---

## 🔧 MySQL Database Credentials

**Database Name:** `gist_mentoring_system`

**Default Connection (in backend/db.js):**
- Host: `localhost`
- User: `root`
- Password: `bharath88` (change this to your MySQL password)
- Database: `gist_mentoring_system`

**To change:** Edit `backend/db.js` or set environment variables:
- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

---

## 📋 Quick Test Credentials

**For quick testing, use:**
- **Super Admin:** `admin1` / `admin123`
- **Mentor:** `mentor1` / `mentor123`
- **Student:** `222U1A0501` / `student123` (has full academic records)
