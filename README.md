# 🛡️ Snapchat Data Export Viewer

#### _NOTE: This was created using AI. It was intended for personal use, but the code is available incase you wish to modify and fix any existing bugs._

A privacy-first web application designed to help you securely visualize and explore your Snapchat data exports. 

By leveraging client-side processing, this application reads and parses your Snapchat `.zip` export directly within your web browser. **Your data is never uploaded to any external servers**, ensuring complete privacy and security.

## ✨ Features

* **100% Local Processing:** All data extraction and visualization happens in your browser.
* **Instant Visualization:** Quickly browse through your chats, snap history, friends list, and account data.
* **Responsive Design:** A beautiful, dark-themed UI built with Tailwind CSS and Shadcn UI that works on both desktop and mobile.
* **Client-Side Routing:** Fast and seamless page navigation using `wouter`.

## 🛠️ Tech Stack

* **Frontend Framework:** React 18
* **Build Tool:** Vite
* **Routing:** Wouter
* **Styling:** Tailwind CSS + tw-animate-css
* **Components:** Radix UI / Shadcn UI
* **Deployment:** GitHub Actions + GitHub Pages (Node.js 24 environment)

## 🚀 Getting Started (Local Development)

To run this project locally, you will need to set up the development environment and obtain your own Snapchat data export to test with.

### 1. Prerequisites

* **Node.js**: Ensure you have Node.js installed (v20 or v24 recommended).
* **Git**: Required to clone the repository.
* **Snapchat Data Export**: You need a `.zip` export of your Snapchat account.
  > **How to get your data:** Open the Snapchat app > Go to Settings ⚙️ > Scroll down to **My Data** > Follow the prompts to request your data. You will receive an email with a `.zip` file (typically named `mydata_~.zip`). **Do not extract this file**; the application is designed to read the raw `.zip` directly.

### 2. Installation

Open your terminal and run the following commands:

```bash
# Clone the repository
git clone [https://github.com/your-username/Snapchat-Data-Export-Viewer.git](https://github.com/your-username/Snapchat-Data-Export-Viewer.git)

# Navigate into the project directory
cd Snapchat-Data-Export-Viewer

# Install project dependencies
npm install

# Start the local Vite development server
npm run dev
