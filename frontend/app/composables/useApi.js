// ไฟล์สำหรับเชื่อมต่อกับ Backend API
import axios from 'axios'

// กำหนด URL ของ Backend (port 4000)
const API_URL = 'http://localhost:4000/api'

// สร้าง axios instance แบบ singleton (สร้างครั้งเดียวใช้ตลอด)
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ฟังก์ชันสำหรับเพิ่ม token ใน header
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common['Authorization']
  }
}

export const useApi = () => {
  // ใช้ instance ที่สร้างไว้แล้ว
  const api = axiosInstance

  // ==================== Authentication APIs ====================

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getMe = async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // ==================== Admin APIs ====================

  // Evaluations (รอบการประเมิน)
  const getEvaluations = async () => {
    try {
      const response = await api.get('/admin/evaluations')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const createEvaluation = async (data) => {
    try {
      const response = await api.post('/admin/evaluations', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const updateEvaluation = async (id, data) => {
    try {
      const response = await api.put(`/admin/evaluations/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Topics (หัวข้อการประเมิน)
  const getTopics = async (evaluationId) => {
    try {
      const response = await api.get('/admin/topics', {
        params: { evaluationId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const createTopic = async (data) => {
    try {
      const response = await api.post('/admin/topics', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const updateTopic = async (id, data) => {
    try {
      const response = await api.put(`/admin/topics/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const deleteTopic = async (id) => {
    try {
      const response = await api.delete(`/admin/topics/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Indicators (ตัวชี้วัด)
  const getIndicators = async (topicId) => {
    try {
      const response = await api.get('/admin/indicators', {
        params: { topicId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const createIndicator = async (data) => {
    try {
      const response = await api.post('/admin/indicators', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const updateIndicator = async (id, data) => {
    try {
      const response = await api.put(`/admin/indicators/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const deleteIndicator = async (id) => {
    try {
      const response = await api.delete(`/admin/indicators/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const createIndicatorLevel = async (indicatorId, data) => {
    try {
      const response = await api.post(`/admin/indicators/${indicatorId}/levels`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Allocations (การมอบหมายกรรมการ)
  const createAllocation = async (data) => {
    try {
      const response = await api.post('/admin/allocations', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getAllocations = async (evaluationId) => {
    try {
      const response = await api.get('/admin/allocations', {
        params: { evaluationId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // Employees & Departments
  const getEmployees = async () => {
    try {
      const response = await api.get('/admin/employees')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getDepartments = async () => {
    try {
      const response = await api.get('/admin/departments')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // ==================== Employee APIs ====================

  const getEmployeeProfile = async () => {
    try {
      const response = await api.get('/employee/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const updateEmployeeProfile = async (data) => {
    try {
      const response = await api.put('/employee/profile', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getMyEvaluations = async () => {
    try {
      const response = await api.get('/employee/my-evaluations')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getEvaluationDetail = async (allocationId) => {
    try {
      const response = await api.get(`/employee/evaluation/${allocationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const saveSelfEvaluation = async (data) => {
    try {
      const response = await api.post('/employee/self-evaluation', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const uploadEvidence = async (formData) => {
    try {
      const response = await api.post('/employee/upload-evidence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getProgress = async (allocationId) => {
    try {
      const response = await api.get(`/employee/progress/${allocationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getEvaluationResults = async (allocationId) => {
    try {
      const response = await api.get(`/employee/results/${allocationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // ==================== Evaluator APIs ====================

  const getAssignedEvaluations = async () => {
    try {
      const response = await api.get('/evaluator/assigned')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getEmployeeDetail = async (allocationId) => {
    try {
      const response = await api.get(`/evaluator/employee/${allocationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const scoreIndicator = async (data) => {
    try {
      const response = await api.post('/evaluator/score', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const addComment = async (data) => {
    try {
      const response = await api.post('/evaluator/comment', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const saveSignature = async (data) => {
    try {
      const response = await api.post('/evaluator/signature', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const submitEvaluation = async (data) => {
    try {
      const response = await api.post('/evaluator/submit', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getEvaluationSummary = async (allocationId) => {
    try {
      const response = await api.get(`/evaluator/summary/${allocationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // ==================== Report APIs ====================

  const getReportOverview = async (evaluationId) => {
    try {
      const response = await api.get('/reports/overview', {
        params: { evaluationId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getReportProgress = async (evaluationId) => {
    try {
      const response = await api.get('/reports/progress', {
        params: { evaluationId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getEmployeeReport = async (employeeId, evaluationId) => {
    try {
      const response = await api.get(`/reports/employee/${employeeId}`, {
        params: { evaluationId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  const getDepartmentStats = async (evaluationId) => {
    try {
      const response = await api.get('/reports/department', {
        params: { evaluationId }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // ส่งคืนฟังก์ชันทั้งหมด
  return {
    setAuthToken,

    // Auth
    login,
    register,
    getMe,

    // Admin - Evaluations
    getEvaluations,
    createEvaluation,
    updateEvaluation,

    // Admin - Topics
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic,

    // Admin - Indicators
    getIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    createIndicatorLevel,

    // Admin - Allocations
    createAllocation,
    getAllocations,

    // Admin - Employees & Departments
    getEmployees,
    getDepartments,

    // Employee
    getEmployeeProfile,
    updateEmployeeProfile,
    getMyEvaluations,
    getEvaluationDetail,
    saveSelfEvaluation,
    uploadEvidence,
    getProgress,
    getEvaluationResults,

    // Evaluator
    getAssignedEvaluations,
    getEmployeeDetail,
    scoreIndicator,
    addComment,
    saveSignature,
    submitEvaluation,
    getEvaluationSummary,

    // Reports
    getReportOverview,
    getReportProgress,
    getEmployeeReport,
    getDepartmentStats
  }
}
