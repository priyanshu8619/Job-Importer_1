# Job-Importer

A real-time dashboard for managing and tracking high-volume XML job feed imports. This system uses a message queue architecture to decouple processing from the user interface, ensuring responsiveness and reliability.

## 🚀 Key Features

* **Queue-Based Processing:** Uses **BullMQ & Redis** to handle imports in the background, preventing server timeouts on large feeds.
* **Real-time Updates:** **Socket.IO** pushes live progress (Processing → Completed) to the client without page refreshes.
* **Smart Deduplication:** Implements **MongoDB Upsert (BulkWrite)** logic to update existing jobs and insert new ones efficiently, preventing duplicate entries.
* **Import History:** Tracks every execution with detailed stats (New vs. Updated counts) and pagination.

## 🛠️ Tech Stack

* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** MongoDB (Atlas)
* **Queue:** Redis (BullMQ)
* **Real-time:** Socket.IO (WebSockets)

---

## ⚙️ Setup & Installation

### 1. Prerequisites
* Node.js (v18+)
* MongoDB Instance (Atlas)
* Redis Instance (Cloud)

### 2. Clone Repository
```bash
git clone (https://github.com/priyanshu8619/Job-Importer_1)
cd job-import-manager

Completed these points --
Matching Logic -- Clean, modular code with good naming and abstraction 
Queue Processing & Retry -- Concurrency, Redis queue usage, job status tracking
MongoDB Design & Upsert Logic -- Avoid duplication, efficiently handle updates
Import History -- Clear tracking, filtering, pagination 
Docs & Architecture -- Architecture.md and README.md clarity and depth 
