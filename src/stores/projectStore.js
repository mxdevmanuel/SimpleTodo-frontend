import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.API_URL || 'http://localhost:3000';

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [],
    loading: false,
    error: null,
    selectedProjectId: null
  }),

  getters: {
    getProjectById: (state) => (id) => {
      return state.projects.find(project => project.id == id);
    },
    selectedProject: (state) => {
      return state.projects.find(project => project.id == state.selectedProjectId);
    }
  },

  actions: {
    async fetchProjects() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_URL}/projects`);
        this.projects = response.data;
        
        // Set first project as selected if none is selected
        if (!this.selectedProjectId && this.projects.length > 0) {
          this.selectedProjectId = this.projects[0].id;
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        this.error = err.message || 'Failed to fetch projects';
      } finally {
        this.loading = false;
      }
    },
    
    async createProject(project) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${API_URL}/projects`, project);
        const newProject = response.data;
        this.projects.push(newProject);
        return newProject;
      } catch (err) {
        console.error('Error creating project:', err);
        this.error = err.message || 'Failed to create project';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProject(project) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.put(`${API_URL}/projects`, project);
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          this.projects[index] = response.data;
        }
        return response.data;
      } catch (err) {
        console.error('Error updating project:', err);
        this.error = err.message || 'Failed to update project';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteProject(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await axios.delete(`${API_URL}/projects/${id}`);
        this.projects = this.projects.filter(project => project.id !== id);
        
        // Update selected project if the deleted one was selected
        if (this.selectedProjectId === id) {
          this.selectedProjectId = this.projects.length > 0 ? this.projects[0].id : null;
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        this.error = err.message || 'Failed to delete project';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    selectProject(id) {
      this.selectedProjectId = id;
    }
  }
});
