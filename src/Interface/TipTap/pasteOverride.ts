import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

function handlePaste(editor, view, event, slice) {
   if (!event.clipboardData) {
      return false
   }
   const items = event.clipboardData.items

   for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') === 0) {
         const file = item.getAsFile()
         if (!file) {
            continue
         }

         const reader = new FileReader()
         reader.onload = (readerEvent) => {
            const base64data = readerEvent?.target?.result
            if (base64data) {
               editor
                  .chain()
                  .focus()
                  .setImage({ src: base64data as string })
                  .run()
            }
         }
         reader.readAsDataURL(file)
         return true // We've handled the paste event.
      }
   }

   // If no image was handled, let Tiptap handle the rest.
   return false
}

export const CustomPasteHandler = Extension.create({
   name: 'customPasteHandler',
   addProseMirrorPlugins() {
      return [
         new Plugin({
            key: new PluginKey('eventHandler'),
            props: {
               handlePaste: (view, event, slice) => {
                  return handlePaste(this.editor, view, event, slice)
               },
            },
         }),
      ]
   },
})
