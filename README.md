<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=8b5cf6&height=250&section=header&text=Pranverse&fontSize=70&fontColor=ffffff&animation=twinkling&desc=Real-Time%20Live%20Chat%20Application&descAlignY=75&descAlign=62" />

  **A modern, hyper-responsive, and beautifully animated real-time chat application.**

  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
    <a href="https://convex.dev/"><img src="https://img.shields.io/badge/Convex-FF7043?style=for-the-badge&logo=convex&logoColor=white" alt="Convex"></a>
    <a href="https://clerk.dev/"><img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth"></a>
  </p>
</div>

---

## 🚀 About Pranverse

**Pranverse** is a fully-featured, production-ready real-time chat application. Designed with a focus on **stunning UI/UX**, fluid animations, and absolute reliability. It supports direct messaging, group chats, typing indicators, read receipts, and much more, all wrapped in a sleek Light and Dark mode interface.

## ✨ Key Features

*   **⚡ Real-Time Messaging**: Instant message delivery powered by Convex backend.
*   **👥 Group Chats**: Create groups, add multiple members, and chat seamlessly.
*   **👀 Read Receipts**: WhatsApp-style double-tick read receipts to know exactly when your messages are seen.
*   **💬 Typing Indicators**: See who is typing in real-time with beautiful animated bouncing dots.
*   **❤️ Live Reactions**: React to messages with emojis. Strictly one reaction per user.
*   **🔔 Global Notifications**: In-app toast notifications, browser push notifications, and satisfying custom audio beeps for new messages.
*   **🔐 Secure Authentication**: Handled seamlessly by Clerk (Google, Email, etc.) including profile picture management.
*   **🎨 Premium UI/UX**: Built with Tailwind CSS and Shadcn UI. Features glassmorphism, animated ambient background orbs, and pixel-perfect layouts.
*   **📱 Fully Responsive**: Flawless experience across desktop, tablet, and mobile devices (with dynamic sliding sidebars on mobile).
*   **🌗 Dark / Light Mode**: Total theme support with Next-Themes.

---

## 🛠️ Tech Stack & Architecture

Pranverse leverages a modern, serverless architecture to ensure high performance and zero maintenance:

| Technology | Role | Description |
| :--- | :--- | :--- |
| **[Next.js 15](https://nextjs.org/)** | Frontend Framework | React Server Components, App Router, optimized rendering. |
| **[Convex](https://convex.dev/)** | Backend As A Service | Real-time database, automatic reactive state, serverless functions. |
| **[Clerk](https://clerk.com/)** | Authentication | Comprehensive user management and secure authentication flows. |
| **[Tailwind CSS 4](https://tailwindcss.com/)** | Styling | Utility-first CSS framework for rapid UI development. |
| **[Shadcn UI](https://ui.shadcn.com/)** | Components | Beautifully designed, accessible, and customizable React components. |

---

## 📁 Project Structure

```text
📁 tars-chat/
├── 📁 convex/                # Convex Backend (Database schemas, Queries, Mutations)
│   ├── auth.config.ts        # Clerk integration mapping
│   ├── schema.ts             # Database Schema Definition
│   ├── users.ts              # User Sync & Presence Logic
│   ├── conversations.ts      # Conversation & Group Chat Logic
│   └── messages.ts           # Messaging, Reactions, & Typing Indicators
├── 📁 src/
│   ├── 📁 app/               # Next.js 14 App Router
│   │   ├── 📁 chat/          # Main Chat UI Layout & Routing
│   │   ├── layout.tsx        # Root layout (Providers, Notifications)
│   │   └── page.tsx          # Landing / Sign-in Page
│   └── 📁 components/        # React Components
│       ├── ChatArea.tsx      # Core Messaging Component
│       ├── Sidebar.tsx       # Conversation List & User Search
│       ├── PushNotifications.tsx # Global Notification Listener
│       └── 📁 ui/            # Shadcn UI primitives
└── 📄 package.json           # Dependencies
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Pranav-Harad/tars-chat.git
cd tars-chat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add your keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Convex Deployment
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### 4. Run the development server
You need to run both the Next.js frontend and the Convex backend simultaneously:

Open **Terminal 1** (Frontend):
```bash
npm run dev
```

Open **Terminal 2** (Backend):
```bash
npx convex dev
```

Visit `http://localhost:3000` in your browser.

---

## Author 👨‍💻
Made with ❤️ by **Pranav**  
📧 Email: [pranavharad64@gmail.com](mailto:pranavharad64@gmail.com)  
🔗 LinkedIn: [www.linkedin.com/in/pranav-harad-667070268](https://www.linkedin.com/in/pranav-harad-667070268)

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=8b5cf6&height=100&section=footer" />
</div>
