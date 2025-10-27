// Task Assignment Integration Script
// This script can be integrated into your existing ERP application

class TaskAssignmentModal {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            theme: 'dark',
            location: 'Test (Manufacturing)',
            tasks: [],
            onAssign: null,
            onCancel: null,
            ...options
        };
        
        this.selectedTasks = new Set();
        this.init();
    }
    
    init() {
        this.render();
        this.bindEvents();
    }
    
    render() {
        const modalHTML = `
            <div class="task-assignment-modal">
                <!-- Header -->
                <div class="task-assignment-header">
                    <h2 class="task-assignment-title">
                        <span class="pin-icon">📍</span>
                        Assign Tasks to ${this.options.location}
                    </h2>
                </div>
                
                <!-- Location Tag -->
                <div class="location-tag">
                    Location: ${this.options.location}
                </div>
                
                <!-- Available Tasks Section -->
                <div class="available-tasks-section">
                    <h3 class="available-tasks-title">AVAILABLE TASKS (${this.options.tasks.length})</h3>
                    
                    <div class="tasks-list">
                        ${this.renderTasks()}
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="task-assignment-footer">
                    <button class="cancel-button">CANCEL</button>
                    <button class="assign-button" id="assignButton" disabled>ASSIGN 0 TASKS</button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = modalHTML;
    }
    
    renderTasks() {
        if (this.options.tasks.length === 0) {
            return `
                <div class="empty-tasks">
                    <div class="empty-tasks-icon">📋</div>
                    <h4 class="empty-tasks-title">No Tasks Available</h4>
                    <p class="empty-tasks-description">There are no tasks available for assignment at this location.</p>
                </div>
            `;
        }
        
        return this.options.tasks.map((task, index) => `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-icon">${task.icon || '📋'}</div>
                <div class="task-content">
                    <h4 class="task-title">${task.title}</h4>
                    <p class="task-description">${task.description}</p>
                </div>
                <button class="task-select-button">
                    <span class="radio-icon"></span>
                    CLICK TO SELECT
                </button>
            </div>
        `).join('');
    }
    
    bindEvents() {
        const taskCards = this.container.querySelectorAll('.task-card');
        const assignButton = this.container.querySelector('#assignButton');
        const cancelButton = this.container.querySelector('.cancel-button');
        
        // Task selection
        taskCards.forEach(card => {
            const button = card.querySelector('.task-select-button');
            
            card.addEventListener('click', (e) => {
                if (e.target !== button) {
                    this.toggleTask(card);
                }
            });
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTask(card);
            });
        });
        
        // Cancel button
        cancelButton.addEventListener('click', () => {
            if (this.options.onCancel) {
                this.options.onCancel();
            }
            this.close();
        });
        
        // Assign button
        assignButton.addEventListener('click', () => {
            this.assignTasks();
        });
    }
    
    toggleTask(card) {
        const taskId = card.dataset.taskId;
        const button = card.querySelector('.task-select-button');
        
        if (this.selectedTasks.has(taskId)) {
            // Deselect task
            this.selectedTasks.delete(taskId);
            card.classList.remove('selected');
            button.textContent = 'CLICK TO SELECT';
        } else {
            // Select task
            this.selectedTasks.add(taskId);
            card.classList.add('selected');
            button.textContent = 'SELECTED';
            card.classList.add('selecting');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                card.classList.remove('selecting');
            }, 300);
        }
        
        this.updateAssignButton();
    }
    
    updateAssignButton() {
        const assignButton = this.container.querySelector('#assignButton');
        const count = this.selectedTasks.size;
        assignButton.textContent = `ASSIGN ${count} TASK${count !== 1 ? 'S' : ''}`;
        assignButton.disabled = count === 0;
    }
    
    async assignTasks() {
        if (this.selectedTasks.size === 0) return;
        
        const assignButton = this.container.querySelector('#assignButton');
        const taskCards = this.container.querySelectorAll('.task-card');
        
        // Show loading state
        assignButton.disabled = true;
        assignButton.textContent = 'ASSIGNING...';
        
        taskCards.forEach(card => {
            if (this.selectedTasks.has(card.dataset.taskId)) {
                card.classList.add('loading');
            }
        });
        
        try {
            // Call the onAssign callback if provided
            if (this.options.onAssign) {
                const selectedTaskIds = Array.from(this.selectedTasks);
                await this.options.onAssign(selectedTaskIds);
            }
            
            // Show success message
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Error assigning tasks:', error);
            this.showErrorMessage(error.message);
        } finally {
            // Reset button state
            assignButton.disabled = false;
            this.updateAssignButton();
            
            // Remove loading state
            taskCards.forEach(card => {
                card.classList.remove('loading');
            });
        }
    }
    
    showSuccessMessage() {
        // You can customize this based on your notification system
        alert(`Successfully assigned ${this.selectedTasks.size} task(s)!`);
        this.close();
    }
    
    showErrorMessage(message) {
        // You can customize this based on your notification system
        alert(`Error: ${message}`);
    }
    
    close() {
        // Hide the modal container
        this.container.style.display = 'none';
        
        // Reset selections
        this.selectedTasks.clear();
        
        // Reset all task cards if they exist
        const taskCards = this.container.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.classList.remove('selected', 'loading');
            const button = card.querySelector('.task-select-button');
            if (button) {
                button.textContent = 'CLICK TO SELECT';
            }
        });
        
        // Reset assign button
        const assignButton = this.container.querySelector('#assignButton');
        if (assignButton) {
            assignButton.textContent = 'ASSIGN 0 TASKS';
            assignButton.disabled = true;
        }
    }
    
    show() {
        this.container.style.display = 'block';
    }
    
    // Public method to update tasks
    updateTasks(tasks) {
        this.options.tasks = tasks;
        this.render();
        this.bindEvents();
    }
    
    // Public method to update location
    updateLocation(location) {
        this.options.location = location;
        this.render();
        this.bindEvents();
    }
}

// Usage example:
/*
// Initialize the task assignment modal
const taskModal = new TaskAssignmentModal('taskAssignmentContainer', {
    location: 'Test (Manufacturing)',
    tasks: [
        {
            id: 'task-1',
            title: 'Production Planning',
            description: 'Plan production schedule and resource allocation for optimal efficiency',
            icon: '📋'
        },
        {
            id: 'task-2',
            title: 'Material Preparation',
            description: 'Prepare materials for production and ensure quality standards',
            icon: '📦'
        },
        {
            id: 'task-3',
            title: 'Quality Control',
            description: 'Perform in-process quality control and final inspection',
            icon: '🔍'
        },
        {
            id: 'task-4',
            title: 'Equipment Maintenance',
            description: 'Perform scheduled equipment maintenance and calibration',
            icon: '🔧'
        },
        {
            id: 'task-5',
            title: 'Safety Inspection',
            description: 'Conduct safety inspection and compliance verification',
            icon: '🛡️'
        }
    ],
    onAssign: async (selectedTaskIds) => {
        // Handle task assignment
        console.log('Assigning tasks:', selectedTaskIds);
        // Make API call to assign tasks
        // return await fetch('/api/assign-tasks', { ... });
    },
    onCancel: () => {
        console.log('Task assignment cancelled');
    }
});
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskAssignmentModal;
}
