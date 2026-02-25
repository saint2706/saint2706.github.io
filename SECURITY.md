# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please follow these steps:

1.  **Do not create a public issue.** Security vulnerabilities should be reported privately to prevent exploitation before a fix is available.
2.  **Email us.** Please send a detailed report to security@rishabhagrawal.com (replace with actual email if known, or leave generic for now).
3.  **Include details.** Provide as much information as possible, including:
    -   The type of vulnerability (e.g., XSS, SQL Injection).
    -   Steps to reproduce the issue.
    -   Affected versions or components.
    -   Potential impact.

## Security Features

This project implements several security features to protect users:

-   **Content Security Policy (CSP):** Strict CSP to prevent XSS and other attacks.
-   **Subresource Integrity (SRI):** Ensures external scripts (like Pyodide) are not tampered with.
-   **Input Sanitization:** User inputs are sanitized to prevent injection attacks.
-   **Rate Limiting:** AI services are rate-limited to prevent abuse.
-   **Secret Scanning:** Automated scanning for hardcoded secrets.
-   **Dependency Auditing:** Automated checks for vulnerable dependencies.

## Security Best Practices

We follow these best practices:

-   **Least Privilege:** Components only have access to the data and APIs they need.
-   **Defense in Depth:** Multiple layers of security controls.
-   **Secure Defaults:** Secure configuration by default.
-   **Regular Updates:** Keeping dependencies up to date.

Thank you for helping keep this project safe!
