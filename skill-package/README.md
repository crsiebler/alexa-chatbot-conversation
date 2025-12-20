# Configuration Templates

This directory contains template files that need to be updated with your actual values.

## skill.json

**Required Updates:**

1. **Lambda ARN** (line 33): Replace `arn:aws:lambda:us-east-1:123456789012:function:alexa-chatbot-conversation` with your actual Lambda function ARN
   - Get this from running `./scripts/setup-aws.sh` or from AWS Lambda console

2. **Privacy Policy URL** (line 48): Replace `https://example.com/privacy.html` with your actual privacy policy URL
   - Required for skill certification
   - Can host on GitHub Pages or your own domain

3. **Terms of Use URL** (line 49): Replace `https://example.com/terms.html` with your actual terms of use URL
   - Required for skill certification
   - Can host on GitHub Pages or your own domain

## Quick Update Example

After running the setup script, you'll see output like:
```
Lambda Function ARN: arn:aws:lambda:us-east-1:987654321098:function:alexa-chatbot-conversation
```

Update line 33 in skill.json with this ARN value.
