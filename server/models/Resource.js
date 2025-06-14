const pool = require('../config/database');

class Resource {
  static async getAll(filters = {}) {
    let query = `
      SELECT r.*, t.name as type_name 
      FROM resources r 
      LEFT JOIN types t ON r.type_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (filters.type_id) {
      query += ` AND r.type_id = $${paramCount}`;
      params.push(filters.type_id);
      paramCount++;
    }

    if (filters.internal !== undefined) {
      query += ` AND r.internal = $${paramCount}`;
      params.push(filters.internal);
      paramCount++;
    }

    if (filters.obsolete !== undefined) {
      query += ` AND r.obsolete = $${paramCount}`;
      params.push(filters.obsolete);
      paramCount++;
    }

    if (filters.tags) {
      query += ` AND r.tags ILIKE $${paramCount}`;
      params.push(`%${filters.tags}%`);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    // Add sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY r.${sortField} ${sortOrder}`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT r.*, t.name as type_name 
      FROM resources r 
      LEFT JOIN types t ON r.type_id = t.id 
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(resourceData) {
    const {
      name,
      description,
      url,
      type_id,
      internal = false,
      date_created,
      tags,
      obsolete = false
    } = resourceData;

    const query = `
      INSERT INTO resources (name, description, url, type_id, internal, date_created, tags, obsolete)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      name,
      description,
      url,
      type_id,
      internal,
      date_created || new Date(),
      tags,
      obsolete
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, resourceData) {
    const {
      name,
      description,
      url,
      type_id,
      internal,
      date_created,
      tags,
      obsolete
    } = resourceData;

    const query = `
      UPDATE resources 
      SET name = $1, description = $2, url = $3, type_id = $4, 
          internal = $5, date_created = $6, tags = $7, obsolete = $8
      WHERE id = $9
      RETURNING *
    `;

    const values = [name, description, url, type_id, internal, date_created, tags, obsolete, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM resources WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAllTypes() {
    const query = 'SELECT * FROM types ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async createType(name) {
    const query = 'INSERT INTO types (name) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  static async deleteType(id) {
    const query = 'DELETE FROM types WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Resource;