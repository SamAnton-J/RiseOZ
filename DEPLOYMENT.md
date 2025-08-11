# RiseOZ Deployment Guide

## 🚀 Railway (Backend) Deployment

### Why No Build Command?
- **Backend is a Node.js server** that runs directly
- Railway just needs to install dependencies (`npm install`) and start the server (`npm start`)
- No compilation needed - Node.js runs the code as-is

### Steps:
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `RiseOZ/backend` folder
4. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://rizeos-user-01:rizeos-user-01%40user@rizeos-cluster.lqoxzvd.mongodb.net/?retryWrites=true&w=majority&appName=RizeOS-Cluster
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```
5. Deploy!

## 🌐 Netlify (Frontend) Deployment

### Why Build Command IS Needed?
- **Frontend is a React app** that needs compilation
- React JSX/TSX files must be converted to HTML, CSS, and JavaScript
- Vite builds optimized production files in the `dist` folder
- Netlify serves these static files

### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - **Base directory**: `RiseOZ/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Set environment variables:
   ```
   VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
   ```
5. Deploy!

## 🔧 Environment Variables

### Backend (Railway):
```
MONGODB_URI=mongodb+srv://rizeos-user-01:rizeos-user-01%40user@rizeos-cluster.lqoxzvd.mongodb.net/?retryWrites=true&w=majority&appName=RizeOS-Cluster
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Frontend (Netlify):
```
VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
```

## 🔄 After Deployment

1. **Update CORS origins** in backend (`index.js`) with your Netlify domain
2. **Test the connection** between frontend and backend
3. **Update any hardcoded URLs** in your frontend code

## 📝 Build Process Explained

### Backend (No Build):
```
Source Code → npm install → npm start → Server Running
```

### Frontend (Build Required):
```
Source Code → npm install → npm run build → dist/ folder → Netlify serves static files
```

The `dist/` folder contains:
- `index.html` (main HTML file)
- `assets/` (compiled CSS and JavaScript)
- Optimized and minified code ready for production
