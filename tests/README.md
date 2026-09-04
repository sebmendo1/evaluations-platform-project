# Tests

One file per spec, numbered to match [`../specs`](../specs). Spec `07 §How to use
these specs` requires that every `GIVEN/WHEN/THEN` block become a test, so each
test name quotes the criterion it covers and cites its section.

```bash
npm test
```

Coverage is deliberately uneven. The specs contain 60 acceptance checkboxes and 19
`GIVEN/WHEN/THEN` blocks, and a meaningful share of them are organizational
sign-offs or need real reviewers rather than assertions. The conformance matrix in
[`../specs/CONFORMANCE.md`](../specs/CONFORMANCE.md) records which are covered
here, which are partial, and which are deferred with a reason.

Everything under test is a pure function. Contracts that `02 · Contracts` assigns
to a write path or a storage layer are implemented as guarded constructors that
throw, because this prototype has no backend — the tests assert the throw, which
is the closest a client-only build gets to a database constraint.
