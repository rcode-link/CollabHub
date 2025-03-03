<script setup>
import { ref, onMounted } from 'vue';
import AdvancedEditor from '../shared/advancedEditor/Index.vue';

// Props for the collaborative editor demo
const props = defineProps({
  // Unique ID for the document being edited
  documentId: {
    type: [Number, String],
    required: true
  },
  // Initial content for the editor
  initialContent: {
    type: Object,
    default: () => ({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Start editing this collaborative document...'
            }
          ]
        }
      ]
    })
  }
});

// Editor state
const editorContent = ref(props.initialContent);
const isEditable = ref(true);

// Handle when the editor submits content
const handleSubmitted = (value) => {
  console.log('Content submitted:', value);
  // You could save the document here if needed
};

// Example users (in a real app, this would come from your user system)
const users = ref([
  { id: 1, name: 'John Doe', color: '#3b82f6' },
  { id: 2, name: 'Jane Smith', color: '#ef4444' },
  { id: 3, name: 'Bob Johnson', color: '#10b981' }
]);

// Show a notification when another user joins
onMounted(() => {
  setTimeout(() => {
    showUserJoinedNotification(users.value[1]);
  }, 3000);
  
  setTimeout(() => {
    showUserJoinedNotification(users.value[2]);
  }, 7000);
});

// Function to show a toast notification when users join
const showUserJoinedNotification = (user) => {
  // In a real application, you'd use a toast notification system
  // This is just a simple example
  const toast = document.createElement('div');
  toast.className = 'user-joined-toast';
  toast.style.backgroundColor = user.color;
  
  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-${user.color}-700 font-bold">
        ${user.name.charAt(0)}
      </div>
      <div class="ml-2 text-white">
        <p class="font-medium">${user.name} joined the document</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove after animation
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};
</script>

<template>
  <div class="collaborative-editor-demo">
    <div class="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
      <h2 class="text-lg font-medium mb-2">Collaborative Editor Demo</h2>
      <p>
        This demo shows how multiple users can edit the same document simultaneously.
        Open this document in multiple browser windows to see it in action.
      </p>
      <p class="text-sm mt-2">Document ID: {{ documentId }}</p>
    </div>
    
    <div class="users-list mb-4 flex gap-2">
      <div 
        v-for="user in users" 
        :key="user.id" 
        class="user-badge px-3 py-1 rounded-full text-sm text-white flex items-center gap-1"
        :style="{ backgroundColor: user.color }"
      >
        <span class="w-2 h-2 rounded-full bg-white"></span>
        {{ user.name }}
      </div>
    </div>
    
    <AdvancedEditor
      v-model="editorContent"
      :editable="isEditable"
      :collaborative="true"
      :documentId="documentId"
      @submitted="handleSubmitted"
    />
  </div>
</template>

<style>
.user-joined-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease forwards;
  max-width: 300px;
}

.user-joined-toast.hide {
  animation: slideOut 0.3s ease forwards;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
</style>