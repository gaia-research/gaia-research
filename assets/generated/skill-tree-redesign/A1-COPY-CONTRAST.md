# Arbor and Hell plate composition

Use the Arbor still at 35% opacity inside the graph's existing scene frame. Fit it to that frame with its aspect ratio intact. Use the 900 × 1200 derivative in the stacked phone layout. The paper, ink and red signal are part of the Hell plate.

## Keep the copy clear of the scene

The approved Home board puts the desktop scene clip at 45% of the container. At intermediate widths, a 500 px copy column can extend into the scene. The copy must keep a 1 rem gap from that clip on desktop. At 860 px and below, the scene sits below the copy.

The review fixture enforces this at the copy wrapper. This preserves the scene's existing frame, crop and position. The padding formula uses the prototype's 1320 px maximum wrapper width and normal inline padding.

```css
@container atlas (width > 860px) {
  .hero[data-w="arbor"] .hero-copy {
    padding-inline-end: max(
      clamp(1rem, 4cqi, 3rem),
      calc(55cqi - max(0px, (100cqi - 1320px) / 2) + 1rem)
    );
  }
}
```

## Review evidence

Chromium measured the copy-to-scene gap at 210 widths from 320 to 1920 px with 16, 20 and 24 px root font sizes. At 16 px root size, the measured desktop gap was at least 15.98 px. The 35% Hell plate on charcoal reproduced the contrast failure with the rule off. With the rule on, sampled contrast was at least 14.14:1 for bone on charcoal and 15.18:1 for native Hell ink on paper. The proof uses the submitted WebP bytes and includes the fixture, test code, hashes, before-and-after captures and measured results. [Private contrast proof](https://drive.google.com/file/d/16iYOW0eaoZwRdmsAcKSgYe5_BzzbrFBo/view)

Proof archive SHA-256 `5ff1961ad99ea234cb77a7f51fa99fdc451df599567e2eba5e357ef2a1b1b711`.
