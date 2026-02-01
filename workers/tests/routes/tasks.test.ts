/**
 * Unit Tests for Tasks API Routes
 *
 * Tests cover:
 * - GET /api/tasks - List tasks with filters
 * - GET /api/tasks/:id - Get single task
 * - POST /api/tasks - Create new task
 * - PATCH /api/tasks/:id - Update task
 * - DELETE /api/tasks/:id - Delete task
 * - Task sorting and filtering
 * - KV storage operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import app from '../../src/index'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockTask,
} from '../mocks'
import type { Bindings } from '../../src/index'

describe('Tasks Routes', () => {
    let mockEnv: Bindings
    let mockCache: MockKVNamespace
    let mockTasks: MockKVNamespace
    let mockFetch: MockFetch
    let originalFetch: typeof globalThis.fetch

    beforeEach(() => {
        mockCache = new MockKVNamespace()
        mockTasks = new MockKVNamespace()
        mockFetch = new MockFetch()
        mockEnv = createMockEnv({ CACHE: mockCache, TASKS: mockTasks })

        originalFetch = globalThis.fetch
        globalThis.fetch = mockFetch.fetch.bind(mockFetch) as typeof fetch
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        mockFetch.reset()
    })

    const makeRequest = (path: string, options?: RequestInit) => {
        return new Request(`http://localhost${path}`, {
            headers: {
                Authorization: `Bearer ${mockEnv.API_KEY}`,
                'Content-Type': 'application/json',
            },
            ...options,
        })
    }

    describe('GET /api/tasks', () => {
        it('should return empty array when no tasks', async () => {
            const req = makeRequest('/api/tasks')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toEqual([])
            expect(body.count).toBe(0)
        })

        it('should return all tasks', async () => {
            const task1 = mockTask({ id: 'task-001', title: 'Task 1', priority: 'high' })
            const task2 = mockTask({ id: 'task-002', title: 'Task 2', priority: 'low' })

            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002'],
                'task:task-001': task1,
                'task:task-002': task2,
            })

            const req = makeRequest('/api/tasks')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(2)
            expect(body.count).toBe(2)
        })

        it('should filter by status', async () => {
            const task1 = mockTask({ id: 'task-001', status: 'pending' })
            const task2 = mockTask({ id: 'task-002', status: 'completed' })

            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002'],
                'task:task-001': task1,
                'task:task-002': task2,
            })

            const req = makeRequest('/api/tasks?status=pending')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(1)
            expect(body.data[0].status).toBe('pending')
        })

        it('should filter by priority', async () => {
            const task1 = mockTask({ id: 'task-001', priority: 'high' })
            const task2 = mockTask({ id: 'task-002', priority: 'low' })

            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002'],
                'task:task-001': task1,
                'task:task-002': task2,
            })

            const req = makeRequest('/api/tasks?priority=high')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(1)
            expect(body.data[0].priority).toBe('high')
        })

        it('should filter by property_id', async () => {
            const task1 = mockTask({ id: 'task-001', property_id: 'prop-001' })
            const task2 = mockTask({ id: 'task-002', property_id: 'prop-002' })

            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002'],
                'task:task-001': task1,
                'task:task-002': task2,
            })

            const req = makeRequest('/api/tasks?property_id=prop-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(1)
            expect(body.data[0].property_id).toBe('prop-001')
        })

        it('should sort by priority then created_at', async () => {
            const task1 = mockTask({ id: 'task-001', priority: 'low', created_at: '2026-01-30T12:00:00Z' })
            const task2 = mockTask({ id: 'task-002', priority: 'urgent', created_at: '2026-01-30T10:00:00Z' })
            const task3 = mockTask({ id: 'task-003', priority: 'high', created_at: '2026-01-30T11:00:00Z' })
            const task4 = mockTask({ id: 'task-004', priority: 'urgent', created_at: '2026-01-30T11:00:00Z' })

            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002', 'task-003', 'task-004'],
                'task:task-001': task1,
                'task:task-002': task2,
                'task:task-003': task3,
                'task:task-004': task4,
            })

            const req = makeRequest('/api/tasks')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            // Urgent tasks first (sorted by created_at desc), then high, then low
            expect(body.data[0].priority).toBe('urgent')
            expect(body.data[1].priority).toBe('urgent')
            expect(body.data[2].priority).toBe('high')
            expect(body.data[3].priority).toBe('low')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/tasks')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/tasks/:id', () => {
        it('should return a single task', async () => {
            const task = mockTask({
                id: 'task-001',
                title: 'Fix broken lamp',
                priority: 'high',
            })

            mockTasks.seed({
                'task:task-001': task,
            })

            const req = makeRequest('/api/tasks/task-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.id).toBe('task-001')
            expect(body.data.title).toBe('Fix broken lamp')
        })

        it('should return 404 for non-existent task', async () => {
            const req = makeRequest('/api/tasks/nonexistent')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Task not found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/tasks/task-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('POST /api/tasks', () => {
        it('should create a new task with minimal fields', async () => {
            const req = makeRequest('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ title: 'New Task' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(201)
            const body = await res.json() as any

            expect(body.data.title).toBe('New Task')
            expect(body.data.id).toBeDefined()
            expect(body.data.status).toBe('pending')
            expect(body.data.category).toBe('general')
            expect(body.data.priority).toBe('medium')
            expect(body.data.created_by).toBe('system')
            expect(body.data.created_at).toBeDefined()
            expect(body.data.updated_at).toBeDefined()
        })

        it('should create a task with all fields', async () => {
            const taskData = {
                title: 'Fix AC unit',
                description: 'The AC is not cooling properly',
                property_id: 'prop-001',
                reservation_id: 'res-001',
                category: 'maintenance',
                priority: 'high',
                assigned_to: 'John',
                due_date: '2026-02-10',
            }

            const req = makeRequest('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(taskData),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(201)
            const body = await res.json() as any

            expect(body.data.title).toBe('Fix AC unit')
            expect(body.data.description).toBe('The AC is not cooling properly')
            expect(body.data.property_id).toBe('prop-001')
            expect(body.data.category).toBe('maintenance')
            expect(body.data.priority).toBe('high')
            expect(body.data.assigned_to).toBe('John')
            expect(body.data.due_date).toBe('2026-02-10')
        })

        it('should add task to index', async () => {
            const req = makeRequest('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ title: 'New Task' }),
            })
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            const index = await mockTasks.get('tasks:index', 'json') as string[]
            expect(index).toContain(body.data.id)
        })

        it('should return 400 when title is missing', async () => {
            const req = makeRequest('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ description: 'No title' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(400)
            const body = await res.json() as any
            expect(body.error).toBe('Title is required')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Test' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('PATCH /api/tasks/:id', () => {
        beforeEach(() => {
            const task = mockTask({
                id: 'task-001',
                title: 'Original Title',
                status: 'pending',
                priority: 'medium',
            })
            mockTasks.seed({
                'tasks:index': ['task-001'],
                'task:task-001': task,
            })
        })

        it('should update task title', async () => {
            const req = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ title: 'Updated Title' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.title).toBe('Updated Title')
        })

        it('should update task status', async () => {
            const req = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'in_progress' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.status).toBe('in_progress')
        })

        it('should set completed_at when status changes to completed', async () => {
            const req = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.status).toBe('completed')
            expect(body.data.completed_at).toBeDefined()
        })

        it('should not overwrite completed_at if already completed', async () => {
            // First complete the task
            const req1 = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            })
            const res1 = await app.fetch(req1, mockEnv)
            const body1 = await res1.json() as any
            const originalCompletedAt = body1.data.completed_at

            // Update status again to completed (should keep original completed_at)
            const req2 = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            })
            const res2 = await app.fetch(req2, mockEnv)
            const body2 = await res2.json() as any

            expect(body2.data.completed_at).toBe(originalCompletedAt)
        })

        it('should update priority', async () => {
            const req = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ priority: 'urgent' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.priority).toBe('urgent')
        })

        it('should preserve id, created_at, and created_by', async () => {
            const task = await mockTasks.get('task:task-001', 'json') as any
            const originalCreatedAt = task.created_at
            const originalCreatedBy = task.created_by

            const req = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({
                    id: 'new-id', // Should be ignored
                    created_at: '2020-01-01', // Should be ignored
                    created_by: 'hacker', // Should be ignored
                    title: 'Updated',
                }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.id).toBe('task-001')
            expect(body.data.created_at).toBe(originalCreatedAt)
            expect(body.data.created_by).toBe(originalCreatedBy)
        })

        it('should update updated_at timestamp', async () => {
            const task = await mockTasks.get('task:task-001', 'json') as any
            const originalUpdatedAt = task.updated_at

            // Small delay to ensure different timestamp
            await new Promise(resolve => setTimeout(resolve, 10))

            const req = makeRequest('/api/tasks/task-001', {
                method: 'PATCH',
                body: JSON.stringify({ title: 'Updated' }),
            })
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body.data.updated_at).not.toBe(originalUpdatedAt)
        })

        it('should return 404 for non-existent task', async () => {
            const req = makeRequest('/api/tasks/nonexistent', {
                method: 'PATCH',
                body: JSON.stringify({ title: 'Updated' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Task not found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/tasks/task-001', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Updated' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('DELETE /api/tasks/:id', () => {
        beforeEach(() => {
            const task = mockTask({ id: 'task-001' })
            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002'],
                'task:task-001': task,
            })
        })

        it('should delete a task', async () => {
            const req = makeRequest('/api/tasks/task-001', {
                method: 'DELETE',
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.success).toBe(true)

            // Verify task is deleted
            const deleted = await mockTasks.get('task:task-001')
            expect(deleted).toBeNull()
        })

        it('should remove task from index', async () => {
            const req = makeRequest('/api/tasks/task-001', {
                method: 'DELETE',
            })
            await app.fetch(req, mockEnv)

            const index = await mockTasks.get('tasks:index', 'json') as string[]
            expect(index).not.toContain('task-001')
            expect(index).toContain('task-002')
        })

        it('should return 404 for non-existent task', async () => {
            const req = makeRequest('/api/tasks/nonexistent', {
                method: 'DELETE',
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Task not found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/tasks/task-001', {
                method: 'DELETE',
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('response format', () => {
        it('should include data wrapper and count for list', async () => {
            const task = mockTask()
            mockTasks.seed({
                'tasks:index': ['task-001'],
                'task:task-001': task,
            })

            const req = makeRequest('/api/tasks')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body).toHaveProperty('data')
            expect(body).toHaveProperty('count')
        })

        it('should include data wrapper for single task', async () => {
            const task = mockTask({ id: 'task-001' })
            mockTasks.seed({ 'task:task-001': task })

            const req = makeRequest('/api/tasks/task-001')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body).toHaveProperty('data')
        })
    })
})
