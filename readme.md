# onix-i

TillWhen's codebase


## TODOS

- Make UI component creation consistent (uses goober, cn, internal classes,
  there's no consistency)
- Get rid of the `withAuth` implementation , and move all auth based pages to
  use `withLoginRedirect` instead.
- Make controller functions consitent

## Environment

```sh
# MAILER Buffer.from(JSON.stringify({
#  ...nodemailerOptions
# })).toString("base64")
MAILER=
# While the mailer env is required, it is not used locally

# A crypto string to generate JWT Tokens
JWT_SECRET=

# The URL of the app, generally the domain you host this whole thing on
ORIGIN_URL=

# Slack Signing secret is using the slack integrations
# Slack CLIENT ID secret is using the slack integrations
# Slack CLIENT SECRET secret is using the slack integrations
# Register a slack app for these details
SLACK_SIGNING_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```
