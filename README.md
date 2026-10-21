# Blendomi

A responsive community app prototype built with React and Vite. The product connects communities through conversations, meetups, and local member perks.

## Develop

Requires Node.js 22.12+ (tested with 24).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

## Validate

```sh
npm run build
```

Browser smoke checks verified creating conversations, replying, joining meetups, reload persistence, saved meetups, mobile navigation, and absence of horizontal overflow at 390px.

## Current scope

- Community feed with search, sorting, likes, discussion creation, replies, and bookmarks
- Meetup discovery, local attendance state, and saved meetups
- Community discovery, member offer details, and informational dialogs
- Responsive desktop and mobile layouts
- Posts, replies, likes, attendance, and bookmarks persisted in browser localStorage

This is a local frontend demo, not a production service. Identity and community membership are seeded demo data. Authentication, real invitations, messaging, moderation, shared storage, merchant verification, and payments are not connected. Offer details are illustrative. Other communities support interest registration for the current session; full content is available for University of Jordan.

Images are extracted from the supplied Blendomi UI reference and bundled locally. Confirm image rights before publication.
