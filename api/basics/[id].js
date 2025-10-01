import { pool } from '../../../server/db.js'

export default async function handler(req, res) {
  const { method, query } = req
  const { id } = query

  if (!id) {
    return res.status(400).json({ error: 'ID is required' })
  }

  try {
    switch (method) {
      case 'GET':
        const [rows] = await pool.query('SELECT * FROM basics WHERE id = ?', [id])
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Record not found' })
        }
        return res.json(rows[0])

      case 'PUT':
        const { project_work_name, internal_project_no, type_of_project, department_authority, year } = req.body
        
        await pool.query(
          'UPDATE basics SET project_work_name = ?, internal_project_no = ?, type_of_project = ?, department_authority = ?, year = ? WHERE id = ?',
          [project_work_name, internal_project_no, type_of_project, department_authority, year, id]
        )
        
        return res.json({ id, ...req.body })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: error.message })
  }
}
