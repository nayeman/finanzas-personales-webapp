module.exports = [
  {
    ignores: ["node_modules/", "dist/"]
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        console: "readonly",
        SpreadsheetApp: "readonly",
        Spreadsheet: "readonly",
        Sheet: "readonly",
        Range: "readonly",
        Logger: "readonly",
        Utilities: "readonly",
        Session: "readonly",
        PropertiesService: "readonly",
        CacheService: "readonly",
        LockService: "readonly",
        UrlFetchApp: "readonly",
        HtmlService: "readonly",
        DriveApp: "readonly",
        DocumentApp: "readonly",
        FormApp: "readonly",
        SlidesApp: "readonly",
        MailApp: "readonly",
        ScriptApp: "readonly",
        Browser: "readonly",
        CalendarApp: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "smart"]
    }
  }
];
