# 🚀 Quick Start Guide - GIST Mentoring System

## ⚡ Get Started in 3 Steps

### Step 1: Open the Application
1. Open a terminal in the project folder
2. Start the backend (it also serves the frontend):

```bash
python backend/server.py
```

3. Open the app in your browser:

`http://localhost:3000`

### Step 2: Choose Your Role
Click on one of the three login options:
- 👨‍🎓 **Student Login** - For students to track their progress
- 👨‍🏫 **Mentor Login** - For mentors to guide students  
- ⚙️ **Admin Login** - For administrators to manage the system

### Step 3: Login with Demo Credentials

#### Student Account
```
Roll Number: 22JG1A05A1
Password: student123
```

#### Mentor Account
```
Mentor ID: mentor1
Password: mentor123
```

#### Admin Account
```
Admin ID: admin1
Password: admin123
```

---

## 📱 Main Features by Role

### As a Student, you can:
✅ View your academic performance and CGPA  
✅ Check goals assigned by your mentor  
✅ Read mentor feedback and suggestions  
✅ Track your certifications and projects  
✅ Update your profile information  
✅ Monitor your progress with visual charts  

### As a Mentor, you can:
✅ View list of all your mentees  
✅ Provide feedback to students  
✅ Assign goals with deadlines  
✅ Track student progress  
✅ Give different types of feedback (academic, career, training, etc.)  
✅ View feedback history  

### As an Admin, you can:
✅ View institutional analytics  
✅ Monitor all students and mentors  
✅ Access branch-wise performance  
✅ Track placement readiness  
✅ Manage system settings  

---

## 💡 Quick Tips

### 🔐 Login Tips
- Demo credentials are displayed on each login page
- The system will show you a success notification on login
- You'll be automatically redirected to your dashboard

### ✨ Using the Mentor Dashboard
1. Click on any student name to select them
2. Choose a feedback type from the dropdown
3. Fill in the feedback form
4. Add goals and deadlines
5. Click "Submit Feedback & Assign Goal"
6. Your feedback is saved instantly!

### 📊 Understanding the Student Dashboard
- **Academic Summary**: Shows your semester-wise SGPA with a visual chart
- **Goals Section**: Displays all goals with status (Completed/In Progress/Pending)
- **Mentor Feedback**: Contains detailed feedback from your mentor
- **Career Tracker**: Shows your certifications, projects, and skills

### 🎯 Pro Tips
- ✅ All changes are saved automatically
- ✅ Use the logout button to securely end your session
- ✅ Feedback and goals are stored locally in your browser
- ✅ You can switch between different user types to test all features

---

## 🔧 Troubleshooting

### Problem: Page doesn't load properly
**Solution**: Refresh the browser (F5) or clear browser cache

### Problem: Login doesn't work
**Solution**: Make sure you're using the exact demo credentials shown above

### Problem: Data not saving
**Solution**: Check if browser allows localStorage. Some private/incognito modes block it.

### Problem: Charts not displaying
**Solution**: Ensure internet connection is active (Chart.js loads from CDN)

---

## 🎓 Testing Different Scenarios

### Test as a Student
1. Login as student (22JG1A05A1)
2. Check your dashboard and CGPA
3. View goals assigned by mentor
4. Read feedback from mentor
5. Logout

### Test as a Mentor
1. Login as mentor
2. Click on a student name (e.g., "K. Sai Teja")
3. Select feedback type (e.g., "Academic Guidance")
4. Write feedback text
5. Add a goal and deadline
6. Submit the form
7. See the feedback appear in history

### Test Complete Flow
1. Login as **mentor** → Add feedback for a student
2. Logout
3. Login as **student** → View the feedback you just added
4. Logout
5. Login as **admin** → View overall statistics

---

## 📝 Important Notes

⚠️ **Data Storage**: All data is stored in your browser's localStorage  
⚠️ **Demo Mode**: This is a prototype with simulated authentication  
⚠️ **Browser**: Works best on Chrome, Firefox, Safari, or Edge  
⚠️ **Internet**: Required for Chart.js library (for graphs)  

---

## 🌟 What's Working

✅ User authentication (Student/Mentor/Admin)  
✅ Session management with auto-logout  
✅ Form validation with error messages  
✅ Feedback submission and storage  
✅ Goal assignment and tracking  
✅ Student registration  
✅ Visual notifications  
✅ Loading indicators  
✅ Responsive design (mobile-friendly)  
✅ Professional, clean UI  

---

## 🎯 Next Steps After Testing

1. **Customize**: Edit CSS colors in `style.css`
2. **Add Users**: Modify `app.js` to add more demo users
3. **Extend Features**: Add new form fields or dashboards
4. **Backend**: Connect to a real database and API
5. **Deploy**: Host on a web server for real use

---

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review browser console for error messages
- Ensure all files are in the same folder
- Try different browsers if one doesn't work

---

## ✨ Enjoy Testing!

The system is fully functional and ready to demonstrate all core features of a mentoring and career tracking platform.

**Happy Testing! 🎉**

---

*Version: 1.0 | Last Updated: January 2026*
