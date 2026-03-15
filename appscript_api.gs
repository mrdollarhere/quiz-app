const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action || 'getTests';
  if (action === 'getTests')     return respond(getTests());
  if (action === 'getQuestions') return respond(getQuestions(e.parameter.sheet));
  return respond({ error: 'Unknown action' });
}

function doPost(e) {
  return respond(saveResponse(JSON.parse(e.postData.contents)));
}

function getTests() {
  const sheet = SS.getSheetByName('Tests');
  if (!sheet) return { tests: [] };
  const rows = sheet.getDataRange().getValues();
  const h = rows[0];
  return {
    tests: rows.slice(1)
      .filter(r => r[0] !== '')
      .map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
  };
}

function getQuestions(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return { questions: [], error: 'Sheet not found: ' + name };
  const rows = sheet.getDataRange().getValues();
  const h = rows[0];
  return {
    questions: rows.slice(1)
      .filter(r => r[0] !== '')
      .map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
  };
}

function saveResponse(data) {
  let sheet = SS.getSheetByName('Responses');
  if (!sheet) sheet = SS.insertSheet('Responses');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp', 'name', 'test', 'score', 'grade',
      'correct', 'wrong', 'total',
      ...Object.keys(data.answers)
    ]);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.name      || '',
    data.testTitle || '',
    data.score     || '',
    data.grade     || '',
    data.correct   ?? '',
    data.wrong     ?? '',
    data.total     ?? '',
    ...Object.values(data.answers)
  ]);

  return { success: true };
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
