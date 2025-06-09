<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div class="bg-base-100 p-6 rounded shadow-lg w-full max-w-md relative">
      <button class="btn btn-sm btn-circle absolute top-2 right-2" @click="$emit('close')" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 class="text-lg font-bold mb-4">{{ isEdit ? 'Edit Task' : 'Create Task' }}</h2>
      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label class="block mb-1 font-medium">Title</label>
          <input v-model="form.title" class="input input-bordered w-full" required />
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-medium">Description</label>
          <textarea v-model="form.description" class="textarea textarea-bordered w-full" rows="2"></textarea>
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-medium">Project</label>
          <select v-model="form.project" class="select select-bordered w-full">
            <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.title }}</option>
          </select>
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary">{{ isEdit ? 'Save' : 'Create' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'

const props = defineProps({
  modelValue: Boolean,
  isEdit: Boolean,
  task: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close', 'submit'])

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const projects = computed(() => projectStore.projects)

const form = ref({
  title: '',
  description: '',
  project: null
})

watch(
  () => props.task,
  (task) => {
    if (task) {
      form.value = {
        title: task.title,
        description: task.description,
        project: task.project
      }
    } else {
      form.value = { title: '', description: '', project: null }
    }
  },
  { immediate: true }
)

async function onSubmit() {
  emit('submit', { ...form.value })
}
</script>
