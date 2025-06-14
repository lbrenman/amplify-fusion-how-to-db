const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Get all resources with filtering
router.get('/', async (req, res) => {
  try {
    const filters = {
      type_id: req.query.type_id,
      internal: req.query.internal === 'true' ? true : req.query.internal === 'false' ? false : undefined,
      obsolete: req.query.obsolete === 'true' ? true : req.query.obsolete === 'false' ? false : undefined,
      tags: req.query.tags,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const resources = await Resource.getAll(filters);
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.getById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new resource
router.post('/', async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update resource
router.put('/:id', async (req, res) => {
  try {
    const resource = await Resource.update(req.params.id, req.body);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.delete(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export resources to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const resources = await Resource.getAll();
    const csvPath = path.join(__dirname, '..', 'exports', 'resources.csv');
    
    // Ensure exports directory exists
    const exportsDir = path.dirname(csvPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'url', title: 'URL' },
        { id: 'type_name', title: 'Type' },
        { id: 'internal', title: 'Internal' },
        { id: 'date_created', title: 'Date Created' },
        { id: 'tags', title: 'Tags' },
        { id: 'obsolete', title: 'Obsolete' }
      ]
    });

    await csvWriter.writeRecords(resources);
    
    res.download(csvPath, 'resources.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up the file after download
      fs.unlinkSync(csvPath);
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import resources from CSV
router.post('/import/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    // Get all types for mapping
    const types = await Resource.getAllTypes();
    const typeMap = {};
    types.forEach(type => {
      typeMap[type.name.toLowerCase()] = type.id;
    });

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const imported = [];
          const errors = [];

          for (const row of results) {
            try {
              const typeId = typeMap[row.Type?.toLowerCase()] || null;
              
              const resourceData = {
                name: row.Name || '',
                description: row.Description || '',
                url: row.URL || '',
                type_id: typeId,
                internal: row.Internal === 'true' || row.Internal === '1',
                date_created: row['Date Created'] ? new Date(row['Date Created']) : new Date(),
                tags: row.Tags || '',
                obsolete: row.Obsolete === 'true' || row.Obsolete === '1'
              };

              const resource = await Resource.create(resourceData);
              imported.push(resource);
            } catch (error) {
              errors.push({ row, error: error.message });
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(filePath);

          res.json({
            message: `Successfully imported ${imported.length} resources`,
            imported: imported.length,
            errors: errors.length,
            errorDetails: errors
          });
        } catch (error) {
          console.error('Error processing CSV:', error);
          fs.unlinkSync(filePath);
          res.status(500).json({ error: 'Error processing CSV file' });
        }
      });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Type management routes
router.get('/types/all', async (req, res) => {
  try {
    const types = await Resource.getAllTypes();
    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/types', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Type name is required' });
    }
    const type = await Resource.createType(name);
    res.status(201).json(type);
  } catch (error) {
    console.error('Error creating type:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Type already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.delete('/types/:id', async (req, res) => {
  try {
    const type = await Resource.deleteType(req.params.id);
    if (!type) {
      return res.status(404).json({ error: 'Type not found' });
    }
    res.json({ message: 'Type deleted successfully' });
  } catch (error) {
    console.error('Error deleting type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;