// Exclude from static export - primarily for Swagger routes
module.exports = {
  // These regexes are used to identify which routes should NOT be included in the static export
  api: {
    bodyParsed: {
      sizeLimit: '5mb'
    },
    externalResolver: true,
    regions: 'auto',
    bypassPreflight: false,
    excludeFromExport: [
      '/api/swagger',
      '/api/docs',
      '/api-docs'
    ]
  }
};
