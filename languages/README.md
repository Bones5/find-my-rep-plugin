# Translation guide

The canonical list of strings for translators is `find-my-rep.pot`. It includes
the plugin's PHP, block editor, and public form strings, source references, plural
forms, and notes for placeholders.

## Welsh translation

1. Open `find-my-rep.pot` in Poedit or another gettext editor.
2. Create a Welsh (`cy`) translation.
3. Save the catalog as `find-my-rep-cy.po` in this directory.
4. Run `npm run i18n:json` to compile the MO and JavaScript catalogs.
5. Set the WordPress site language to Cymraeg and verify the block editor,
   public form, validation errors, success screen, and email status messages.

Do not translate variable values such as names, postcodes, email addresses,
constituencies, wards, councils, police force areas, or political party names.
Keep printf placeholders such as `%s`, `%d`, `%1$s`, and `%2$d` unchanged, though
their order may be changed using the numbered forms. Keep
`{{representative_name}}` and `{{representative_title}}` unchanged because they
are replaced when each letter is sent.

Run `npm run i18n:pot` whenever source strings change. Run `npm run i18n:json`
after updating any PO file so WordPress can load translations for JavaScript.