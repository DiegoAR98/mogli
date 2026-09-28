# Asset licensing

Everything under `public/game/` and in the private sibling repo `mogli-art-src` (graphics, audio,
fonts and level data) is **not** covered by the MIT `LICENSE` in this repository.

- Original assets (art, audio, level data authored for Seeonee) are (c) Diego Araujo 2026, all
  rights reserved.
- Third-party assets remain under their own licenses, listed per-asset in `CREDITS.md` and, once
  vendor license text is collected, under `public/licenses/`.
- Rudyard Kipling's quotations used in storybook cards are in the public domain in the United
  States, the European Union, the United Kingdom and Brazil; they are not claimed under this or
  any other license.
- The PT-BR translations and every UI string in `src/i18n/` are (c) Diego Araujo 2026 and are
  licensed with the code under the MIT `LICENSE`, as stated in a header comment in both
  dictionary files once they exist.

You may not redistribute the non-MIT assets outside this repository's build without the
permissions those licenses grant.

See `docs/DECISIONS.md` D14, D78-D82 for the reasoning and the license-preference order (CC0,
then CC-BY, then custom itch.io licenses copied verbatim, then OFL fonts; never CC-BY-SA, GPL
art, NC or ND).
