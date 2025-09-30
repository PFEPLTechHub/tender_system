import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Combined.css'
import { getCombined } from '../api/client'
import { useToast } from '../components/ToastContainer'

// Column definitions (grouped)
const COLUMNS = [
  { key:'id', label:'No', group:'Basic' },
  { key:'nameOfWork', label:'Name of Work', group:'Basic' },

  { key:'year', label:'Year', group:'Bidding' },
  { key:'status', label:'Status', group:'Bidding' },
  { key:'tenderId', label:'Tender ID', group:'Bidding' },
  { key:'category', label:'Type of Tender', group:'Bidding' },
  { key:'projectValue', label:'Project Value (Cr.)', group:'Bidding' },
  { key:'tenderDocumentsFee', label:'Tender Documents Fee', group:'Bidding' },
  { key:'formOfTenderDocumentsFee', label:'Form of Tender Fee', group:'Bidding' },
  { key:'emd', label:'EMD (Cr.)', group:'Bidding' },
  { key:'formOfEmd', label:'Form of EMD', group:'Bidding' },
  { key:'completionPeriod', label:'Completion Period', group:'Bidding' },
  { key:'lastDateOfSubmission', label:'Last Date of Submission', group:'Bidding' },
  { key:'department', label:'Department', group:'Bidding' },
  { key:'remarks', label:'Remarks', group:'Bidding' },

  { key:'projectNo', label:'Project No.', group:'Project' },
  { key:'dateOfLoa', label:'Date of LOA/LOI', group:'Project' },
  { key:'dateOfWorkOrder', label:'Date of Work Order/Contract', group:'Project' },
  { key:'startingDate', label:'Starting Date', group:'Project' },
  { key:'durationOfProject', label:'Duration of Project', group:'Project' },
  { key:'completionDate', label:'Completion Date as per Contract', group:'Project' },
  { key:'actualDateOfCompletion', label:'Actual Date of Completion', group:'Project' },
  { key:'workOrderValue', label:'Work Order/Value of Contract', group:'Project' },
  { key:'revisedWorkOrder', label:'Revised Work Order after Variations', group:'Project' },
  { key:'projectRemarks', label:'Remarks', group:'Project' },
]

// === Local fallbacks (unchanged logic) ===
function normalizeTenderList() {
  const local = JSON.parse(localStorage.getItem('customBidderData') || '[]')
  return Array.from(local).sort((a,b)=> (a?.id||0)-(b?.id||0))
}

function normalizeProjectList() {
  const local = JSON.parse(localStorage.getItem('customProjectData') || '[]')
  const normalize = (item) => {
    const f = item && item.forms && typeof item.forms === 'object' ? item.forms : item || {}
    return {
      id: item?.id,
      projectNo: f.projectNo || '',
      nameOfWork: f.nameOfWork || '',
      dateOfLoa: f.dateOfLoa || '',
      dateOfWorkOrder: f.dateOfWorkOrder || '',
      startingDate: f.startingDate || '',
      durationOfProject: f.durationOfProject || '',
      completionDate: f.completionDate || '',
      actualDateOfCompletion: f.actualDateOfCompletion || '',
      workOrderValue: f.workOrderValue || '',
      revisedWorkOrder: f.revisedWorkOrder || '',
      projectRemarks: f.remarks || ''
    }
  }
  return Array.from(local).map(normalize).sort((a,b)=> (a?.id||0)-(b?.id||0))
}

function tenderToUnifiedRow(t){
  return {
    id: t.id,
    nameOfWork: t.nameOfWork || t.projectName || '',
    category: 'Tender',
    year: t.year || '',
    status: t.status || '',
    tenderId: t.tenderId || '',
    typeOfTender: t.typeOfTender || t.typeOfProject || '',
    projectValue: t.projectValue || t.costOfWork || '',
    tenderDocumentsFee: t.tenderDocumentsFee || '',
    formOfTenderDocumentsFee: t.formOfTenderDocumentsFee || '',
    emd: t.emd || t.emdAmount || '',
    formOfEmd: t.formOfEmd || '',
    completionPeriod: t.completionPeriod || '',
    lastDateOfSubmission: t.lastDateOfSubmission || '',
    department: t.department || '',
    remarks: t.remarks || '',
  }
}

