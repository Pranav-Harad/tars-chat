# Tars Full Stack Engineer  
## Internship Coding Challenge 2026 – Using AI-Assisted Tools Allowed

---

## 💡 Overview

Build a **real-time live chat messaging web app** using:

- **Next.js (App Router)**
- **TypeScript**
- **Convex** (backend, database, real-time)
- **Clerk** (authentication)
- **Tailwind CSS** (for styling)

Users should be able to:

- Sign up and log in
- Discover other users
- Message them in real time

After completing the app, briefly explain your code in a **video presentation**.

---

## 🚧 AI-Assisted Development Tools

Use of AI-assisted tools such as:

- Cursor  
- Claude Code  
- Windsurf  
- GitHub Copilot  
- Codex  
- etc.

✅ **Allowed**

However:

- You **must understand every line of code** you submit.
- You will be asked to explain your implementation during the interview.
- If you choose **not to use AI tools**, that is completely fine.
- You will **not be assessed** based on whether you used AI tools.

If you prefer manual coding without AI assistance, complete the separate assignment:

> **Tars Full Stack Engineer Internship Coding Challenge 2026 – Manual Coding Only (NO AI-Assistance)**

Both versions are judged equally. Choose one and follow its rules strictly.

---

## 🛠 Tech Stack (Required)

You must use:

- **Next.js (App Router)**
- **TypeScript**
- **Convex** (backend, database, real-time)
- **Clerk** (authentication)

For styling:

- Use **Tailwind CSS**
- You may use a Tailwind-based component library:
  - shadcn/ui (recommended)
  - Radix UI
  - Headless UI
  - Plain Tailwind

Convex, Clerk, and Vercel all have generous free tiers — no cost to you.

---

# 📌 Functional Requirements

Implement features in the following order. Each builds on the previous one.

You may implement them differently if you have a better solution — the descriptions are suggestions.

---

## 1️⃣ Authentication

- Set up Clerk:
  - Sign up (email or social login)
  - Log in
  - Log out
- Display logged-in user's:
  - Name
  - Avatar
- Store user profiles in Convex so other users can discover them.

---

## 2️⃣ User List & Search

- Show all registered users (excluding yourself).
- Add a search bar:
  - Filters users by name in real time.
- Clicking a user:
  - Opens or creates a conversation with them.

---

## 3️⃣ One-on-One Direct Messages

- Private conversations between users.
- Messages must update in real time using Convex subscriptions.
- Sidebar should list:
  - All conversations
  - Preview of most recent message

---

## 4️⃣ Message Timestamps

Format timestamps as follows:

- Today's messages → `2:34 PM`
- Older messages (same year) → `Feb 15, 2:34 PM`
- Different year → `Feb 15, 2025, 2:34 PM`

---

## 5️⃣ Empty States

Display helpful UI messages when:

- No conversations exist
- No messages in a conversation
- No search results

Avoid blank screens.

---

## 6️⃣ Responsive Layout

### Desktop:
- Sidebar + Chat area side-by-side

### Mobile:
- Conversation list is default view
- Tapping a conversation opens full-screen chat
- Include a back button

Use Tailwind responsive breakpoints.

---

## 7️⃣ Online / Offline Status

- Show green indicator next to users who have the app open.
- Update status in real time when:
  - Users come online
  - Users go offline

---

## 8️⃣ Typing Indicator

- Show:
  - `"Alex is typing..."`  
  OR
  - A pulsing dots animation
- Disappear after:
  - ~2 seconds of inactivity
  - Or when message is sent

---

## 9️⃣ Unread Message Count

- Show unread badge in sidebar for each conversation.
- Clear badge when:
  - User opens that conversation.
- Update in real time.

---

## 🔟 Smart Auto-Scroll

- Automatically scroll to latest message when new messages arrive.
- If user has scrolled up:
  - Do NOT force-scroll.
  - Show `"↓ New messages"` button instead.

---

# ⭐ Optional Features (If Time Permits)

---

## 11️⃣ Delete Own Messages (Soft Delete)

- Users can delete messages they sent.
- Show:
  > *This message was deleted*
- Do not remove record from Convex (soft delete).

---

## 12️⃣ Message Reactions

Allow reactions:

- 👍
- ❤️
- 😂
- 😮
- 😢

- Clicking same reaction again removes it.
- Show reaction counts below message.

---

## 13️⃣ Loading & Error States

- Show skeleton loaders or spinners while loading.
- If message fails to send:
  - Show error
  - Provide retry option
- Handle network/service errors gracefully.

---

## 14️⃣ Group Chat

- Users can create group conversations.
- Select multiple members.
- Give the group a name.
- All members see messages in real time.
- Sidebar should show:
  - Group name
  - Member count

---

# 🎥 Final Deliverable

1. Completed web app using the required tech stack.
2. A short video explaining:
   - Architecture
   - Database schema
   - Real-time implementation
   - Key decisions you made
   - Any challenges faced

---

Good luck 🚀