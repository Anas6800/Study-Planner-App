# Study Planner App

A comprehensive study planning application built with React, Firebase, and FullCalendar.js. Track your study subjects, schedule sessions, and monitor your progress with beautiful charts and analytics.

## 🚀 Features

### ✅ Authentication & User Management
- Email/Password authentication with Firebase
- Protected routes and secure user sessions
- User profile management

### 📚 Subject Management
- Create and manage study subjects
- Set target hours and completion dates
- Track progress with visual indicators
- Edit and delete subjects

### 📅 Calendar Integration
- FullCalendar.js integration for scheduling
- Monthly, weekly, and daily views
- Click-to-schedule study sessions
- Drag and drop event management
- Color-coded subject events

### 📊 Progress Tracking
- Weekly study hour charts
- Subject progress visualization
- Study streak counter
- Study distribution pie charts
- Recent study sessions log

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean and intuitive interface
- Smooth animations and transitions
- Professional color scheme

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Firebase (Authentication + Firestore)
- **Calendar**: FullCalendar.js
- **Charts**: Recharts
- **Routing**: React Router
- **Styling**: Custom CSS with responsive design

## 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd study-planner-app
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Copy your Firebase configuration to `src/firebase.ts`

4. Start the development server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Firebase Configuration

1. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password

2. **Set up Firestore**:
   - Go to Firestore Database
   - Create a new database in test mode
   - Choose a location near you

3. **Update Configuration**:
   - Replace the config in `src/firebase.ts` with your project credentials

## 📱 Usage

### Getting Started
1. Sign up for a new account or log in
2. Create your first study subject with target hours
3. Schedule study sessions in the calendar
4. Track your progress in the Progress section

### Subject Management
- Click "Subjects" from the dashboard
- Add subjects with name, description, target hours, and target date
- View progress bars for each subject
- Edit or delete subjects as needed

### Calendar Scheduling
- Click "Calendar" from the dashboard
- Click on any date to schedule a study session
- Select subject, time, and add notes
- Click events to delete them
- Switch between month, week, and day views

### Progress Tracking
- Click "Progress" from the dashboard
- View weekly study hour charts
- Monitor subject completion progress
- Check your study streak
- See study distribution by subject

## 🏗 Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Main dashboard
│   ├── Subjects/       # Subject management
│   ├── Calendar/       # Calendar integration
│   └── Progress/       # Progress tracking
├── contexts/           # React contexts
├── services/           # Firebase services
├── types/              # TypeScript types
├── firebase.ts         # Firebase configuration
├── App.tsx            # Main app component
└── styles.css         # Global styles
```

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

2. Build the app
```bash
npm run build
```

3. Initialize Firebase Hosting
```bash
firebase init hosting
```

4. Deploy
```bash
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include screenshots if applicable

## 🔮 Future Features

- [ ] Study reminders and notifications
- [ ] Pomodoro timer integration
- [ ] Study groups and collaboration
- [ ] Export progress reports
- [ ] Mobile app version
- [ ] Study goal templates
- [ ] Advanced analytics and insights

---

Built with ❤️ using React and Firebase
