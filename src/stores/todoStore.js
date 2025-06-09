import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const TodoUtils = {
  formatIncomingTodo(todo) {
    // Format incoming todo data if necessary
    if (todo.id && Array.isArray(todo.id) && todo.id.length > 0) {
      todo.id = todo.id[0]; // Assuming id is an array with a single value
    }
    return {
      ...todo,
      completed: todo.completed || false, // Ensure completed is always a boolean
      task: todo.task || null // Ensure task is always set
    };
  }
};
export const useTodoStore = defineStore('todos', {
  state: () => ({
    todos: [],
    loading: false,
    error: null
  }),

  getters: {
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id == id);
    },
    todosForTask: (state) => (taskId) => {
      return state.todos.filter(todo => todo.task == taskId);
    }
  },

  actions: {
    async fetchTodosForTask(taskId) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_URL}/todos/task/${taskId}`);
        // If we're fetching todos for a specific task, we'll keep any todos for other tasks
        const otherTodos = this.todos.filter(todo => todo.task != taskId);
        const newTodos = response.data;
        this.todos = [...otherTodos, ...newTodos];
        return newTodos;
      } catch (err) {
        console.error('Error fetching todos:', err);
        this.error = err.message || 'Failed to fetch todos';
      } finally {
        this.loading = false;
      }
    },
    
    async createTodo(todo) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${API_URL}/todos`, todo);
        const newTodo = { ...todo, ...TodoUtils.formatIncomingTodo(response.data) };
        this.todos.push(newTodo);
        return newTodo;
      } catch (err) {
        console.error('Error creating todo:', err);
        this.error = err.message || 'Failed to create todo';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateTodo(todo) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.put(`${API_URL}/todos/${todo.id}`, todo);
        const updatedTodo = { ...todo, ...TodoUtils.formatIncomingTodo( response.data ) };
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
        return updatedTodo;
      } catch (err) {
        console.error('Error updating todo:', err);
        this.error = err.message || 'Failed to update todo';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteTodo(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await axios.delete(`${API_URL}/todos/${id}`);
        this.todos = this.todos.filter(todo => todo.id !== id);
      } catch (err) {
        console.error('Error deleting todo:', err);
        this.error = err.message || 'Failed to delete todo';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async toggleTodoCompleted(id) {
      const todo = this.getTodoById(id);
      if (!todo) return;
      
      try {
        return await this.updateTodo({
          ...todo,
          completed: !todo.completed
        });
      } catch (err) {
        console.error('Error toggling todo completion:', err);
        throw err;
      }
    }
  }
});
