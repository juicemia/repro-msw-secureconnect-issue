# MSW and http.ClientRequest Issue Reproduction

It looks like there's an issue where MSW mocks something that's preventing
`secureConnect` events from firing. This repo reproduces the issue as closely
as possible with as few other dependencies as possible. Originally this was
found through debugging an issue with the Stripe SDK's API calls hanging in
an environment that was also running a Mock JWKS with `mock-jwks`. I took the
relevant HTTP client code from the Stripe SDK for this test, and I just created
a simple mock using `msw`.

## How To Use This

```
pnpm i
pnpm test
```
