// src/admin/app.tsx   (works in .js too)

// ⬇︎ this component is exported by the plug‑in; it renders one editor instance
import CKEditorField from "@_sh/strapi-plugin-ckeditor/admin/ckeditor";

export default {
  /**
   * Runs once Strapi Admin boots.
   * We tell Strapi: “whenever you see a field of *type* `wysiwyg`,
   * render it with CKEditor instead of the built‑in editor”.
   */
  bootstrap(app) {
    app.addFields({
      type: "wysiwyg", // the builtin field we’re hijacking
      Component: CKEditorField, // CKEditor’s React component
    });
  },
};