function projectToUnifiedRow(p){
  return {
    id: p.id,
    nameOfWork: p.nameOfWork || '',
    category: 'Project',
    projectNo: p.projectNo || '',
    dateOfLoa: p.dateOfLoa || '',
    dateOfWorkOrder: p.dateOfWorkOrder || '',
    startingDate: p.startingDate || '',
    durationOfProject: p.durationOfProject || '',
    completionDate: p.completionDate || '',
    actualDateOfCompletion: p.actualDateOfCompletion || '',
    workOrderValue: p.workOrderValue || '',
    revisedWorkOrder: p.revisedWorkOrder || '',
    projectRemarks: p.p_Remarks || '',
  }
}

// Simple pagination hook
function usePaginated(list, pageSize) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(list.length / pageSize))
  const start = (page-1)*pageSize
  const slice = useMemo(() => list.slice(start, start + pageSize), [list, start, pageSize])
  const prev = () => setPage(p => Math.max(1, p-1))
  const next = () => setPage(p => Math.min(pages, p+1))
  useEffect(()=>{ if (page > pages) setPage(pages) }, [pages])
  return { slice, page, pages, prev, next, setPage }
}

export default function Combined(){
  const navigate = useNavigate()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [dbData, setDbData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fallback sources
  const allTenders = useMemo(normalizeTenderList, [])
  const allProjects = useMemo(normalizeProjectList, [])

  // Fetch DB combined list
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null)
        const data = await getCombined()
        setDbData(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch database data, using static data:', err)
        setError(err.message || 'Failed to fetch')
        setDbData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Prepare unified rows
  const unified = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (dbData.length > 0) {
      // map DB rows to unified shape
      const mapped = dbData.map(row => ({
        id: row.id,
        nameOfWork: row.nameOfWork || row.project_work_name || '',
        category: row.category || row.type_of_project || '',
        year: row.year || '',
        status: row.status || row.tender_status || '',
        tenderId: row.tenderId || row.unique_tender_no || row.tender_id || '',
        typeOfTender: row.typeOfTender || row.type_of_tender || '',
        projectValue: row.projectValue || row.cost_of_work || '',
        tenderDocumentsFee: row.tenderDocumentsFee || row.tender_document_fee || '',
        formOfTenderDocumentsFee: row.formOfTenderDocumentsFee || row.form_of_tender_documents_fee || row.form_of_tender_doc_fee || '',
        emd: row.emd || row.emd_amount || '',
        formOfEmd: row.formOfEmd || row.form_of_emd || '',
        completionPeriod: row.completionPeriod || row.completion_period_months || '',
        lastDateOfSubmission: row.lastDateOfSubmission || row.last_date_of_submission || '',
        department: row.department || row.department_authority || '',
        remarks: row.remarks || '',
        projectNo: row.projectNo || row.project_no || '',
        dateOfLoa: row.dateOfLoa || row.date_of_loa || '',
        dateOfWorkOrder: row.dateOfWorkOrder || row.date_of_work_order || '',
        startingDate: row.startingDate || row.starting_date || '',
        durationOfProject: row.durationOfProject || row.duration_of_project || '',
        completionDate: row.completionDate || row.completion_date || '',
        actualDateOfCompletion: row.actualDateOfCompletion || row.actual_date_of_completion || '',
        workOrderValue: row.workOrderValue || row.value_of_contract || row.work_order_value || '',
        revisedWorkOrder: row.revisedWorkOrder || row.work_order_after_variation || '',
        projectRemarks: row.projectRemarks || row.p_remarks || ''
      }))

      const filtered = q
        ? mapped.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)))
        : mapped

      // hide completely empty rows (rows with only id and category but no meaningful data)
      return filtered.filter(r => {
        // Check if there's ANY meaningful data in the row (nameOfWork is minimum requirement)
        const nameOfWork = String(r.nameOfWork ?? '').trim()
        return nameOfWork !== '' && nameOfWork !== 'null' && nameOfWork !== 'undefined'
      })
    }

    // fallback: localStorage
    const tenders = allTenders
      .map(tenderToUnifiedRow)
      .filter(r => !q || Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)))

    const projects = allProjects
      .map(projectToUnifiedRow)
      .filter(r => !q || Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)))

    return [...tenders, ...projects].sort((a,b)=> (a.id||0)-(b.id||0))
  }, [dbData, allTenders, allProjects, query])

  const tablePage = usePaginated(unified, 12)

  const handleRowClick = (row) => {
    if (!row?.id) return
    navigate(`/forms/${row.id}`)
  }

  // compute group spans once
  const groups = useMemo(() => {
    const arr = []
    let i = 0
    while (i < COLUMNS.length) {
      const g = COLUMNS[i].group
      let span = 0
      while (i + span < COLUMNS.length && COLUMNS[i + span].group === g) span++
      arr.push({ name: g, span, key: g.toLowerCase() })
      i += span
    }
    return arr
  }, [])

  return (
    <div className="combined-page">
      {/* Topbar */}
      <header className="ts-topbar">
        <div className="ts-topbar-inner">
          <div className="ts-brand" role="img" aria-label="Tender System">
            <div className="ts-titles">
              <h1 className="ts-title">Tender System</h1>
            </div>
          </div>

          <div className="ts-actions">
            <input
              className="combined-search"
              placeholder="Search across Bidders & Projects"
              value={query}
              onChange={e=>{ setQuery(e.target.value); tablePage.setPage(1) }}
              aria-label="Search"
            />
            <button onClick={() => navigate('/forms/new')} className="ts-new-btn">
              + New Form
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="combined-main">
        <section className="combined-card">
          <div className="card-head">
            <h2>Combined Dashboard</h2>
            <div className="status-area">
              {loading && <span className="badge badge-loading">Loading…</span>}
              {error && <span className="badge badge-error">DB error — using local data</span>}
            </div>
          </div>

          {/* Sticky group bar */}
          <div className="group-row combined-columns" aria-label="Column groups">
            {groups.map((g, idx) => (
              <div
                key={`gg-${idx}`}
                className={`group-cell ${g.key}`}
                style={{ gridColumn: `span ${g.span}` }}
              >
                {g.name}
              </div>
            ))}
          </div>

          {/* Header row */}
          <div className="table-header combined-columns">
            {COLUMNS.map(col => (
              <div key={col.key} className="table-cell">{col.label}</div>
            ))}
          </div>

          {/* Data rows */}
          <div className="rows-viewport">
            {tablePage.slice.length === 0 ? (
              <div className="no-data-container">
                <svg className="no-data-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-6-6z"/>
                  <polyline points="9 2 9 8 15 8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/>
                  <line x1="8" y1="17" x2="16" y2="17"/>
                </svg>
                <h3 className="no-data-title">No Data Available</h3>
                <p className="no-data-text">Start by creating a new form using the "+ New Form" button above</p>
              </div>
            ) : (
              tablePage.slice.map((r, idx) => (
                <div
                  key={`u-${r.category}-${r.id}`}
                  className={`table-row combined-columns ${r.category ? r.category.toLowerCase() : 'row'} clickable-row`}
                  onClick={() => handleRowClick(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e)=> (e.key==='Enter' || e.key===' ') && handleRowClick(r)}
                  aria-label={`Open form for ${r.nameOfWork || 'record'} #${r.id}`}
                >
                  {COLUMNS.map(col => (
                    <div key={`${r.id}-${col.key}`} className="table-cell">
                      {col.key === 'id' ? ((tablePage.page - 1) * 12 + idx + 1) : (r[col.key] || '')}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={tablePage.prev} disabled={tablePage.page<=1} className="btn btn-ghost">Prev</button>
            <span className="page-indicator">Page {tablePage.page} / {tablePage.pages}</span>
            <button onClick={tablePage.next} disabled={tablePage.page>=tablePage.pages} className="btn btn-ghost">Next</button>
          </div>
        </section>

      </main>

      {/* Logout Button */}
      <button onClick={() => { toast.info('👋 Logging out...', 2000); setTimeout(() => navigate('/'), 500); }} className="logout-btn" title="Logout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  )
}
