# gotcha

A non-obvious pitfall or trap, learned the hard way.

## localStorage can throw (rather than return null) in private-mode Safari

What: localStorage can throw (rather than return null) in private-mode Safari · Why: the persistence layer needs an in-memory fallback to stay resilient · Where: src/persistence/storage.ts <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-10 -->
