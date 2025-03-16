# Google Sheets to Slack Image Automation

## Overview

This project automates the process of exporting a Google Sheet as a PDF, converting it to PNG using the Cloudmersive API, and uploading it to Slack. The script is designed to run on Google Apps Script and can be scheduled for automatic execution.

## Features

- **Export Google Sheets to PDF** – Automatically generates a PDF from a specific Google Sheet.
- **Convert PDF to PNG** – Uses the Cloudmersive API for high-quality image conversion.
- **Upload PNG to Slack** – Uploads the generated image to a Slack channel.
- **Scheduled Execution** – Can be set to run automatically at a specific time.
- **Secure Credentials Handling** – Uses the Google Apps Script Properties Service to store API keys securely.

## Prerequisites

1. **Google Sheet** – The source sheet containing the data to be exported.
2. **Cloudmersive API Key** – Required for PDF-to-PNG conversion. Get it from [Cloudmersive](https://www.cloudmersive.com). ****[800 Free API calls on Cloudmersive per month]****
3. **Slack API Token** – Needed to upload images to Slack. Get it from [Slack API](https://api.slack.com/apps).
4. **Google Apps Script Access** – The script runs inside Google Apps Script linked to Google Drive.

## Setup Instructions

### 1. Store API Keys Securely
Instead of hardcoding sensitive data, store them in Google Apps Script Properties:

1. Open the Google Apps Script editor (`Extensions` > `Apps Script`).
2. Navigate to `Project Settings` > `Script Properties`.
3. Add the following keys:
   - `CLOUDMERSIVE_API_KEY`
   - `SLACK_API_TOKEN`
   - `SLACK_CHANNEL_ID`
   - `SHEET_ID`

### 2. Deploy the Script

To use the Slack external link feature, the script needs to be deployed:

1. Click **Deploy** > **New Deployment** in the Apps Script editor.
2. Select **"Web app"** as the deployment type.
3. Set **Who has access** to **Anyone** (or your specific workspace users).
4. Copy the deployment URL (needed for Slack integration).

### 3. Set Up a Trigger for Automation

To run the script automatically at any period:

1. Open `Triggers` in Apps Script (`Edit` > `Current project's triggers`).
2. Click **"Add Trigger"**.
3. Select `googleSheetToSlack` function.
4. Choose **Time-driven** > **Any Period** >
5. Save the trigger.

### 4. Slack API Permissions

**Ensure your Slack app has the following permissions:**
 
channels:read

chat:write

files:read

files:write

groups:read

remote_files:write

## How It Works

1. **Exports Google Sheet to PDF** – The script fetches data from a specific Google Sheet and exports it to a PDF file.
2. **Converts PDF to PNG** – The PDF is sent to Cloudmersive for conversion.
3. **Uploads PNG to Slack** – The converted PNG is uploaded to Slack and shared in the specified channel.
4. **Scheduled Execution** – The script runs at specific time if triggers are set.

## Troubleshooting

- **Permission Denied (Slack)** – Ensure your bot has the correct scopes in the Slack API dashboard.
- **Cloudmersive API Errors** – Check your API key usage limits.
- **Script Not Running Automatically** – Ensure the trigger is correctly configured.

## License

This project is open-source and available under the MIT License.
