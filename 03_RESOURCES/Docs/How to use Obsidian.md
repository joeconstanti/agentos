---
id: 20260205054600
type: note
status: draft
created: 2026-02-05 05:46
tags:
  - docs
  - guides
  - resources
area: docs
---
# Basic Guide

Obsidian is a local-first note-taking app where your vault is just a folder of Markdown files on disk.


> [!BUG] Don't modify settings, hotkeys or plugins
> It will change globally for all users.


## 1) Start with a vault
- A vault is a normal folder (your notes are plain `.md` files).
- Create/open a vault, then keep folders simple and based on how you think (projects, areas, resources, archive).

## 2) Capture notes quickly
- Create a new note and give it a clear, searchable title.
- Use headings (`#`, `##`) to structure long notes.
- Keep one idea per note when possible.

## 3) Link notes together
- Use wikilinks like `[[Note Name]]` to connect notes.
- Link specific sections with `[[Note Name#Heading]]`.
- Obsidian automatically shows backlinks, so relationships are easy to navigate.

## 4) Use tags and properties
- Use tags for broad grouping (example: `#project`, `#idea`).
- Use note properties (frontmatter) for metadata like `status`, `created`, `area`, etc.

## 5) Find information fast
- Use Quick Switcher to jump to notes quickly.
- Use search for vault-wide lookup and in-note lookup.
- Use starred/bookmarked notes for important reference pages.

# Custom Hotkeys

## UI and Workspace
<span style="color: yellow;">CMD + [ </span>  -  Toggle left sidebar
<span style="color: yellow;">CMD + ] </span>  -  Toggle right sidebar
<span style="color: yellow;">OPTION + P </span>  -  Pin / unpin active tab
<span style="color: yellow;">CMD + H </span>  -  Open home tab
<span style="color: yellow;">CMD + \ </span>  -  Toggle focus mode

## The Graph
<span style="color: yellow;">CMD + G </span>  -  Open graph view
<span style="color: yellow;">CMD + SHIFT + G </span>  -  Animate graph view

## Navigation and Search
<span style="color: yellow;">CMD + SHIFT + O </span>  -  Open Quick Switcher
<span style="color: yellow;">CMD + O </span>  -  Open Switcher++ (standard mode)
<span style="color: yellow;">CMD + SHIFT + F </span>  -  Open Omnisearch (vault-wide)
<span style="color: yellow;">OPTION + SPACE </span>  -  Open Omnisearch (vault-wide)
<span style="color: yellow;">OPTION + SHIFT + F </span>  -  Open global search pane
<span style="color: yellow;">CMD + F </span>  -  Open Omnisearch in current file
<span style="color: yellow;">CMD + R </span>  -  Open recent files
<span style="color: yellow;">OPTION + B </span>  -  Open bookmarks
<span style="color: yellow;">OPTION + SHIFT + B </span>  -  Bookmark current view

## Editing and Note Actions
<span style="color: yellow;">CMD + SHIFT + S </span>  -  Toggle source / reading mode
<span style="color: yellow;">OPTION + UP </span>  -  Move current line up
<span style="color: yellow;">OPTION + DOWN </span>  -  Move current line down
<span style="color: yellow;">OPTION + T </span>  -  Open Templater insert modal
<span style="color: yellow;">CMD + N </span>  -  Create new note / file

## Web
<span style="color: yellow;">CMD + ENTER </span>  -  Open / search Web Viewer
<span style="color: yellow;">CMD + SHIFT + ENTER </span>  -  Save web page to vault

## Terminal and Power Commands
<span style="color: yellow;">CTRL + C </span>  -  Clear terminal output
<span style="color: yellow;">CTRL + ' </span>  -  Open integrated terminal at vault root
<span style="color: yellow;">CTRL + SHIFT + ` </span>  -  Focus last terminal
<span style="color: yellow;">CMD + SHIFT + ' </span>  -  Focus last terminal

## Super Hotkeys
<span style="color: yellow;">OPTION + CTRL + CMD + SHIFT + M </span>  -  Move / rename file
<span style="color: yellow;">OPTION + CTRL + CMD + SHIFT + BACKSPACE </span>  -  Delete active file

---