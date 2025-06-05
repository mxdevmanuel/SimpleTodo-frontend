<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  id: [String, Number],
  title: String,
  completed: Boolean
})

const emit = defineEmits(['toggle', 'delete'])

function onToggle() {
  emit('toggle', props.id)
}

function onDelete() {
  emit('delete', props.id)
}
</script>

<template>
  <div class="flex items-center gap-3 py-2 px-4 rounded hover:bg-base-200 group">
    <input
      type="checkbox"
      class="checkbox checkbox-primary"
      :checked="completed"
      @change="onToggle"
      :aria-checked="completed"
      :aria-label="`Mark todo '${title}' as completed`"
    />
    <span :class="[completed ? 'line-through text-gray-400' : '', 'flex-1']">{{ title }}</span>
    <button
      class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
      @click="onDelete"
      aria-label="Delete todo"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Hide delete button visually but keep it accessible for screen readers */
.btn[aria-label="Delete todo"] {
  position: relative;
}
</style>
