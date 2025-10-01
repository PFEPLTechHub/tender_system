// Centralized API for basics resource
// Single source of truth for resource name and CRUD operations

const RESOURCE = 'basics'; // central resource name

/**
 * Create a new basic record
 */
export async function createBasic(payload) {
  const res = await fetch(`/api/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Read a basic record by ID
 */
export async function readBasic(id) {
  if (!Number.isFinite(Number(id))) {
    throw new Error(`Invalid ID for read: ${id}`);
  }
  
  const res = await fetch(`/api/${RESOURCE}/${id}`, {
    method: 'GET'
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to read: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Update an existing basic record
 */
export async function updateBasic(id, payload) {
  if (!Number.isFinite(Number(id))) {
    throw new Error(`Invalid ID for update: ${id}`);
  }
  
  const res = await fetch(`/api/${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Save (create or update) a basic record
 * Uses POST for new records, PUT for existing ones
 */
export async function saveBasic(payload, id = null) {
  // If id is provided and valid, update; otherwise create
  if (id && Number.isFinite(Number(id))) {
    console.log(`📝 Updating basic record #${id}...`);
    return await updateBasic(id, payload);
  } else {
    console.log('✨ Creating new basic record...');
    return await createBasic(payload);
  }
}

