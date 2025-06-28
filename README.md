# 🍎 FruitLens - Smart Produce Recognition App

<div align="center">
  <img src="frontend/assets/images/logo.png" alt="FruitLens Logo" width="200"/>
  
  **A smart, mobile-based solution for healthier lifestyle choices**
  
  [![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

FruitLens is a cutting-edge mobile application that revolutionizes how people interact with fresh produce. By combining advanced computer vision, artificial intelligence, and real-time data processing, FruitLens empowers users to make informed, affordable, and health-conscious decisions about their food choices.

The app bridges the gap between technology and nutrition, making healthy eating more accessible and informed through:
- **Real-time object recognition** using YOLO v11
- **AI-powered nutritional insights** via OpenAI integration
- **Personalized recipe suggestions** based on detected produce
- **Local price comparisons** through web scraping
- **User-friendly mobile interface** built with React Native/Expo

## ✨ Features

### 🔍 Core Features
- **Smart Fruit Detection**: Advanced YOLO v11 model for accurate fruit and vegetable recognition
- **Instant Nutrition Analysis**: Comprehensive nutritional information including calories, vitamins, and health benefits
- **Recipe Recommendations**: AI-generated recipes tailored to your detected produce
- **Price Comparison**: Real-time price tracking from local stores and markets
- **Location-Based Services**: GPS integration for location-aware price comparisons

### 👤 User Management
- **Secure Authentication**: JWT-based login and registration system
- **User Profiles**: Personalized user experience with profile management
- **Password Management**: Secure password reset and change functionality
- **Session Management**: Persistent login with secure token storage

### 📱 Mobile Experience
- **Camera Integration**: Seamless photo capture with real-time processing
- **Offline Capability**: Core features work without internet connection
- **Cross-Platform**: Native iOS and Android support via React Native
- **Responsive Design**: Optimized for various screen sizes and orientations

### 🛠 Additional Features
- **Contact System**: In-app support and feedback mechanism
- **Email Integration**: Notification and communication system
- **Smart Cart**: Shopping list management with price tracking
- **Debug Mode**: Comprehensive logging and error tracking

## 🛠 Technology Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **Image Processing**: Expo Image Picker
- **Location Services**: Expo Location
- **Secure Storage**: Expo SecureStore

### Backend (API Server)
- **Framework**: Flask (Python)
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **AI Integration**: OpenAI API
- **Computer Vision**: YOLO v11 (Ultralytics)
- **Image Processing**: OpenCV
- **Web Scraping**: Selenium, BeautifulSoup
- **CORS**: Flask-CORS

### DevOps & Tools
- **Environment Management**: python-dotenv
- **Process Management**: Custom launcher script
- **Logging**: Python logging module
- **Error Handling**: Comprehensive error tracking
- **API Testing**: RESTful API endpoints

## 🏗 Architecture

```
FruitLens/
├── frontend/                 # React Native Mobile App
│   ├── app/                 # App screens and navigation
│   │   ├── (auth)/              # Authentication screens
│   │   ├── (tabs)/              # Main app tabs
│   │   └── index.tsx            # App entry point
│   ├── components/          # Reusable UI components
│   ├── services/           # API integration services
│   ├── constants/          # App constants and configuration
│   └── assets/             # Images, fonts, and static assets
├── backend/                 # Flask API Server
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── models/             # Database models
│   └── utils/              # Utility functions
└── shared/                  # Shared configuration and scripts
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### For Frontend Development
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator** (macOS) or **Android Studio** (for Android development)

### For Backend Development
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **MongoDB** (local installation or cloud instance)

### For Mobile Testing
- **Physical device** with Expo Go app installed, or
- **iOS Simulator** (macOS only) or **Android Emulator**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/FruitLens.git
cd FruitLens
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Download YOLO Model
The YOLO v11 model (`yolo11s.pt`) should be present in the backend directory. If not, it will be automatically downloaded on first run.

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
```

#### Install Additional Expo Dependencies
```bash
npx expo install
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/fruitlens
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fruitlens

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Flask Configuration
FLASK_ENV=development
PORT=5002
```

### Frontend Configuration

Update the API URL in `frontend/services/scanService.ts`:

```typescript
const getApiUrl = () => {
  // Replace with your backend server URL
  return "http://YOUR_SERVER_IP:5002";
};
```

### Database Setup

1. **MongoDB Installation**: Install MongoDB locally or use MongoDB Atlas
2. **Database Creation**: The app will automatically create the required collections
3. **Indexing**: Ensure proper indexing for user authentication

## 📱 Usage

### Quick Start (Recommended)

Use the automated launcher script to start both frontend and backend:

```bash
python start.py
```

This will:
- Start the Flask backend server on port 5002
- Launch the Expo development server
- Open the Expo development tools in your browser

### Manual Start

#### Start Backend Server
```bash
cd backend
python app.py
```

#### Start Frontend Development Server
```bash
cd frontend
npx expo start -c
```

### Mobile App Usage

1. **Launch the App**: Open Expo Go on your mobile device and scan the QR code
2. **Create Account**: Register with your email and password
3. **Take Photo**: Use the camera to capture a fruit or vegetable
4. **Get Results**: View the detected produce with confidence score
5. **Explore Options**: Choose between recipe suggestions or nutrition information
6. **Smart Features**: Use location services for price comparisons

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login User
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Core Functionality

#### Process Image
```http
POST /process-image
Content-Type: multipart/form-data

image: [image file]
```

**Response:**
```json
[
  {
    "label": "Apple",
    "confidence": 0.95,
    "box": [x1, y1, x2, y2]
  }
]
```

#### Generate Recipe/Nutrition
```http
POST /generate-text
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "prompt": "Please provide a recipe using Apple"
}
```

#### Price Scraping
```http
POST /scrape-prices
Content-Type: application/json

{
  "product": "Apple",
  "location": "New York, NY"
}
```

### Utility Endpoints

#### Health Check
```http
GET /health
```

#### Mobile Compatibility Check
```http
GET /check-mobile
```

## 📁 Project Structure

```
FruitLens/
├── 📱 frontend/
│   ├── app/
│   │   ├── (auth)/              # Authentication screens
│   │   ├── (tabs)/              # Main app tabs
│   │   └── index.tsx            # App entry point
│   ├── components/
│   │   ├── CustomButton.tsx     # Reusable button component
│   │   ├── CustomAlert.tsx      # Alert component
│   │   ├── FormField.tsx        # Form input component
│   │   └── ...
│   ├── services/
│   │   ├── authService.ts       # Authentication API calls
│   │   ├── scanService.ts       # Image processing API calls
│   │   ├── openaiService.ts     # AI text generation
│   │   └── ...
│   ├── constants/               # App constants and config
│   ├── assets/                  # Images, fonts, icons
│   └── package.json
├── 🖥️ backend/
│   ├── routes/
│   │   ├── register.py          # User registration
│   │   ├── login.py             # User authentication
│   │   ├── process.py           # Image processing (YOLO)
│   │   ├── openai.py           # AI text generation
│   │   ├── scraper.py          # Price scraping
│   │   └── ...
│   ├── services/               # Business logic
│   ├── extensions.py           # Flask extensions
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   └── yolo11s.pt             # YOLO model file
├── 🚀 start.py                  # Automated launcher script
├── 📄 package.json             # Root package.json for Selenium
└── 📖 README.md                # This file
```

## 🤝 Contributing

We welcome contributions to FruitLens! Please follow these guidelines:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**: Ensure both frontend and backend work correctly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- **Frontend**: Follow React Native and TypeScript best practices
- **Backend**: Follow PEP 8 Python style guidelines
- **Comments**: Write clear, concise comments for complex logic
- **Testing**: Add tests for new features

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the version numbers in package.json files
3. Ensure all tests pass and the app builds successfully
4. Get approval from maintainers before merging

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB Connection**: Ensure MongoDB is running and the connection string is correct
- **YOLO Model**: The model file should be present in the backend directory
- **OpenAI API**: Verify your API key is valid and has sufficient credits
- **Port Issues**: Make sure port 5002 is available, or change the configuration

#### Frontend Issues
- **Expo Installation**: Ensure Expo CLI is installed globally
- **API Connection**: Update the API URL in services to match your backend
- **Camera Permissions**: Grant camera permissions in your device settings
- **Location Services**: Enable location services for price comparison features

#### Development Issues
- **Hot Reload**: Use `npx expo start -c` to clear cache
- **Dependencies**: Run `npm install` or `yarn install` after pulling updates
- **Environment**: Ensure all environment variables are properly set

### Getting Help

If you encounter issues:

1. **Check the logs**: Both frontend and backend provide detailed logging
2. **Review the documentation**: Most common issues are covered here
3. **Search existing issues**: Check GitHub issues for similar problems
4. **Create an issue**: Provide detailed information about your problem

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: Tomer Elimelech, Daniel Yakubov
- **Contact**: etomer9@gmail.com, ffgtf12@gmail.com

## 🙏 Acknowledgments

- **Ultralytics**: For the excellent YOLO v11 model
- **OpenAI**: For providing the GPT API for recipe and nutrition generation
- **Expo Team**: For the amazing React Native development platform
- **Flask Community**: For the robust web framework
- **Open Source Community**: For the countless libraries and tools used

---

<div align="center">
  <p>Made with ❤️ for healthier living</p>
  <p>© 2025 FruitLens. All rights reserved.</p>
</div> 
