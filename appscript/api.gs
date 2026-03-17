const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action || 'getTests';
  if (action === 'getTests')     return respond(getTests());
  if (action === 'getQuestions') return respond(getQuestions(e.parameter.sheet));
  return respond({ error: 'Unknown action' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = e.parameter.action;
  if (action === 'saveResponse')      return respond(saveResponse(body));
  if (action === 'saveTest')          return respond(saveTest(body));
  if (action === 'deleteTest')        return respond(deleteTest(body));
  if (action === 'saveQuestion')      return respond(saveQuestion(body));
  if (action === 'deleteQuestion')    return respond(deleteQuestion(body));
  if (action === 'getResponses')      return respond(getResponses());
  if (action === 'exportResponsesCsv') return respond(exportResponsesCsv());
  return respond({ error: 'Unknown action: ' + action });
}

// ── READ ────────────────────────────────────────────
function getTests() {
  const sheet = SS.getSheetByName('Tests');
  if (!sheet) return { tests: [] };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  return { tests: rows.slice(1).filter(r => r[0] !== '').map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))) };
}

function getQuestions(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return { questions: [], error: 'Sheet not found: ' + name };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  return { questions: rows.slice(1).filter(r => r[0] !== '').map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))) };
}

function getResponses() {
  const sheet = SS.getSheetByName('Responses');
  if (!sheet) return { responses: [] };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  return { responses: rows.slice(1).filter(r => r[0] !== '').map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))).reverse() };
}

// ── SAVE QUIZ RESPONSE ───────────────────────────────
function saveResponse(data) {
  let sheet = SS.getSheetByName('Responses');
  
  // Create sheet if it doesn't exist
  if (!sheet) sheet = SS.insertSheet('Responses');
  
  // Build answer keys from submitted data
  const answerKeys = Object.keys(data.answers || {});
  
  // Always write headers if sheet is empty OR has no data rows
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp', 'name', 'test', 'score', 'grade',
      'correct', 'wrong', 'total',
      ...answerKeys
    ]);
  }
  
  // Append the response
  sheet.appendRow([
    new Date().toISOString(),
    data.name    || '',
    data.testTitle || '',
    data.score   || '',
    data.grade   || '',
    data.correct ?? '',
    data.wrong   ?? '',
    data.total   ?? '',
    ...Object.values(data.answers || {})
  ]);
  
  return { success: true };
}

// ── TESTS CRUD ───────────────────────────────────────
function saveTest(data) {
  let sheet = SS.getSheetByName('Tests');
  if (!sheet) {
    sheet = SS.insertSheet('Tests');
    sheet.appendRow(['id','title','description','icon','sheet','duration','difficulty','color']);
  }
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const existingIdx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  const rowData = h.map(k => data[k] !== undefined ? data[k] : '');
  if (existingIdx > 0) {
    sheet.getRange(existingIdx + 1, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function deleteTest(data) {
  const sheet = SS.getSheetByName('Tests');
  if (!sheet) return { success: false, error: 'Tests sheet not found' };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const sheetCol = h.indexOf('sheet');
  const idx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  if (idx < 0) return { success: false, error: 'Test not found' };
  // Delete the questions sheet too
  const sheetName = rows[idx][sheetCol];
  const qSheet = SS.getSheetByName(sheetName);
  if (qSheet) SS.deleteSheet(qSheet);
  sheet.deleteRow(idx + 1);
  return { success: true };
}

// ── QUESTIONS CRUD ───────────────────────────────────
function saveQuestion(data) {
  const sheetName = data.sheet;
  if (!sheetName) return { success: false, error: 'No sheet name provided' };
  let sheet = SS.getSheetByName(sheetName);
  if (!sheet) {
    sheet = SS.insertSheet(sheetName);
    sheet.appendRow(['id','question','type','imageUrl','options','correct','required','ratingMin','ratingMax','ratingScale','matrixCols']);
  }
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const existingIdx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  const rowData = h.map(k => data[k] !== undefined ? data[k] : '');
  if (existingIdx > 0) {
    sheet.getRange(existingIdx + 1, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function deleteQuestion(data) {
  const sheet = SS.getSheetByName(data.sheet);
  if (!sheet) return { success: false, error: 'Sheet not found: ' + data.sheet };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const idx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  if (idx < 0) return { success: false, error: 'Question not found' };
  sheet.deleteRow(idx + 1);
  return { success: true };
}

// ── EXPORT ───────────────────────────────────────────
function exportResponsesCsv() {
  const sheet = SS.getSheetByName('Responses');
  if (!sheet) return { csv: '' };
  const rows = sheet.getDataRange().getValues();
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  return { csv };
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
