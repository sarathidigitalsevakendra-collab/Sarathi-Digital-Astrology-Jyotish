# Phase-2 PDF Export Implementation Plan

**Branch:** `feature/pdf-export-phase1` (Phase-1 + Phase-2 combined)  
**Goal:** Production safety and mobile optimization

---

## Phase-2 Scope

### ✅ Implemented
- [x] Enforce `MAX_PDF_PAGES` (50) in `exportReportAsPdf`
- [x] Unit test for page limit
- [ ] Memory-aware quality scaling (deviceMemory API)
- [ ] Mobile-specific html2canvas options (Safari workarounds)

### Deferred to Phase-3
- Canvas size limit enforcement (MAX_CANVAS_SIZE_BYTES)
- Server-side PDF generation
- Custom font embedding
- PDF/A compliance
- Advanced options UI (page size, quality) - optional

---

All Phase-2 changes are additive and do not modify approved Phase-1 behavior.
