import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageNode from '@/components/shared/advancedEditor/blocks/imageNode/ImageNode.vue';

export const ResizableImage =  Node.create({
  name: 'resizableImage',
  
  group: 'block',
  
  inline: false,
  
  draggable: true,
  
  // This ensures proper serialization
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: '',
      },
      size: {
        default: '100',
      },
      position: {
        default: 'center',
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    }
  },
  
  parseHTML() {
    return [
      {
        // Match the wrapper div as the main node
        tag: 'div.resizable-image-wrapper',
        getAttrs: node => {
          // Extract size and position from class names
          const classNames = node.getAttribute('class') || '';
          
          // Parse size (25, 50, 75, 100)
          const sizeMatch = /image-(\d+)/.exec(classNames);
          const size = sizeMatch ? sizeMatch[1] : '100';
          
          // Parse position (left, center, right)
          const positionMatch = /position-(left|center|right)/.exec(classNames);
          const position = positionMatch ? positionMatch[1] : 'center';
          
          // Find the img element inside div
          const img = node.querySelector('img');
          
          if (img) {
            return {
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              title: img.getAttribute('title'),
              size,
              position,
            };
          }
          
          return null;
        },
        // Parse the content from this node (img and p)
        contentElement: 'div.resizable-image-wrapper',
      },
      {
        // Also handle plain img tags for backward compatibility
        tag: 'img[src]',
        getAttrs: node => ({
          src: node.getAttribute('src'),
          alt: node.getAttribute('alt'),
          title: node.getAttribute('title'),
          size: '100',
          position: 'center',
        }),
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, size, position, ...rest } = HTMLAttributes;
    
    // Create wrapper classes
    const wrapperClass = `resizable-image-wrapper shadow rounded image-${size} position-${position}`;
    
    // Create img attributes
    const imgAttrs = {
      src,
      alt,
      title,
    };
    
    // Clean up any null or undefined values
    Object.keys(imgAttrs).forEach(key => {
      if (imgAttrs[key] === undefined || imgAttrs[key] === null) {
        delete imgAttrs[key];
      }
    });
    
    // Return HTML structure matching the Vue component's template
    return [
      'div', 
      { class: wrapperClass },
      ['img', imgAttrs],
      ['p', { class: 'text-center' }, title || ''],
    ];
  },
  
  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
  
  addNodeView() {
    return VueNodeViewRenderer(ImageNode);
  },
});
export default ResizableImage;
