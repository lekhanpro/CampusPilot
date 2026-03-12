# Security Policy

## Supported Versions

Security fixes are provided for the latest `master` branch.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report privately by emailing the maintainer and include:
- Description of the issue
- Reproduction details
- Potential impact
- Suggested remediation (if available)

You will receive an acknowledgement within 72 hours.

## Secrets and Credentials

- Never commit API keys, service account keys, or `.env*` files.
- Use Vercel/Firebase environment configuration for secrets.
- Rotate credentials immediately if exposure is suspected.
