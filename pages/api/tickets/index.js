import {
  tickets,
  generateId,
  findUser,
  CATEGORIES,
  PRIORITIES,
} from '../../../lib/store'

export default function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method not allowed' })
}

function handleGet(req, res) {
  const { studentId, technicianId, unassigned } = req.query

  let result = tickets

  if (studentId) {
    result = result.filter((t) => t.studentId === studentId)
  }

  if (technicianId) {
    result = result.filter((t) => t.technicianId === technicianId)
  }

  if (unassigned === 'true') {
    result = result.filter((t) => !t.technicianId)
  }

  return res.status(200).json({ tickets: result })
}

function handlePost(req, res) {
  const {
    title,
    description,
    category,
    location,
    priority,
    studentId,
  } = req.body || {}

  // Title validation
  if (!title || !title.trim()) {
    return res.status(400).json({
      error: 'Title is required.',
    })
  }

  // Description validation
  if (!description || !description.trim()) {
    return res.status(400).json({
      error: 'Description is required.',
    })
  }

  // Minimum description length
  if (description.trim().length < 20) {
    return res.status(400).json({
      error: 'Description must be at least 20 characters long.',
    })
  }

  // Category validation
  if (!category || !CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: 'A valid category is required.',
    })
  }

  // Location validation
  if (!location || !location.trim()) {
    return res.status(400).json({
      error: 'Location is required.',
    })
  }

  // Priority validation
  if (!priority || !PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: 'A valid priority is required.',
    })
  }

  const now = new Date().toISOString()
  const student = findUser(studentId)

  const ticket = {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    category,
    location: location.trim(),
    priority,

    // New tickets always start as Open
    status: 'Open',

    studentId: studentId || null,
    technicianId: null,

    createdAt: now,
    updatedAt: now,

    activity: [
      {
        id: 'a1',
        type: 'created',
        message: `Submitted by ${student ? student.name : 'student'}`,
        at: now,
      },
    ],
  }

  tickets.push(ticket)

  return res.status(201).json({
    ticket,
  })
}