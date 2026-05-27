# UTM Taxonomy — selfpublishingstudio.live

Conventions for tagging inbound links to the landing page so traffic is
cleanly attributed in Fathom Analytics.

Fathom auto-captures `utm_source`, `utm_medium`, and `utm_content` on the
landing pageview — no extra code needed. It reads them off the URL that
loads the LP, so these only apply to links whose destination is
`selfpublishingstudio.live`.

## Parameters

We use three params (no `utm_campaign` — there's a single promotion running):

- **`utm_source`** — the specific platform the link lives on (`kit`, `x`, `linkedin`).
- **`utm_medium`** — the channel *category* (`email`, `social`, `product`). Lets you roll multiple sources into one group and disambiguate a source that spans channels (e.g. Substack newsletter vs Substack Note).
- **`utm_content`** — a slug identifying the individual email / post / placement. Optional; add it when you want per-item breakdowns.

## Channel grid

| Channel | `utm_source` | `utm_medium` | `utm_content` |
|---|---|---|---|
| Kit | `kit` | `email` | slug |
| LinkedIn | `linkedin` | `social` | slug |
| X | `x` | `social` | slug |
| Substack (newsletter) | `substack` | `email` | slug |
| Substack (posts/notes) | `substack` | `social` | slug |
| YouTube | `youtube` | `social` | slug |
| Web app | `webapp` | `product` | slug |

## Slug taxonomy (`utm_content`)

Pattern: **`{angle}_{detail}`** — angle = the persuasion hook, detail = the
specific topic. Lowercase, snake_case, short.

| Angle prefix | Use for | Example slugs |
|---|---|---|
| `obj_` | objection-handling ("yeah but…") | `obj_notawriter`, `obj_notime`, `obj_price`, `obj_aidoesit` |
| `fomo_` | urgency / scarcity | `fomo_cartclose`, `fomo_priceup`, `fomo_bonusexpiry`, `fomo_seatsleft` |
| `proof_` | social proof / testimonials | `proof_studentwin`, `proof_casestudy` |
| `val_` | value / outcome / benefit | `val_buildbiz`, `val_14days` |
| `story_` | narrative / founder angle | `story_cole`, `story_dickie` |

`obj_` and `fomo_` are the core two; the rest are optional extensions —
drop any you won't use.

## Rules

- **Lowercase, no spaces.** Use `_` to separate words. Fathom treats `Social`
  and `social` as different values.
- **Reuse the same values.** Always `social`, never `Social`/`sm`. Always
  `notawriter`, never `not_a_writer` one time and `nonwriter` the next.
- **One angle per piece of content.** If a post does two things, pick the
  dominant one.
- **Slugs are platform-agnostic.** The same `fomo_cartclose` can run on X,
  Kit, and YouTube — `utm_source` keeps them separate.
- **Don't tag internal LP navigation.** UTMs are for attributing the entry
  point; tagging links between LP sections overwrites the original source.

## Example URLs

```
https://selfpublishingstudio.live/?utm_source=kit&utm_medium=email&utm_content=fomo_cartclose
https://selfpublishingstudio.live/?utm_source=x&utm_medium=social&utm_content=obj_notawriter
https://selfpublishingstudio.live/?utm_source=substack&utm_medium=email&utm_content=val_buildbiz
https://selfpublishingstudio.live/?utm_source=substack&utm_medium=social&utm_content=proof_studentwin
https://selfpublishingstudio.live/?utm_source=youtube&utm_medium=social&utm_content=proof_studentwin
https://selfpublishingstudio.live/?utm_source=webapp&utm_medium=product
```

## Reading it in Fathom

- Filter by **`utm_medium`** → channel roll-ups (all email vs all social vs product).
- Filter by **`utm_source`** → individual platforms (X vs LinkedIn vs …).
- Filter by **`utm_content`** → individual posts/emails, or compare angle
  prefixes (do `fomo_` links out-convert `obj_`?).

## Notes & limitations

- **UTMs don't carry across hops.** Fathom on the LP only sees the params on
  the link that loads the LP. Traffic that goes `social → web app → LP` is
  attributed to `webapp` at the LP; the social origin lives in the web app's
  own analytics unless the web app forwards it.
- **Email is measured at two layers.** Kit's dashboard owns open/click rates
  per send; Fathom owns what email traffic does *on the LP* (visits, scroll,
  CTA clicks) when filtered to `utm_medium=email`.
- **Purchases happen on SamCart**, which Fathom can't see. Fathom measures up
  to the CTA click; final-sale attribution would require forwarding UTMs to
  the SamCart checkout URL.
