import { pool } from '../../server/db.js'

export default async function handler(req, res) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        if (req.query.id) {
          // Get single basic record
          const [rows] = await pool.query('SELECT * FROM basics_shared WHERE id = ?', [req.query.id])
          if (rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' })
          }
          return res.json(rows[0])
        } else {
          // Get all basic records
          const [rows] = await pool.query('SELECT * FROM basics_shared ORDER BY id DESC')
          return res.json(rows)
        }

      case 'POST':
        const { project_work_name, internal_project_no, type_of_project, department_authority, year } = req.body
        
        const [result] = await pool.query(
          'INSERT INTO basics_shared (project_work_name, internal_project_no, type_of_project, department_authority, year) VALUES (?, ?, ?, ?, ?)',
          [project_work_name, internal_project_no, type_of_project, department_authority, year]
        )
        
        return res.json({ id: result.insertId, ...req.body })

      case 'PUT':
        if (!req.query.id) {
          return res.status(400).json({ error: 'ID is required for update' })
        }
        
        const { project_work_name: updateName, internal_project_no: updateNo, type_of_project: updateType, department_authority: updateDept, year: updateYear } = req.body
        
        const [updateResult] = await pool.query(
          'UPDATE basics_shared SET project_work_name = ?, internal_project_no = ?, type_of_project = ?, department_authority = ?, year = ? WHERE id = ?',
          [updateName, updateNo, updateType, updateDept, updateYear, req.query.id]
        )
        
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: 'Record not found' })
        }
        
        return res.json({ id: req.query.id, ...req.body })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: error.message })
  }
}
