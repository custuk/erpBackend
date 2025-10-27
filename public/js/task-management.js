// Task Management Dynamic Loading System
class TaskManagement {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3001/api/tasks';
    this.tasks = [];
    this.currentPage = 1;
    this.pageSize = 500;
    this.totalPages = 1;
    this.filters = {
      search: '',
      status: 'all',
      taskType: 'all',
      priority: 'all',
      assignedTo: 'all'
    };
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadTasks();
    this.loadFilterOptions();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('input[placeholder="Search tasks..."]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.currentPage = 1;
        this.loadTasks();
      });
    }

    // Filter dropdowns
    const statusFilter = document.querySelector('select[name="status"]');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.currentPage = 1;
        this.loadTasks();
      });
    }

    const typeFilter = document.querySelector('select[name="taskType"]');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.filters.taskType = e.target.value;
        this.currentPage = 1;
        this.loadTasks();
      });
    }

    const priorityFilter = document.querySelector('select[name="priority"]');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.filters.priority = e.target.value;
        this.currentPage = 1;
        this.loadTasks();
      });
    }

    // Refresh button
    const refreshBtn = document.querySelector('[data-action="refresh"]');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadTasks();
      });
    }

    // Create Task button
    const createTaskBtn = document.querySelector('[data-action="create-task"]');
    if (createTaskBtn) {
      createTaskBtn.addEventListener('click', () => {
        this.showCreateTaskModal();
      });
    }

    // Task Templates button
    const taskTemplatesBtn = document.querySelector('[data-action="task-templates"]');
    if (taskTemplatesBtn) {
      taskTemplatesBtn.addEventListener('click', () => {
        this.showTaskTemplatesModal();
      });
    }
  }

  async loadTasks() {
    try {
      this.showLoadingState();
      
      const queryParams = this.buildQueryParams();
      const response = await fetch(`${this.apiBaseUrl}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.tasks = data.data;
        this.totalPages = data.pagination.pages;
        this.currentPage = data.pagination.page;
        this.renderTasks();
        this.updatePagination();
        this.updateTaskCount();
      } else {
        throw new Error(data.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.showErrorState(error.message);
    }
  }

  buildQueryParams() {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', this.currentPage);
    params.append('limit', this.pageSize);
    
    // Filters
    if (this.filters.search) {
      params.append('search', this.filters.search);
    }
    
    if (this.filters.status && this.filters.status !== 'all') {
      params.append('status', this.filters.status);
    }
    
    if (this.filters.taskType && this.filters.taskType !== 'all') {
      params.append('taskType', this.filters.taskType);
    }
    
    if (this.filters.priority && this.filters.priority !== 'all') {
      params.append('priority', this.filters.priority);
    }
    
    if (this.filters.assignedTo && this.filters.assignedTo !== 'all') {
      params.append('assignedTo', this.filters.assignedTo);
    }
    
    // Sorting
    params.append('sortBy', this.sortBy);
    params.append('sortOrder', this.sortOrder);
    
    return params.toString();
  }

  async loadFilterOptions() {
    try {
      // Load task types
      const taskTypesResponse = await fetch(`${this.apiBaseUrl}/meta/task-types`);
      const taskTypesData = await taskTypesResponse.json();
      if (taskTypesData.success) {
        this.populateSelect('taskType', taskTypesData.data);
      }

      // Load priorities
      const prioritiesResponse = await fetch(`${this.apiBaseUrl}/meta/priorities`);
      const prioritiesData = await prioritiesResponse.json();
      if (prioritiesData.success) {
        this.populateSelect('priority', prioritiesData.data);
      }

      // Load statuses
      const statuses = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];
      this.populateSelect('status', statuses);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }

  populateSelect(selectName, options) {
    const select = document.querySelector(`select[name="${selectName}"]`);
    if (!select) return;

    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }

    // Add new options
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = this.formatOptionText(option);
      select.appendChild(optionElement);
    });
  }

  formatOptionText(text) {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  renderTasks() {
    const tbody = document.querySelector('#tasks-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.tasks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4">
            <div class="text-gray-500">
              <i class="fas fa-inbox text-4xl mb-2"></i>
              <p>No tasks found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    this.tasks.forEach(task => {
      const row = this.createTaskRow(task);
      tbody.appendChild(row);
    });
  }

  createTaskRow(task) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 border-b border-gray-200';
    
    const statusClass = this.getStatusClass(task.status);
    const priorityClass = this.getPriorityClass(task.priority);
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['completed', 'cancelled'].includes(task.status);
    
    row.innerHTML = `
      <td class="px-4 py-3">
        <div class="flex items-center">
          <input type="checkbox" class="task-checkbox" data-task-id="${task._id}">
          <div class="ml-3">
            <div class="flex items-center">
              <i class="fas ${this.getTaskIcon(task.taskType)} text-blue-500 mr-2"></i>
              <span class="font-medium text-gray-900">${task.name}</span>
            </div>
            <div class="text-sm text-gray-500">${task.description || ''}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ${task.dataObject || 'N/A'}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ${this.formatOptionText(task.taskType || 'N/A')}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
          ${this.formatOptionText(task.status || 'N/A')}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClass}">
          ${task.priority || 'N/A'}
        </span>
      </td>
      <td class="px-4 py-3 text-sm text-gray-900">
        ${task.assignedTo || 'Unassigned'}
      </td>
      <td class="px-4 py-3 text-sm text-gray-900 ${isOverdue ? 'text-red-600 font-semibold' : ''}">
        ${dueDate}
        ${isOverdue ? '<i class="fas fa-exclamation-triangle ml-1 text-red-500"></i>' : ''}
      </td>
      <td class="px-4 py-3 text-sm text-gray-900">
        ${task.sla || 'N/A'}
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center space-x-2">
          <button class="text-blue-600 hover:text-blue-800" onclick="taskManager.viewTask('${task._id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="text-green-600 hover:text-green-800" onclick="taskManager.editTask('${task._id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-purple-600 hover:text-purple-800" onclick="taskManager.addSubTask('${task._id}')" title="Add Sub-task">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </td>
    `;
    
    return row;
  }

  getStatusClass(status) {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityClass(priority) {
    const priorityClasses = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-800';
  }

  getTaskIcon(taskType) {
    const iconMap = {
      'manual': 'fa-user',
      'system': 'fa-cog',
      'communication': 'fa-envelope',
      'quality': 'fa-check-circle',
      'decision': 'fa-question-circle',
      'api': 'fa-plug',
      'notification': 'fa-bell',
      'validation': 'fa-shield-alt'
    };
    return iconMap[taskType] || 'fa-tasks';
  }

  updatePagination() {
    const paginationContainer = document.querySelector('#pagination');
    if (!paginationContainer) return;

    if (this.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let paginationHTML = '<div class="flex items-center justify-between">';
    
    // Previous button
    paginationHTML += `
      <button 
        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        ${this.currentPage === 1 ? 'disabled' : ''}
        onclick="taskManager.goToPage(${this.currentPage - 1})"
      >
        Previous
      </button>
    `;

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button 
          class="px-3 py-2 text-sm font-medium border-t border-b ${
            i === this.currentPage 
              ? 'bg-blue-50 text-blue-600 border-blue-500' 
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
          }"
          onclick="taskManager.goToPage(${i})"
        >
          ${i}
        </button>
      `;
    }

    // Next button
    paginationHTML += `
      <button 
        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        ${this.currentPage === this.totalPages ? 'disabled' : ''}
        onclick="taskManager.goToPage(${this.currentPage + 1})"
      >
        Next
      </button>
    `;

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
  }

  updateTaskCount() {
    const countElement = document.querySelector('#task-count');
    if (countElement) {
      countElement.textContent = `Showing ${this.tasks.length} of ${this.tasks.length} tasks`;
    }
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  showLoadingState() {
    const tbody = document.querySelector('#tasks-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-8">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          </td>
        </tr>
      `;
    }
  }

  showErrorState(message) {
    const tbody = document.querySelector('#tasks-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-8">
            <div class="text-red-500">
              <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
              <p class="font-medium">Error loading tasks</p>
              <p class="text-sm">${message}</p>
              <button 
                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onclick="taskManager.loadTasks()"
              >
                Retry
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  }

  // Task actions
  async viewTask(taskId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${taskId}`);
      const data = await response.json();
      
      if (data.success) {
        this.showTaskModal(data.data, 'view');
      } else {
        alert('Error loading task: ' + data.message);
      }
    } catch (error) {
      console.error('Error viewing task:', error);
      alert('Error loading task');
    }
  }

  async editTask(taskId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${taskId}`);
      const data = await response.json();
      
      if (data.success) {
        this.showTaskModal(data.data, 'edit');
      } else {
        alert('Error loading task: ' + data.message);
      }
    } catch (error) {
      console.error('Error editing task:', error);
      alert('Error loading task');
    }
  }

  addSubTask(parentTaskId) {
    // Implementation for adding sub-task
    console.log('Add sub-task for:', parentTaskId);
    // You can implement a modal or redirect to a form
  }

  showCreateTaskModal() {
    // Implementation for create task modal
    console.log('Show create task modal');
    // You can implement a modal or redirect to a form
  }

  showTaskTemplatesModal() {
    // Implementation for task templates modal
    console.log('Show task templates modal');
    // You can implement a modal or redirect to templates
  }

  showTaskModal(task, mode) {
    // Implementation for task modal (view/edit)
    console.log('Show task modal:', mode, task);
    // You can implement a modal for viewing/editing tasks
  }

  // Utility methods
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }
}

// Initialize the task management system when the page loads
document.addEventListener('DOMContentLoaded', function() {
  window.taskManager = new TaskManagement();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskManagement;
}
