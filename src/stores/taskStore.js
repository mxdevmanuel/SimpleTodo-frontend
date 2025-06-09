import { defineStore } from 'pinia';
import { useProjectStore } from './projectStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const TaskUtil = {
  formatIncomingTask(task) {
    // Format incoming task data if necessary
    if (task.id && Array.isArray(task.id) && task.id.length > 0) {
      task.id = task.id[0]; // Assuming id is an array with a single value
    }
    return {
      ...task,
    };
  }
};

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    selectedTaskId: null,
    filters: {
      hideCompleted: true,
      hideArchived: true
    },
    dummy: false
  }),

  getters: {
    getTaskById: (state) => (id) => {
      return state.tasks.find(task => task.id == id);
    },
    selectedTask: (state) => {
      return state.tasks.find(task => task.id == state.selectedTaskId);
    },
    allProjectTasks: (state) => {
      const projectStore = useProjectStore();
      return state.tasks.filter(task => task.project == projectStore.selectedProjectId);
    },
    tasksForCurrentProject: (state) => {
      // Add dummy dependency to force reactivity
      void state.dummy;
      let allProjectTasks = state.tasks.filter(task => task.project == useProjectStore().selectedProjectId);
      let filteredTasks = [...allProjectTasks];

      // Apply filters
      if (state.filters.hideCompleted) {
        filteredTasks = filteredTasks.filter(task => !task.completed);
      }

      if (state.filters.hideArchived) {
        filteredTasks = filteredTasks.filter(task => !task.archived);
      }

      return filteredTasks;
    },
    hiddenTasksCount: (state) => {
      const projectStore = useProjectStore();
      const allProjectTasks = state.tasks.filter(task => task.project == projectStore.selectedProjectId);
      const visibleCount = state.filters.hideCompleted || state.filters.hideArchived ?
        state.tasks.filter(task => {
          if (task.project != projectStore.selectedProjectId) return false;
          if (state.filters.hideCompleted && task.completed) return false;
          if (state.filters.hideArchived && task.archived) return false;
          return true;
        }).length :
        allProjectTasks.length;

      return allProjectTasks.length - visibleCount;
    }
  },

  actions: {
    async fetchTasksForProject(projectId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`${API_URL}/tasks/project/${projectId}`);
        this.tasks = response.data;

        // Reset selected task
        this.selectedTaskId = null;
      } catch (err) {
        console.error('Error fetching tasks:', err);
        this.error = err.message || 'Failed to fetch tasks';
      } finally {
        this.loading = false;
      }
    },

    async createTask(task) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(`${API_URL}/tasks`, task);
        const newTask = TaskUtil.formatIncomingTask(response.data);
        this.tasks.push(newTask);
        return newTask;
      } catch (err) {
        console.error('Error creating task:', err);
        this.error = err.message || 'Failed to create task';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(task) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.put(`${API_URL}/tasks/${task.id}`, task);
        const updatedTask = { ...task, ...TaskUtil.formatIncomingTask(response.data) };
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          // Vue reactivity: use splice to update the array in-place
          this.tasks.splice(index, 1, updatedTask);
        }
        // Force Pinia/Vue to re-evaluate getters by updating a dummy state property
        this.dummy = !this.dummy;
        return updatedTask;
      } catch (err) {
        console.error('Error updating task:', err);
        this.error = err.message || 'Failed to update task';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteTask(id) {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete(`${API_URL}/tasks/${id}`);
        this.tasks = this.tasks.filter(task => task.id !== id);

        // Update selected task if the deleted one was selected
        if (this.selectedTaskId === id) {
          this.selectedTaskId = null;
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        this.error = err.message || 'Failed to delete task';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    selectTask(id) {
      this.selectedTaskId = id;
    },

    // Watch for project changes and load tasks for the selected project
    async watchSelectedProject() {
      const projectStore = useProjectStore();
      if (projectStore.selectedProjectId) {
        await this.fetchTasksForProject(projectStore.selectedProjectId);
      }
    },

    toggleHideCompleted() {
      this.filters.hideCompleted = !this.filters.hideCompleted;
    },

    toggleHideArchived() {
      this.filters.hideArchived = !this.filters.hideArchived;
    },

    resetFilters() {
      this.filters.hideCompleted = false;
      this.filters.hideArchived = false;
    }
  }
});
