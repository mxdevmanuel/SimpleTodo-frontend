<script setup>
import { ref, watchEffect, onMounted, watch, computed } from 'vue'
import { useProjectStore } from './stores/projectStore'
import { useTaskStore } from './stores/taskStore'
import Todo from './components/Todo.vue'
import Task from './components/Task.vue'
import Sidebar from './components/Sidebar.vue'

const theme = ref('light')
const sidebarOpen = ref(false)
const showNewProjectModal = ref(false)
const showNewTaskModal = ref(false)
const showProjectName = ref(false)
const newProjectName = ref('')
const newTask = ref({
  title: '',
  description: ''
})
const projectStore = useProjectStore()
const taskStore = useTaskStore()

// Computed property to check if any filters are active
const isFiltering = computed(() => {
  return taskStore.filters.hideCompleted || taskStore.filters.hideArchived;
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function toggleProjectNameVisibility() {
  showProjectName.value = !showProjectName.value
}

async function createNewProject() {
  if (!newProjectName.value.trim()) return
  
  try {
    await projectStore.createProject({ name: newProjectName.value.trim() })
    newProjectName.value = ''
    showNewProjectModal.value = false
  } catch (error) {
    console.error('Failed to create project:', error)
  }
}

async function createNewTask() {
  if (!newTask.value.title.trim()) return
  
  try {
    await taskStore.createTask({
      title: newTask.value.title.trim(),
      description: newTask.value.description.trim(),
      project: projectStore.selectedProjectId,
      completed: false,
      archived: false
    })
    newTask.value = { title: '', description: '' }
    showNewTaskModal.value = false
  } catch (error) {
    console.error('Failed to create task:', error)
  }
}

// Apply theme to html tag (daisyUI uses data-theme)
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

// Watch for project selection changes and load tasks
onMounted(() => {
  projectStore.fetchProjects()
})

watch(() => projectStore.selectedProjectId, async (newProjectId) => {
  if (newProjectId) {
    await taskStore.fetchTasksForProject(newProjectId)
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex flex-row">
    <transition name="slide">
      <Sidebar 
        v-if="sidebarOpen" 
        class="fixed z-40 left-0 top-0 h-full" 
        @close="sidebarOpen = false"
        @add-project="showNewProjectModal = true"
      />
    </transition>
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <header class="w-full flex items-center justify-between px-6 py-4 bg-base-100 border-b border-base-300 shadow-sm">
        <div class="flex items-center gap-3">
          <button v-if="!sidebarOpen" class="btn btn-sm btn-ghost" @click="toggleSidebar" aria-label="Open sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div class="flex items-center gap-2" v-if="projectStore.selectedProject">
            <button 
              class="btn btn-sm btn-ghost btn-square" 
              @click="toggleProjectNameVisibility"
              :aria-label="showProjectName ? 'Hide project name' : 'Show project name'"
            >
              <svg 
                v-if="showProjectName"
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                />
              </svg>
              <svg 
                v-else
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                />
              </svg>
            </button>
            <transition name="fade">
              <h2 v-if="showProjectName" class="text-lg font-semibold">
                {{ projectStore.selectedProject.name }}
              </h2>
            </transition>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-sm btn-outline m-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              <span 
                v-if="taskStore.hiddenTasksCount > 0 && isFiltering" 
                class="badge badge-sm ml-1"
              >
                {{ taskStore.hiddenTasksCount }}
              </span>
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <label class="flex cursor-pointer gap-2">
                  <input type="checkbox" class="checkbox checkbox-sm" 
                    :checked="taskStore.filters.hideCompleted" 
                    @change="taskStore.toggleHideCompleted()" />
                  <span>Hide completed tasks</span>
                </label>
              </li>
              <li>
                <label class="flex cursor-pointer gap-2">
                  <input type="checkbox" class="checkbox checkbox-sm" 
                    :checked="taskStore.filters.hideArchived" 
                    @change="taskStore.toggleHideArchived()" />
                  <span>Hide archived tasks</span>
                </label>
              </li>
              <li>
                <button class="btn btn-ghost btn-xs mt-2" @click="taskStore.resetFilters()">
                  Show all tasks
                </button>
              </li>
            </ul>
          </div>
          <button class="btn btn-sm btn-outline" @click="toggleTheme">
            Switch to {{ theme === 'light' ? 'dark' : 'light' }} mode
          </button>
        </div>
      </header>
      <!-- Main content -->
      <main class="grid gap-4 p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-stretch relative">
        <!-- Filter status bar - only show when filtering hides all tasks -->
        <div 
          v-if="taskStore.hiddenTasksCount > 0 && taskStore.tasksForCurrentProject.length === 0" 
          class="col-span-full alert alert-info mb-2"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{{ taskStore.hiddenTasksCount }} {{ taskStore.hiddenTasksCount === 1 ? 'task is' : 'tasks are' }} currently filtered out</span>
          </div>
          <div class="flex-none">
            <button class="btn btn-sm" @click="taskStore.resetFilters()">Show all tasks</button>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-if="taskStore.loading" class="col-span-full flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        
        <!-- Error state -->
        <div v-else-if="taskStore.error" class="col-span-full alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ taskStore.error }}</span>
          </div>
        </div>
        
        <!-- No tasks message -->
        <div v-else-if="taskStore.tasksForCurrentProject.length === 0" class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="text-lg font-semibold">No tasks found</h3>
          <p class="text-base-content opacity-70 mt-2">
            {{ isFiltering ? 'Adjust filters to see more tasks' : 'Create your first task for this project' }}
          </p>
          <button 
            v-if="isFiltering" 
            class="btn btn-sm btn-outline mt-4"
            @click="taskStore.resetFilters()"
          >
            Show all tasks
          </button>
        </div>
        
        <!-- Task list -->
        <Task
          v-else
          v-for="task in taskStore.tasksForCurrentProject"
          :key="task.id"
          :id="task.id"
          :title="task.title"
          :description="task.description"
          :project="task.project"
          :children="task.todos || []"
          :completed="task.completed"
          :archived="task.archived"
        />
        
        <!-- Floating action button for new task -->
        <button
          v-if="projectStore.selectedProjectId"
          class="btn btn-circle btn-primary btn-lg shadow-lg fixed bottom-6 right-6"
          @click="showNewTaskModal = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </main>
    </div>
  </div>
  
  <!-- New Project Modal -->
  <div class="modal" :class="{ 'modal-open': showNewProjectModal }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Create New Project</h3>
      <div class="py-4">
        <input 
          type="text" 
          v-model="newProjectName" 
          placeholder="Project name" 
          class="input input-bordered w-full"
          @keyup.enter="createNewProject"
        />
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="showNewProjectModal = false">Cancel</button>
        <button class="btn btn-primary" @click="createNewProject">Create</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="showNewProjectModal = false"></div>
  </div>
  
  <!-- New Task Modal -->
  <div class="modal" :class="{ 'modal-open': showNewTaskModal }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Create New Task</h3>
      <div class="py-4 space-y-4">
        <div>
          <label class="label">
            <span class="label-text">Title</span>
          </label>
          <input 
            type="text" 
            placeholder="Task title" 
            class="input input-bordered w-full" 
            v-model="newTask.title"
            @keyup.enter="createNewTask"
          />
        </div>
        <div>
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea 
            placeholder="Task description (optional)" 
            class="textarea textarea-bordered w-full" 
            v-model="newTask.description"
          ></textarea>
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="showNewTaskModal = false">Cancel</button>
        <button class="btn btn-primary" @click="createNewTask">Create</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="showNewTaskModal = false"></div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
