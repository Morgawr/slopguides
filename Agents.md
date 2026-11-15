# Project Goal

The goal of this project is to provide a comprehensive, succint, spoiler-free
guide and walkthrough experience to the player reading it. Each guide and page
**MUST** be written with the assumption that the player will be regularly
visiting it as they play through the game and their knowledge and awareness of
the game improves over time.

## Unbreakable Operational Foundations

The following repository rules **MUST NOT** be broken at any time, unless
**explicitly** instructed to do so by the user:

- Any reference, resource, website, blog, article, video, page, and media element used for the creation of any guide **MUST** be recorded in the appropriate credits section
- Before obtaining and embedding any media element (image) in the repository, make sure the image does not **explicitly** forbid its usage by third parties. If so, avoid using it.
- You can use youtube videos and other video-related media format for research purposes, but **NEVER** embed or directly link to them in the main guide pages (it's okay in credits when necessary)
- Do not **EVER** generate images or art ("genAI"). Avoid using AI generated art from sourced websites if possible.

## Spoiler policy

Avoid spoilers as much as possible. If something is not directly relevant to
information required by the player at the time of reading that information, do
not include it. If certain names or selections are unavoidable spoilers (like
certain names or dialogue choices in VNs), use spoiler tags that the player has
to manually click on to reveal.

General names of places and characters are not spoilers **UNLESS**:

 - The name of the place reveals something about it that is relevant to a story
   event ("The fall of Rome", "Post-crash Airship", etc)
 - Locations the player would not expect to visit by just reading a synopsis of
   the game's setting ("The Moon" in Final Fantasy 4)
 - The name of the character in question appears in a recruitable section of the
   guide (builds, etc) or is in reference to it, and the character is not a
   commonly known recruitable character as part of the promotional material
   (like Magus in Chrono Trigger)
 - Any character that is supposed to die (or dies for real) in the game and then
   comes back in the story. After coming back, that character's name is a
   spoiler.

If the title of a chapter or quest (side or main) refers to a major story event
("The death of Aerith"), it should be considered a spoiler.

## Language note

Assume the player will be playing the game in Japanese despite consulting an
English guide. Whenever referring to items, gear, skills, location, names, etc
you should favor the Japanese name over the English. Whenever possible, add a
toggleable "Japanese/English" button in the web page (remember the user choice
and make it a floating button that follows the page so the player can toggle it
whenever they want) and when doing so, the contents of the page should change to
reflect that choice.

If you are using JP/EN toggle buttons or alternative language tooltips, NEVER
use both languages in the same entry ("Support / 支援" <- bad)

Example:

EN -> "Use the spell Holy to attack the Dragon Lord"
JP -> "Use the spell ホリー to attack the 竜王"

Avoid using parenthesis to provide alternative-language translation for words.
Use tooltips and JP/EN swap javascript toggles instead.

## Directory Structure

The repository structure contains a "games/" folder and "index.html" file.

The games folder contains a series of sub-directories, one for each game that
has a generated guide.

The index.html contains the landing page. The landing page's sole purpose is to
provide a list of game guides that users can browse and be directed to.

Inside each game's guide directory, you should have:

 - index.html - Introduction to the game's guide, with relevant links to
   specific guide portions as separate pages
 - css/ - a folder containing the styles used for that game's specific guide.
   Each game guide should have its own unique CSS style that matches the game
 - js/ - a folder containing reusable/modular javascript utilities for that
   specific guide's rendering. Use this sparingly
 - credits.html - This page contains **every** credited piece of information or
   source used in the creation of the guide, as per unbreakable operational
   foundation rules
 - various .html pages for each section of the guide

## Guide Style

Each guide is fundamentally built to provide step-by-step instructions and
checklists for players as they go through the game. Each game is different, and
so can be the required contents of each guide.

When looking up guides, favor starting from the relevant GameFAQs section of
said game, but be careful of game version differences (remakes, remasters, etc)

In general, each guide should have:

 - An introduction/brief explanation of the game and guide format, including
   macro sections for things contained in the guide. Keep details light. This
   goes in the index page of each game guide independently
 - A missables section. If the missables list is short, it can be added directly
   in the index page. If not, have a separate page explicitly for missables. If
   the missables list is long and spread into multiple sections ("equipment",
   "skills", "recruitable members", "achievements", etc) then have each of them
   as separate pages and use the "missables" page to link to them.
 - A "beginners tips" page containing a simple list of common beginner advice.
 - A "step-by-step" chronological order of operation. This is the ideal order of
   playing for the player. It should tell the player exactly which sections of
   the guide to read at which point, what prerequisites need to be met before
   reading certain sections or doing certain things ("X quest unlocks in chapter
   4", "this item is only obtainable after chapter 6", etc). Keep this as its
   own separate page.
 - Collectable items should have their own independent pages, multiple ones if
   there's multiple collectible categories (materials, mini medals, stellazio,
   shiny stones, etc). Things like "getting every item in the game" or "getting
   every weapon" or similar should not be considered collectables UNLESS there
   is a specific achievement for doing it.
 - If the game has customizable party members, characters, and "builds", each
   character should have their own section containing the most common/ideal/meta
   builds as acknowledged by the broader community. If there are multiple builds
   depending on the situation, or playing style, you don't need to put all of
   them, just put the 3-4 most common ones. If the community says "there is no
   best build", **YOU** must make that choice with the information provided.
   Even if a build is not perfect or "best", if it's good and does not have any
   major fuckups, use that.  Refer to the Build Page Style Guide section for
   build-specific formatting style.
 - If the game contains quests, have a specific page that contains ONLY the main
   story quest (spoiler free) with clear instructions on where to go, who to
   talk with, what items to collect, etc as the game story develops. During this
   main quest section, have direct links to side quests **as soon as they become
   available** in their own side-quest page. Consider some players want to only
   play the main story, while some want to do everything in order by doing all
   side quests before continuing with the main story
 - Have a page with **all** the side quests in order of unlock, each of them
   should be anchored and linkable/shareable from other pages (like the main
   quest page)
 - If the game has major side quests or side-events, or general non-main quests
   that span multiple chapters and major parts of the plot, put them in their
   own separate page. Still make each portion of them linkable and shareable
 - Additional pages and sections specifically requested by the user upon guide
   creation
 - **EVERY SINGLE** completable thing in the game **MUST** have a checkbox that
   the player can click to "remember" if they have done that or not. These
   checkboxes will be stored in localstorage for that web page in the player's
   browser. Examples: side quest done, achievement obtained, mini-medal
   collected, story chapter cleared, etc. At the top of each page containing
   "checkable" elements there should be a live update-able counter telling the
   player how much completion % and amount they have done ("80% of side quests
   done", "45/99 mini medals collected", etc)
 - If the game has a branching storyline (visual novels), have each "route" in a
   separate page, documenting each individual choice necessary. Prioritize
   reaching max CG completion with the least amount of route repetition as
   possible (if an A/B choice has A have the same outcome as B but with an extra
   CG, favor A).
 - If a visual novel has a "true route" or "canon route", explicitly mark it as
   such. If some routes have pre-requisites in other routes, prioritize marking
   the other routes first and provide an ideal play order.

Also: **APPLY COMMON SENSE**, if a section is important for a specific game,
even if it's not listed in these instructions, you should consider adding it.

### Build Page Style Guide

When writing a build for a character (both party members and side characters)
favor a step-by-step approach. Assume the player will start with zero knowledge
or awareness of the game, and they don't need to know specific game mechanics.
Give them the straight operational facts ("Put X points into skill Y").

Each build should have a short explanation in the beginning providing a
reasoning for why the build is chosen and what makes it good, and a very
distinctly clear separation for the "todo" checklist of things needed to achieve
that build.

If the build has different "stages" for different parts of the game, they should
be listed in order with clear deadlines and targets/goals ("Use X until level
20, then use Y until level 30", etc).

Always add a quick-reference table that the player can consult "at a glance" to
see which items or skills are required (include checkboxes for each of them so
the player can "tick them off" when achieved).

## Game Mechanics

Each game guide should have a standard game mechanics explanation for the
standard "manual-like" breakdown of systems, without going in too many details
for obvious stuff ("How do HPs work?" etc).

If a game has tricky mechanics or things that can be exploited that the
community is aware of and often talks about ("Deathblow training" in Xenogears,
Stat raising in lockstep in Xenosaga 1, etc) they should have their own section,
or even their own separate page if too long.

## Exploits and Tricks

If the game has exploitable parts or tricks ("Infinite mob spawn XP autogrind",
"Easy money making by buying -> crafting -> reselling items", etc) there should
be a page explaining them including how and when to do them.

## Layout and Formatting

Try to keep a layout and style similar to "prima" guides.

Do not repeat the title of the game in every page when providing general
descriptions. Assume the reader already understands what each page does from
just reading the title.

Each major section, topic, and page should have a few natural-sounding words
that act as an introductory paragraph. This is NOT a subtitle nor a list of
buzzwords or keywords. An introductory paragraph is a pleasant, nice to read,
human-like written excerpt explaining the contents of the section it describes.
It should focus on **WHY** the reader should care about the contents of that
section and provide an informative and pleasant to read breakdown on how to use
that section. Things to look out for, things to checkbox, other pages or
sections that section interacts with, etc.

Prefer using a "Tables of Contents" accessible list at the beginning of each
page if said page contains multiple separate sections.

When possible, make use of actual images from the game (store them locally in a
resources folder unique for each game) to describe certain parts (location of
items, enemies, collectables, etc).

If the game makes use of unique icons for skills, items, etc and you are able to
access the icons (from community wikis, etc), try to reference them and embed
them in the text as much as possible whenever those skills/items are
referenced to make it easier to read.

For each game, apply a style/layout/CSS/color scheme that matches the vibes of
that specific game. You can do this by looking at screenshots of the game (sites
like vndb can help for visual novels specifically) and try to match the color
palette, UI layout (rounded vs square style, floaty vs fixed, etc) of the
in-game menus, and also the font choices as closely as possible. Do not just
assume a style based on the game's name, you MUST look at screenshots to make an
informed choice.

In case of visual novels, you should add a picture of each character/heroine in
the page related to that character's individual route. You can usually find
those pictures from the vndb page for that VN.

Do NOT use "callout boxes" (labels with a left-border accent). Ever.

Do not use "pills" or labels with a separate background color/text style in the
middle of titles or actual text.

Use common design language. Assume the reader is able to navigate a web page and
click buttons/labels. Apply a "show don't tell" principle, do not use verbose
labels and over-explanations for the UI and sections. Favor using tooltips and
on-hover effects rather than filling the page with explanations.

Do not describe the contents of a page or section with verbose subtitles.

If you describe something, **ALWAYS** describe what **is**, never what **isn't**:
Good: "Attack the enemy to win"
Bad: "Not attacking the enemy will lead to defeat"

Avoid using common basic gemini colors as standard palette. Try to be creative
and use unique colors and styles for each game. Do not use blue-accented pages
or pages with blue-first principles **UNLESS** the game itself uses a lot of
blue.

Avoid using tables, especially if they are being used to contain long sequences
of text or multi-step sequences. Keep table usage for item lists, skills, quick
view cards, or short summary sections.

Favor using separate, well-spaced, distinct paragraphs (and optional header
sections) when listing things like side-quests or other long-form topics.

Prefer using bulleted point checklists for step-by-step instructions (recipes,
quests, etc)

Make sure embedded images are resized and contained properly in the page and do
not break the layout or go outside of the borders of the page. If an image is
supposed to be viewed from a larger embed (like a detailed map, etc), add a
"click to zoom" feature or pop-up so users can focus on its details without
breaking the page layout.

## Anti AI "slop" language

The following are unbreakable language style rules:

Use direct, unambiguous, non-emphatic, straight forward language. Your target
audience is a no-bullshit player that just wants to know facts. They don't need
encouragement or hype or to relate emotionally with the text. Avoid using
exclamation marks and fancy titles unless quoting verbatim the game (quest
names, etc).

- Do not use emoji
- Do not use em-dashes

Never write prose explaining how the website's own UI works. Do not tell the
reader that checkboxes save to localStorage, that a floating button swaps
between Japanese and English, that terms have hover tooltips, that spoiler
blocks reveal on click, or that checkboxes sync across pages. Keep all
introductory and section text focused strictly on the game itself.

Avoid:
- Negation-first reveal ("It is not a wrong answer. It is a non-answer")
- Significance designation (It is the leg that answers the actual question.")
- Abstraction agency ("Median hides it." "The table shows it.")
- Deferred noun ("Five of those six rows are one cluster. The sixth is not.")
- Coy or thesis-shaped header ("What 'exhausted' means" "The one gap that does clear the bar")
- Aphoristic closer ("It is the kind of number that looks like evidence and is not")
- Straw-man knockdown ("'It thinks twice as long' is the obvious reading, and it is wrong.)
- Fragment cadence ("Six legs. One GPU, one server build, one sampler, one question set")
- Dressed metaphor ("That is information loss wearing the costume of a style fix")
- Label-first framing ("X: Y")

Avoid sentences that are split by colons unless you're making a list. Do not use
semi-colons to excessively break down sentences or "steps".
