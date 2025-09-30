import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM basics_shared ORDER BY id DESC')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM basics_shared WHERE id=?', [req.params.id])
    res.json(rows[0] || null)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {}
        const [result] = await pool.query(
          'INSERT INTO basics_shared (project_work_name, internal_project_no, type_of_project, department_authority, year) VALUES (?,?,?,?,?)',
          [
            payload.project_work_name === '' ? null : payload.project_work_name,
            payload.internal_project_no === '' ? null : payload.internal_project_no,
            payload.type_of_project === '' ? null : payload.type_of_project,
            payload.department_authority === '' ? null : payload.department_authority,
            payload.year === '' ? null : payload.year
          ]
        )
    res.json({ id: result.insertId })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const payload = req.body || {}
        const [result] = await pool.query(
          'UPDATE basics_shared SET project_work_name=?, internal_project_no=?, type_of_project=?, department_authority=?, year=? WHERE id=?',
          [
            payload.project_work_name === '' ? null : payload.project_work_name,
            payload.internal_project_no === '' ? null : payload.internal_project_no,
            payload.type_of_project === '' ? null : payload.type_of_project,
            payload.department_authority === '' ? null : payload.department_authority,
            payload.year === '' ? null : payload.year,
            id
          ]
        )
        
        if (result.affectedRows === 0) {
          throw new Error(`No record found with id ${id}`)
        }
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router


