const fs = require("fs");
const path = require("path");
const gettextParser = require("gettext-parser");

const languagesDirectory = path.resolve(__dirname, "../../languages");
const sourceCatalogPath = path.join(languagesDirectory, "find-my-rep.pot");
const welshCatalogPath = path.join(languagesDirectory, "find-my-rep-cy.po");
const displayedEntryLimit = 10;

function readCatalog(catalogPath) {
  return gettextParser.po.parse(fs.readFileSync(catalogPath));
}

function getPluralFormCount(catalog) {
  const pluralForms = catalog.headers["plural-forms"] || "";
  const match = pluralForms.match(/nplurals\s*=\s*(\d+)/);

  return match ? Number(match[1]) : 2;
}

function isFuzzy(translation) {
  const flags = translation.comments && translation.comments.flag;

  return Boolean(flags && flags.split(",").some((flag) => flag.trim() === "fuzzy"));
}

function findIncompleteTranslations(sourceCatalog, translatedCatalog) {
  const pluralFormCount = getPluralFormCount(translatedCatalog);
  const incomplete = [];

  for (const [context, sourceTranslations] of Object.entries(sourceCatalog.translations)) {
    for (const [messageId, sourceTranslation] of Object.entries(sourceTranslations)) {
      if (!messageId) {
        continue;
      }

      const translation = translatedCatalog.translations[context]?.[messageId];

      if (!translation) {
        incomplete.push({ messageId, reason: "missing" });
        continue;
      }

      if (isFuzzy(translation)) {
        incomplete.push({ messageId, reason: "fuzzy" });
        continue;
      }

      const requiredForms = sourceTranslation.msgid_plural ? pluralFormCount : 1;
      const translatedForms = translation.msgstr.slice(0, requiredForms);

      if (
        translatedForms.length < requiredForms ||
        translatedForms.some((translatedForm) => !translatedForm.trim())
      ) {
        incomplete.push({ messageId, reason: "untranslated" });
      }
    }
  }

  return incomplete;
}

test("reports incomplete Welsh translations without blocking the test suite", () => {
  const sourceCatalog = readCatalog(sourceCatalogPath);
  const welshCatalog = readCatalog(welshCatalogPath);
  const incomplete = findIncompleteTranslations(sourceCatalog, welshCatalog);

  if (incomplete.length > 0) {
    const examples = incomplete
      .slice(0, displayedEntryLimit)
      .map(({ messageId, reason }) => `  - [${reason}] ${messageId}`)
      .join("\n");
    const remaining = incomplete.length - displayedEntryLimit;
    const remainder = remaining > 0 ? `\n  ...and ${remaining} more.` : "";

    process.stderr.write(
      `\nTranslation warning: ${incomplete.length} Welsh string(s) are incomplete:\n${examples}${remainder}\n\n`,
    );
  }

  expect(incomplete).toEqual(expect.any(Array));
});