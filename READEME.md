# MENN Stack Hybrid Rendering Benchmark

This is an experimental project developed for university Seminar course (**IE213 - Web System Development Techniques**). 

The primary purpose of this project is to explore, implement, and compare different web rendering patterns (**CSR, SSR, SSG, and ISR**) using a modified **MENN Stack** (MongoDB, Express, Next.js, Node.js). 

---

## 🪐 Project Overview

The project is structured as a straightforward monorepo divided into two main parts:

* **Backend (`/backend`):** A lightweight Node.js & Express server tied to MongoDB. It handles basic user authentication, article management, and acts as the data provider.
* **Frontend (`/frontend`):** A Next.js application containing dedicated routes configured under different rendering strategies (such as client-side rendering under `/csr` and incremental static regeneration under `/isr`). This allows us to observe and benchmark rendering variations in real-time.