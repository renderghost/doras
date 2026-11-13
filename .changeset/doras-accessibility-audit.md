---
'@doras/components': minor
'@doras/specs': minor
---

The accessibility audit (#19). Link has a `standalone` prop that gives a link on its own a 44px target; Provider link always sets it. The skip link and the error summary's links are 44px targets too. In forced colours, a chosen radio card uses the system's selection colours. Specs can record screen reader results under `accessibility.screenReaderResults`, and each docs page shows them.
