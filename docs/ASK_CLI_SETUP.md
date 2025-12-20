# ASK CLI Setup Guide

This guide explains how to set up the Alexa Skills Kit CLI (ASK CLI) for automated skill deployment.

## Prerequisites

- [ASK CLI v2](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-intro.html) installed locally (for initial setup)
- Amazon Developer Account

## Initial Setup (Local Machine)

### 1. Install ASK CLI

```bash
npm install -g ask-cli
```

### 2. Initialize ASK CLI

Run the initialization command to authenticate:

```bash
ask configure
```

This will:
- Open a browser for Amazon login
- Generate OAuth tokens
- Create `~/.ask/cli_config` with your credentials
- Link your Amazon Developer account

### 3. Get Your Vendor ID

Your vendor ID is needed for GitHub Secrets. Find it by running:

```bash
ask api list-vendors
```

Or from the ASK CLI config:

```bash
cat ~/.ask/cli_config | grep vendor_id
```

### 4. Get OAuth Tokens

After running `ask configure`, get your tokens from:

```bash
cat ~/.ask/cli_config
```

Look for:
- `access_token`
- `refresh_token`

## GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Alexa Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `ASK_ACCESS_TOKEN` | OAuth access token | From `~/.ask/cli_config` after running `ask configure` |
| `ASK_REFRESH_TOKEN` | OAuth refresh token | From `~/.ask/cli_config` after running `ask configure` |
| `ASK_VENDOR_ID` | Amazon Developer vendor ID | Run `ask api list-vendors` or check `~/.ask/cli_config` |
| `ASK_SKILL_ID` | Skill ID (optional for first deployment) | Leave empty for first deployment, then update with skill ID from output |

### Existing AWS Secrets (Already Configured)

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `OPENAI_API_KEY`

## First Deployment

### Option 1: Create Skill via GitHub Actions

1. Set up all GitHub Secrets except `ASK_SKILL_ID` (leave it empty)
2. Push to `main` branch
3. GitHub Actions will:
   - Deploy Lambda via Terraform
   - Create a new Alexa skill via ASK CLI
   - Output the skill ID in the logs
4. Copy the skill ID from the logs and add it as `ASK_SKILL_ID` secret

### Option 2: Create Skill Locally First

1. Run local deployment to create the skill:
   ```bash
   ask deploy
   ```
2. Get the skill ID from the output or from `.ask/ask-states.json`
3. Add `ASK_SKILL_ID` to GitHub Secrets
4. Push to `main` for automated deployments

## Subsequent Deployments

Once `ASK_SKILL_ID` is configured, every push to `main` will:
1. Deploy/update Lambda function via Terraform
2. Capture the Lambda ARN
3. Update skill manifest with the Lambda ARN
4. Deploy/update the Alexa skill via ASK CLI

## Troubleshooting

### Token Expiration

If you see authentication errors:
1. Run `ask configure` locally to refresh tokens
2. Update `ASK_ACCESS_TOKEN` and `ASK_REFRESH_TOKEN` in GitHub Secrets

### Skill Not Found

If ASK CLI can't find the skill:
- Verify `ASK_SKILL_ID` is set correctly
- Check that the skill exists in your [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)

### Permission Denied

Ensure your Amazon Developer Account has:
- Accepted all terms and agreements
- Verified email address
- Proper permissions for the skill

## Manual Commands

### Deploy skill manually:
```bash
ask deploy
```

### Deploy only skill metadata (no Lambda):
```bash
ask deploy --target skill-metadata
```

### Get skill status:
```bash
ask api get-skill-status --skill-id <your-skill-id>
```

### List all your skills:
```bash
ask api list-skills
```

## Security Notes

- **Never commit** `~/.ask/cli_config` or OAuth tokens to version control
- Tokens in GitHub Secrets are encrypted and only accessible during workflow runs
- Consider rotating tokens periodically for security
- ASK CLI tokens can be revoked from your Amazon account settings
