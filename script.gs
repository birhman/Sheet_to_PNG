function googleSheetToSlack() {
  try {
    var sheetName = 'YOUR_SHEET_NAME';             // If you want a specific sheet from whole spreadsheet  
    var sheetId = 'YOUR_GOOGLE_SHEET_ID';  

    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) throw new Error('Sheet with name "' + sheetName + '" not found.');

    var pdfBlob = exportSheetToPdf(sheetId, sheet.getSheetId());

    var pdfFileName = 'Sheet_Report.pdf';
    var pdfFile = DriveApp.createFile(pdfBlob).setName(pdfFileName);

    var pngFile = sendPdfToCloudmersive(pdfFile);
    uploadToSlack(pngFile);

  } catch (error) {
    Logger.log('Error: ' + error.message);
  }
}

function exportSheetToPdf(sheetId, gid) {
  var url = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=pdf' +
    '&gid=' + gid +
    '&size=A4' +
    '&portrait=true' +
    '&fitw=true' +
    '&scale=4' +
    '&top_margin=0.25' +
    '&bottom_margin=0.25' +
    '&left_margin=0.15' +
    '&right_margin=0.15' +
    '&horizontal_alignment=CENTER';

  var options = {
    'method': 'get',
    'headers': { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() }
  };

  return UrlFetchApp.fetch(url, options).getBlob().setName('Sheet_Report.pdf');
}

function sendPdfToCloudmersive(pdfFile) {
  var cloudmersiveApiKey = 'YOUR_CLOUDMERSIVE_API_KEY';  
  var cloudmersiveUrl = 'https://api.cloudmersive.com/convert/pdf/to/png';

  var options = {
    'method': 'post',
    'headers': { 'Apikey': cloudmersiveApiKey },
    'payload': { 'file': pdfFile.getBlob() }
  };

  var jsonResponse = JSON.parse(UrlFetchApp.fetch(cloudmersiveUrl, options).getContentText());

  if (!jsonResponse.PngResultPages || jsonResponse.PngResultPages.length === 0) {
    throw new Error('No PNG files returned from Cloudmersive.');
  }

  var pngUrl = jsonResponse.PngResultPages[0].URL;
  var pngBlob = UrlFetchApp.fetch(pngUrl).getBlob().setName('Sheet_Report.png');
  return DriveApp.createFile(pngBlob);
}

function uploadToSlack(pngFile) {
  var slackToken = 'YOUR_SLACK_BOT_TOKEN';  //xoxb-.......
  var slackUploadUrl = 'https://slack.com/api/files.getUploadURLExternal';

  var slackResponseData = JSON.parse(UrlFetchApp.fetch(slackUploadUrl, {
    'method': 'post',
    'payload': {
      'token': slackToken,
      'filename': pngFile.getName(),
      'length': pngFile.getSize().toString()
    }
  }).getContentText());

  if (!slackResponseData.ok) throw new Error('Error getting Slack upload URL: ' + slackResponseData.error);

  var uploadUrl = slackResponseData.upload_url;
  var fileId = slackResponseData.file_id;

  var fileUploadResponse = UrlFetchApp.fetch(uploadUrl, {
    'method': 'post',
    'contentType': 'application/octet-stream',
    'payload': pngFile.getBlob().getBytes()
  });

  if (!fileUploadResponse.getContentText().startsWith("OK")) {
    throw new Error('Error uploading file to Slack');
  }

  var completeUploadResponse = UrlFetchApp.fetch('https://slack.com/api/files.completeUploadExternal', {
    'method': 'post',
    'headers': { 'Content-Type': 'application/x-www-form-urlencoded' },
    'payload': {
      'token': slackToken,
      'files': JSON.stringify([{ 'id': fileId, 'title': pngFile.getName() }]),
      'channel': 'YOUR_SLACK_CHANNEL_ID' 
    }
  });

  var completeUploadData = JSON.parse(completeUploadResponse.getContentText());
  if (!completeUploadData.ok) throw new Error('Error in completing Slack upload: ' + completeUploadData.error);

  Logger.log('File successfully uploaded and shared in Slack!');

  var postMessageResponse = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    'method': 'post',
    'headers': { 'Content-Type': 'application/json' },
    'payload': JSON.stringify({
      'token': slackToken,
      'channel': 'YOUR_SLACK_CHANNEL_ID',
      'text': 'Here is the daily report:',
      'attachments': JSON.stringify([{ "title": "Sheet Report", "title_link": pngFile.getUrl(), "text": "Click to view the report" }])
    })
  });

  var postMessageData = JSON.parse(postMessageResponse.getContentText());
  if (!postMessageData.ok) throw new Error('Error posting Slack message: ' + postMessageData.error);

  Logger.log('Message posted successfully to Slack!');
}
