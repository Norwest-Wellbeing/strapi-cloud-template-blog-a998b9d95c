// src/admin/app.tsx  (or .js)
import CKEditorField from "@ckeditor/strapi-plugin-ckeditor/admin/ckeditor"; // path exported by the plugin

export default {
  /**
   * This runs after the Strapi admin has booted.
   * We tell Strapi: “whenever you see a field of type 'wysiwyg',
   * render it with CKEditor instead of the built‑in editor”.
   */
  bootstrap(app) {
    app.addFields({
      type: "wysiwyg", // <── the builtin field we’re hijacking
      Component: CKEditorField,
    });
  },
};
