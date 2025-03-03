# Collaborative Editor Extensions

This module provides real-time collaboration features for TipTap editors. It enables multiple users to edit the same document simultaneously with cursor positions and selections visible to all participants.

## Features

- Real-time document synchronization
- Cursor and selection tracking
- User identification with unique colors
- Automatic conflict resolution
- Connection error handling and retry mechanism
- Debounced updates to minimize network traffic

## Usage

### Basic Setup

```js
import { useEditor } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Collaboration } from './path/to/colab/Collaboration';
import { Cursors } from './path/to/colab/Cursor';

const editor = useEditor({
  content: '<p>Hello World</p>',
  extensions: [
    Document,
    Paragraph,
    Text,
    // Include the collaboration extension with a unique document ID
    Collaboration.configure({
      documentId: 123, // Document ID to collaborate on
      debounce: 150,   // How often to send updates (ms)
    }),
    // Include the cursor extension for showing remote cursors
    Cursors,
  ],
});
```

### Integration Example

To implement collaborative editing in a component:

```vue
<template>
  <div class="editor-wrapper">
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Collaboration } from '@/functions/editor/colab/Collaboration';
import { Cursors } from '@/functions/editor/colab/Cursor';
import { onUnmounted } from 'vue';
import { useUserStore } from '@/store/user.js';

const props = defineProps({
  documentId: {
    type: [Number, String],
    required: true
  },
  initialContent: {
    type: Object,
    default: () => ({ type: 'doc', content: [{ type: 'paragraph' }] })
  }
});

const userStore = useUserStore();

const editor = useEditor({
  content: props.initialContent,
  extensions: [
    Document,
    Paragraph,
    Text,
    // Add other TipTap extensions as needed
    
    // Configure collaboration
    Collaboration.configure({
      documentId: props.documentId,
      debounce: 150, // 150ms debounce
    }),
    
    // Add cursor support
    Cursors.configure({
      labelDuration: 2000, // Show cursor labels for 2 seconds
    }),
  ],
  autofocus: 'end',
});

// Clean up editor on component unmount
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
.editor-wrapper {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1rem;
}
</style>
```

## Backend Configuration

1. Ensure you have enabled Laravel broadcasting and configured a driver like Pusher or Laravel Echo Server.

2. Make sure your `channels.php` file includes the collaboration channel authorization:

```php
// in channels.php
BroadcastCustom::getInstance()->channel('collaboration.*', function (User $user, $documentId) {
    // Add your authorization logic here
    return $user->toArray();
});
```

3. Make sure the API endpoint is defined in your routes file:

```php
// in api.php
Route::post('/collaboration/{document}', function ($document) {
    EditorCollabEvent::dispatch(request()->all(), $document);
    return response()->noContent();
});
```

## Events

The collaboration works through Laravel broadcasting. When a user makes changes to the document, the following happens:

1. Changes are transformed into steps using ProseMirror's collaborative editing schema.
2. Steps are sent to the server via API call.
3. The server broadcasts these steps to all other connected users.
4. Other users' editors apply these steps to their local documents.

## Customization

You can customize various aspects of the collaboration:

### Collaboration Extension Options

```js
Collaboration.configure({
  documentId: 123,       // Required: Document ID to collaborate on
  debounce: 150,         // Optional: Debounce time for sending updates (ms)
  maxRetries: 5,         // Optional: Maximum number of retries for failed requests
  retryDelay: 300        // Optional: Base delay between retries (ms)
})
```

### Cursor Extension Options

```js
Cursors.configure({
  cursorClass: 'custom-cursor',      // Optional: CSS class for cursor
  selectionClass: 'custom-selection', // Optional: CSS class for selection
  labelDuration: 2000                // Optional: How long to show user labels (ms)
})
```

## Styling Cursors

The cursor extension automatically adds basic styles for cursors and selections, but you can customize them with CSS:

```css
/* Custom cursor appearance */
.collaboration-cursor {
  /* Customize cursor appearance */
}

.collaboration-cursor-label {
  /* Customize cursor label appearance */
}

.collaboration-selection {
  /* Customize selection highlighting */
}
```

## Troubleshooting

If collaboration isn't working properly:

1. Check browser console for errors
2. Verify that your broadcasting setup is working
3. Ensure all users have proper authorization to the collaboration channel
4. Check network requests to see if updates are being sent properly
5. Verify that all users are using the same document ID