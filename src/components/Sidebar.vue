<script setup>
import { onMounted } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { storeToRefs } from 'pinia'

// Use the project store
const projectStore = useProjectStore()
// Extract reactive properties from the store
const { projects, selectedProjectId, loading, error } = storeToRefs(projectStore)

// Fetch projects when component is mounted
onMounted(() => {
  projectStore.fetchProjects()
})

function selectProject(id) {
  projectStore.selectProject(id)
}
</script>

<template>
  <aside class="w-64 min-h-screen bg-base-200 p-4 flex flex-col gap-2 border-r border-base-300 relative">
    <button class="btn btn-sm btn-square absolute top-2 right-2 z-50" @click="$emit('close')" aria-label="Close sidebar">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <h2 class="text-lg font-bold mb-4">Projects</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-4">
      <span class="loading loading-spinner loading-md"></span>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error shadow-lg">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ error }}</span>
      </div>
    </div>
    
    <!-- Project list -->
    <ul v-else class="flex flex-col gap-1">
      <li v-for="project in projects" :key="project.id">
        <button
          class="btn btn-block btn-sm justify-start"
          :class="selectedProjectId === project.id ? 'btn-primary' : 'btn-ghost'"
          @click="selectProject(project.id)"
        >
          {{ project.name }}
        </button>
      </li>
    </ul>
    
    <!-- Add project button -->
    <button class="btn btn-ghost btn-sm mt-4" @click="$emit('add-project')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Project
    </button>
  </aside>
</template>

<style scoped>
/* Optional: custom styles for sidebar */
</style>
