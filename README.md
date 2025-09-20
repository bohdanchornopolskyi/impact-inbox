# 📬 ImpacInbox — Drag & Drop Email Builder SaaS

**ImpacInbox** is a powerful and intuitive SaaS platform that lets users design beautiful, responsive email templates through a drag-and-drop builder. With built-in contact list management, campaign tools, and a public marketplace for templates, ImpacInbox empowers users to create, send, and manage impactful email campaigns — all from one place.

## 🚀 Features

- 🔧 **Drag & Drop Email Builder**  
  Build responsive email templates using a component-based interface — text blocks, lists, buttons, links, images, and more.

- 📁 **Template Management**  
  Save personal templates, browse public templates, and even buy or sell templates in the marketplace.

- 👥 **Contact Lists & Audience Segmentation**  
  Create and manage contact lists for targeted email campaigns.

- 📤 **Email Campaigns**  
  Send newsletters and campaign emails to your audiences. (Powered by [Resend](https://resend.com) and optionally [react-email](https://react.email))

- 🧩 **Public Marketplace**  
  Browse, share, and monetize professionally designed email templates.

- 💳 **Subscription Plans**  
  Pricing tiers based on number of clients, templates, and monthly email sends.

## 🏗️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend & Database**: [Convex](https://www.convex.dev/)
- **Authentication**: Convex Auth
- **File Storage**: Convex File Storage
- **Email Sending**: [Resend](https://resend.com) (planned)
- **Email Rendering**: [react-email](https://react.email) (optional)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.dev/)

## 🧠 AI Instructions

This app should support:

- Component selection and styling inside the drag-and-drop email builder.
- Contact management with tagging and segmentation.
- Email campaign creation using templates and selected contacts.
- Dynamic rendering of templates via react-email (optional).
- Integration with Resend for sending emails.
- Public and private template storage with pricing control (free, paid).
- Tiered subscription logic based on usage (contacts, templates, emails/month).

## 📦 Project Structure (suggested)

- `/app`: Next.js app directory
- `/components`: Shared and builder-specific components (drag blocks, style controls, etc.)
- `/lib`: Convex client helpers, auth utils, subscription logic
- `/convex`: Convex schema and functions (auth, templates, contacts, campaigns)
- `/emails`: Template definitions (react-email)

## 🗓 Roadmap Highlights

- [x] Authentication and authorization
- [ ] MVP of drag-and-drop builder
- [ ] Contact import and list features
- [ ] Email campaign UI and backend logic
- [ ] Resend integration
- [ ] Public template marketplace
- [ ] Subscription billing and usage limits

## 💡 Inspiration

ImpacInbox is built for creators, marketers, and businesses that want powerful email capabilities without the usual complexity. Whether you're sending a weekly newsletter or launching a full campaign, ImpacInbox gives you the tools to do it beautifully and efficiently.

## Future Tasks

- [ ] Add drag-to-edit input for number fields
