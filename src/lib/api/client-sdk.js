import axios from 'axios'
import { detect } from 'detect-browser'

const getBaseURL = () => {
  let url
  if (typeof window === 'undefined') {
    process.env.PORT = process.env.PORT || 3000
    url = `http://localhost:${process.env.PORT}/api/v1`
  } else {
    url = `${window.location.origin}/api/v1/`
  }
  return url
}

export const fetcher = () => {
  const config = {
    baseURL: getBaseURL(),
    timeout: 60000,
  }

  const instance = axios.create(config)

  return instance
}

const API = {
  register(email) {
    const browser = detect()
    const tokenName = `${browser.name} - ${browser.version} | ${browser.os}`
    return fetcher().post('/registration', { email, tokenName })
  },

  verifyRegistration(email, token) {
    const urlParams = new URLSearchParams()
    urlParams.append('email', email)
    urlParams.append('token', token)
    const url = `/registration/verify?${urlParams.toString()}`
    return fetcher().get(url)
  },

  acceptRegistration(email, token) {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append('email', email)
    urlSearchParams.append('token', token)
    const url = `/registration/accept?${urlSearchParams.toString()}`
    return fetcher().get(url, {
      email,
      token,
    })
  },

  fetchUser() {
    return fetcher().get('/user')
  },

  updateProfile(userDetails) {
    return fetcher().post('/user', userDetails)
  },
  deleteProfile() {
    return fetcher().post(`/user/delete`)
  },
  fetchTasks() {
    return fetcher().get('/tasks')
  },
  createTask(name, timeSpent, projectId, startTime, endTime) {
    const payload = {
      name,
      timeSpent,
      projectId,
      startTime,
      endTime,
    }
    return fetcher().post('/tasks', payload)
  },
  fetchTaskById(id) {
    return fetcher().get(`/tasks/${id}`)
  },
  editTask(id, name, timeSpent, projectId) {
    const payload = { name, timeSpent, projectId }
    return fetcher().post(`/tasks/${id}`, payload)
  },
  addTaskToProject(id, projectId) {
    return fetcher().post(`/tasks/${id}/projects/${projectId}`)
  },
  deleteTask(id) {
    return fetcher().delete(`/tasks/${id}`)
  },
  fetchProjects() {
    return fetcher().get('/projects')
  },

  fetchProjectById(id) {
    return fetcher().get(`/projects/${id}`)
  },

  createProject(name, description, timeSpent, deadline) {
    const payload = {
      name,
      description,
      timeSpent,
      deadline,
    }
    return fetcher().post('/projects', payload)
  },
  editProject(id, name, description, timeSpent, deadline) {
    const payload = {
      name,
      description,
      timeSpent,
      deadline,
    }
    return fetcher().post(`/projects/${id}`, payload)
  },
  fetchProjectUsers(id) {
    return fetcher().get(`/projects/${id}/users`)
  },
  addUsersToProject(id, userId) {
    const payload = {
      userId,
    }
    return fetcher().post(`/projects/${id}/users`, payload)
  },
  fetchTasksByProject(id) {
    return fetcher().get(`/projects/${id}/tasks`)
  },

  fetchUserTasksByProject(id, userId) {
    return fetcher().get(`/projects/${id}/users/${userId}/tasks`)
  },

  fetchProjectUserById(id, userId) {
    return fetcher().get(`/projects/${id}/users/${userId}`)
  },

  fetchProjectBasedTotalTimeSpent() {
    return fetcher().get('/analytics/fetchProjectBasedTotalTimeSpent')
  },

  fetchTotalTimeSpent() {
    return fetcher().get('/analytics/time/projects')
  },

  searchUsers(searchTerm) {
    return fetcher().get(`/users/search?searchTerm=${searchTerm}`)
  },

  removeUserFromProject(id, userId) {
    return fetcher().delete(`/projects/${id}/users/${userId}`)
  },

  removeTaskFromProject(id) {
    return fetcher().delete(`/tasks/${id}/projects`)
  },

  deleteProject(id) {
    return fetcher().delete(`/projects/${id}`)
  },

  fetchAverageWorkTimeByDuration(duration) {
    return fetcher().get(`/analytics/time/average-work?duration=${duration}`)
  },

  fetchTotalWorkTimeByDuration(duration) {
    return fetcher().get(`/analytics/time/total/duration?duration=${duration}`)
  },

  logout() {
    return fetcher().get('/user/logout')
  },
  createTodo({ content, projectId }) {
    const payload = {
      content,
      project_id: projectId,
    }
    return fetcher().post('/todos', payload)
  },
  deleteTodo(todoId) {
    return fetcher().delete(`/todos?todoId=${todoId}`)
  },
  fetchTodos() {
    return fetcher().get('/todos')
  },
  exportTimeline(projectId) {
    return fetcher().get(
      `/analytics/data/export/timeline?projectId=${projectId}`
    )
  },
  assignProjectToTodo(todoId, projectId) {
    return fetcher().post(`/todos/${todoId}/project/${projectId}`)
  },
  updateTodoStatus(todoId, status) {
    return fetcher().post(`/todos/${todoId}/${status}`)
  },
  fetchClosingInProjectDeadline(type = 'projects') {
    return fetcher().get(`/analytics/time/deadline/closest?type=${type}`)
  },
  fetchOptions() {
    return fetcher().get(`/options`)
  },
  fetchTOTPSecret() {
    return fetcher().get(`/auth/totp/secret`)
  },
  enableTOTPforUser(secret, otp) {
    return fetcher().post(`/auth/totp/enable`, {
      secret,
      otp,
    })
  },
  disableTOTPforUser(otp) {
    return fetcher().post(`/auth/totp/disable`, {
      otp,
    })
  },
  validateOTP(otp, token = '') {
    return fetcher().post(`/auth/totp/validate`, {
      otp,
      token,
    })
  },
  fetchTOTPStatus() {
    return fetcher().get(`/auth/totp/status`)
  },
  authenticatedPing() {
    return fetcher().get(`/auth/ping`)
  },
  fetchTOTPRecoveryCodes() {
    return fetcher().get(`/auth/totp/recovery`)
  },
}

export default API
