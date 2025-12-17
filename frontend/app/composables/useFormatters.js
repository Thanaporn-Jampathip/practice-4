/**
 * Composable for formatting data (dates, roles, departments, etc.)
 */
export const useFormatters = () => {
  /**
   * Format date to Thai locale
   * @param {string} dateString - ISO date string
   * @param {boolean} includeTime - Include time in format
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-'

    try {
      const date = new Date(dateString)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }

      if (includeTime) {
        options.hour = '2-digit'
        options.minute = '2-digit'
      }

      return date.toLocaleDateString('th-TH', options)
    } catch (error) {
      console.error('Error formatting date:', error)
      return '-'
    }
  }

  /**
   * Format role to Thai text
   * @param {string} role - Role code
   * @returns {string} Thai role text
   */
  const getRoleText = (role) => {
    const roles = {
      'admin': 'ผู้ดูแลระบบ',
      'evaluator': 'กรรมการประเมิน',
      'employee': 'พนักงาน'
    }
    return roles[role] || role
  }

  /**
   * Get role color for Vuetify chips
   * @param {string} role - Role code
   * @returns {string} Vuetify color name
   */
  const getRoleColor = (role) => {
    const colors = {
      'admin': 'error',
      'evaluator': 'primary',
      'employee': 'success'
    }
    return colors[role] || 'grey'
  }

  /**
   * Format status to Thai text
   * @param {string} status - Status code
   * @returns {string} Thai status text
   */
  const getStatusText = (status) => {
    const statuses = {
      // Evaluation statuses
      'draft': 'แบบร่าง',
      'active': 'เปิดใช้งาน',
      'closed': 'ปิดแล้ว',

      // Allocation statuses
      'pending': 'รอดำเนินการ',
      'self-evaluated': 'ประเมินตนเองแล้ว',
      'evaluator-scored': 'กรรมการให้คะแนนแล้ว',
      'completed': 'เสร็จสมบูรณ์'
    }
    return statuses[status] || status
  }

  /**
   * Get status color for Vuetify chips
   * @param {string} status - Status code
   * @returns {string} Vuetify color name
   */
  const getStatusColor = (status) => {
    const colors = {
      // Evaluation statuses
      'draft': 'grey',
      'active': 'success',
      'closed': 'error',

      // Allocation statuses
      'pending': 'warning',
      'self-evaluated': 'info',
      'evaluator-scored': 'primary',
      'completed': 'success'
    }
    return colors[status] || 'grey'
  }

  /**
   * Format number to fixed decimal places
   * @param {number} value - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number
   */
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return '-'
    return Number(value).toFixed(decimals)
  }

  /**
   * Format percentage
   * @param {number} value - Number to format as percentage
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  const formatPercent = (value, decimals = 0) => {
    if (value === null || value === undefined) return '-'
    return `${Number(value).toFixed(decimals)}%`
  }

  return {
    formatDate,
    getRoleText,
    getRoleColor,
    getStatusText,
    getStatusColor,
    formatNumber,
    formatPercent
  }
}
