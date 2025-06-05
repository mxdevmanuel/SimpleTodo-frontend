<script setup>
import { onMounted, ref, computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import { useTaskStore } from '../stores/taskStore'
import Todo from './Todo.vue'

const props = defineProps({
  id: [String, Number],
  title: String,
  description: String,
  project: [String, Number, null],
  children: {
    type: Array,
    default: () => []
  },
  completed: Boolean,
  archived: Boolean
})

const todoStore = useTodoStore()
const taskStore = useTaskStore()
const showNewTodoForm = ref(false)
const newTodoTitle = ref('')

// Use local todos from store if available, otherwise fall back to props
const todos = computed(() => {
  const storedTodos = todoStore.todosForTask(props.id)
  return storedTodos.length > 0 ? storedTodos : props.children
})

onMounted(async () => {
  if (props.id) {
    await todoStore.fetchTodosForTask(props.id)
  }
})

function onToggle(val) {
  taskStore.updateTask({
    id: props.id,
    completed: val
  })
}

function onDelete() {
  taskStore.deleteTask(props.id)
}

async function onAddTodo() {
  if (!newTodoTitle.value.trim()) return
  
  try {
    await todoStore.createTodo({
      title: newTodoTitle.value.trim(),
      task: props.id,
      completed: false
    })
    newTodoTitle.value = ''
    showNewTodoForm.value = false
  } catch (error) {
    console.error('Failed to create todo:', error)
  }
}

async function onToggleTodo(id) {
  await todoStore.toggleTodoCompleted(id)
}

async function onDeleteTodo(id) {
  await todoStore.deleteTodo(id)
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4 rounded shadow bg-base-100 border border-base-200">
    <div class="flex items-center gap-3 group">
      <input
        type="checkbox"
        class="checkbox checkbox-primary"
        :checked="completed"
        @change="onToggle($event.target.checked)"
        :aria-checked="completed"
        :aria-label="`Mark task '${title}' as completed`"
      />
      <span :class="[completed ? 'line-through text-gray-400' : '', 'font-semibold flex-1']">{{ title }}</span>
      <button
        class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-1"
        @click="showNewTodoForm = true"
        aria-label="Add todo to task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button
        class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        @click="onDelete"
        aria-label="Delete task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div v-if="description" class="text-sm text-base-content/70 ml-7">{{ description }}</div>
    
    <!-- New Todo Form -->
    <div v-if="showNewTodoForm" class="ml-7 mt-2 flex gap-2">
      <input 
        type="text" 
        v-model="newTodoTitle"
        placeholder="New todo item" 
        class="input input-bordered input-sm flex-1"
        @keyup.enter="onAddTodo"
      />
      <button class="btn btn-sm btn-primary" @click="onAddTodo">Add</button>
      <button class="btn btn-sm btn-ghost" @click="showNewTodoForm = false">Cancel</button>
    </div>
    
    <!-- Todos List -->
    <div v-if="todos && todos.length" class="ml-7 mt-2 flex flex-col gap-1">
      <Todo
        v-for="todo in todos"
        :key="todo.id"
        :id="todo.id"
        :title="todo.title"
        :completed="todo.completed"
        @toggle="onToggleTodo(todo.id)"
        @delete="onDeleteTodo(todo.id)"
      />
    </div>
    <div v-if="archived" class="badge badge-outline badge-warning mt-2 ml-7">Archived</div>
  </div>
</template>

<style scoped>
.btn[aria-label="Delete task"] {
  position: relative;
}
</style>
