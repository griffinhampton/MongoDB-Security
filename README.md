# MongoDB-Security Template

A secure MongoDB template that allows users to input data through a web interface and safely store it in a MongoDB database. This template includes comprehensive security features and best practices for handling user input.

## Features

- **Secure User Input Form**: HTML5 form with client-side and server-side validation
- **MongoDB Integration**: Mongoose ODM for secure database operations
- **Security Features**:
  - Input validation and sanitization
  - Rate limiting to prevent abuse
  - Helmet.js for security headers
  - Protection against MongoDB injection attacks
  - HTTPS-ready configuration
- **Responsive Design**: Mobile-friendly interface
- **Real-time Feedback**: Character counting and validation messages
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Quick Start (Demo Mode)

For quick testing without MongoDB installation:

```bash
npm install
npm run demo
```

This runs the application in demo mode with in-memory storage. Visit `http://localhost:3000` to see the application in action.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd MongoDB-Security
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your MongoDB connection details:
   ```
   MONGODB_URI=mongodb://localhost:27017/mongodb-security-db
   MONGODB_DATABASE_NAME=mongodb-security-db
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB**:
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Use the connection string provided by Atlas

5. **Run the application**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### POST /api/submit
Submit user data to the database.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "This is a test message"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Data saved successfully",
  "id": "64a7b8c9d1e2f3a4b5c6d7e8"
}
```

### GET /api/submissions
Retrieve recent submissions.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "email": "john@example.com",
      "message": "This is a test message",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/health
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

## Security Features

1. **Input Validation**: Both client-side and server-side validation using express-validator
2. **Rate Limiting**: Prevents abuse with configurable request limits
3. **Security Headers**: Helmet.js adds various HTTP headers for security
4. **Data Sanitization**: Automatic trimming and normalization of input data
5. **MongoDB Injection Prevention**: Mongoose provides protection against NoSQL injection
6. **IP Address Logging**: Tracks submission source for security monitoring
7. **Content Security Policy**: Prevents XSS attacks

## Database Schema

The application uses the following MongoDB schema for user data:

```javascript
{
  name: String (required, 2-100 characters, letters and spaces only),
  email: String (required, valid email format, max 255 characters),
  message: String (required, 10-1000 characters),
  createdAt: Date (auto-generated),
  ipAddress: String (auto-captured)
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript conventions. Consider using ESLint for code consistency.

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Deployment

### Production Considerations

1. **Environment Variables**: Set production environment variables
2. **MongoDB Atlas**: Use MongoDB Atlas for production database
3. **HTTPS**: Enable HTTPS in production
4. **Process Manager**: Use PM2 or similar for process management
5. **Logging**: Implement comprehensive logging (Morgan is included)
6. **Monitoring**: Add health check monitoring

### Example Production Commands
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "mongodb-security-app"

# Monitor
pm2 monit
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.
