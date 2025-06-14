# Resource Manager

A modern, full-stack resource management application built with React, Node.js, and PostgreSQL. Perfect for organizing and managing your links, articles, videos, and other digital resources.

## ✨ Features

- **Modern UI**: Clean, responsive design with light/dark theme toggle
- **Resource Management**: Create, read, update, and delete resources
- **Advanced Filtering**: Search, sort, and filter by type, tags, status, etc.
- **CSV Import/Export**: Bulk data operations for easy migration and backup
- **Dynamic Types**: Customizable resource types (video, blog, article, etc.)
- **Tag System**: Organize resources with comma-separated tags
- **Status Tracking**: Mark resources as internal/public and active/obsolete
- **Database Admin**: Built-in Adminer for direct database access

## 🚀 Quick Start (GitHub Codespaces)

### 1. Setup Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
npm run install-all
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Start Development Servers

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Adminer (Database Admin): http://localhost:8080

### 5. Access Adminer (Database Administration)

1. Go to http://localhost:8080
2. Login with:
   - **System**: PostgreSQL
   - **Server**: postgres
   - **Username**: admin
   - **Password**: password123
   - **Database**: resource_manager (optional)

## 📁 Project Structure

```
resource-manager/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── init.sql           # Database schema
│   └── server.js
├── docker-compose.yml     # Database setup
├── .env.example          # Environment template
└── package.json          # Root configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `resource_manager` |
| `DB_USER` | Database user | `admin` |
| `DB_PASSWORD` | Database password | `password123` |
| `SERVER_PORT` | Backend port | `5000` |
| `ADMINER_PORT` | Adminer port | `8080` |
| `REACT_APP_API_URL` | Frontend API URL | `http://localhost:5000/api` |

## 📊 Database Schema

### Resources Table
- `id` - Primary key
- `name` - Resource name (required)
- `description` - Resource description
- `url` - Resource URL
- `type_id` - Foreign key to types table
- `internal` - Boolean (public/private)
- `date_created` - Creation date
- `tags` - Comma-separated tags
- `obsolete` - Boolean (active/obsolete)
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

### Types Table
- `id` - Primary key
- `name` - Type name (unique)
- `created_at` - Record creation timestamp

## 🔄 CSV Import/Export

### Export Format
The CSV export includes all resource fields:
- Name, Description, URL, Type, Internal, Date Created, Tags, Obsolete

### Import Format
Create a CSV file with these columns:
```csv
Name,Description,URL,Type,Internal,Date Created,Tags,Obsolete
Example Resource,A sample resource,https://example.com,blog,false,2024-01-01,tag1,tag2,false
```

**Import Notes:**
- Name is required
- Type must match existing types (case-insensitive)
- Internal/Obsolete: use `true`/`false` or `1`/`0`
- Date Created: use YYYY-MM-DD format
- Tags: comma-separated list

## 🎨 Theme System

The application supports automatic light/dark mode switching:
- **System Detection**: Automatically detects OS theme preference
- **Manual Toggle**: Click the theme button in the header
- **Persistence**: Theme choice is saved in localStorage
- **CSS Variables**: Easy customization through CSS custom properties

## 🔍 Search & Filtering

### Search Features
- **Text Search**: Search across name and description fields
- **Type Filter**: Filter by resource type
- **Status Filter**: Filter by public/internal and active/obsolete
- **Tag Filter**: Filter by specific tags (with autocomplete)
- **Sort Options**: Sort by name, type, or creation date

### Advanced Filtering
- Combine multiple filters for precise results
- Real-time filtering with instant results
- Clear all filters with one click
- Filter state persistence during session

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted layout for medium screens
- **Mobile**: Touch-friendly interface with collapsible elements

## 🛠️ Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
npm run build

# Start production server
npm start
```

### Adding New Features

1. **Backend**: Add routes in `server/routes/`, update models in `server/models/`
2. **Frontend**: Add components in `client/src/components/`, update contexts for state management
3. **Database**: Update `server/init.sql` for schema changes

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get all resources (with filters) |
| GET | `/api/resources/:id` | Get resource by ID |
| POST | `/api/resources` | Create new resource |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource |
| GET | `/api/resources/types/all` | Get all types |
| POST | `/api/resources/types` | Create new type |
| DELETE | `/api/resources/types/:id` | Delete type |
| GET | `/api/resources/export/csv` | Export resources to CSV |
| POST | `/api/resources/import/csv` | Import resources from CSV |
| GET | `/api/health` | Health check |

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Prevents API abuse
- **Helmet**: Security headers for Express
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Restricted file types and sizes

## 🐳 Docker Support

The application uses Docker for the database and admin tools:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs postgres
docker-compose logs adminer

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Update database credentials
3. Configure proper CORS origins
4. Set strong JWT secret
5. Use environment-specific URLs

### Build Process
```bash
npm run build
npm start
```

### Database Migration
1. Ensure PostgreSQL is running
2. Run `server/init.sql` to create schema
3. Import existing data via CSV if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check if PostgreSQL is running: `docker-compose ps`
- Verify environment variables in `.env`
- Check database logs: `docker-compose logs postgres`

**Frontend Can't Reach Backend**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify `REACT_APP_API_URL` in client environment

**CSV Import Fails**
- Check CSV format matches expected columns
- Ensure file size is under 10MB
- Verify type names exist in database

**Adminer Access Issues**
- Wait for containers to fully start
- Check credentials in `.env` file
- Try refreshing browser cache

### Performance Tips

- **Large Datasets**: Use pagination for 1000+ resources
- **Search Performance**: Create additional database indexes as needed
- **File Uploads**: Consider cloud storage for production
- **Caching**: Implement Redis for frequently accessed data

## 📞 Support

For questions and support:
1. Check this README for common solutions
2. Review the troubleshooting section
3. Check the application logs for error details
4. Create an issue in the repository