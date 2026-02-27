To-Do List Application

A modern and responsive To-Do List web application built using HTML, CSS, and Vanilla JavaScript.

This project demonstrates strong frontend fundamentals including DOM manipulation, state management, data-driven rendering, and LocalStorage persistence — all without using any external frameworks or libraries.

📌 Project Overview

The To-Do List application allows users to manage daily tasks efficiently.
Users can add, edit, delete, and filter tasks, with all data stored locally in the browser.

The interface is designed with a clean, modern layout featuring smooth animations and a scroll-contained task list for better scalability.

🚀 Features

Add new tasks

Edit existing tasks

Delete tasks

Mark tasks as complete/incomplete

Filter tasks (All / Active / Completed)

LocalStorage persistence (data remains after refresh)

Scrollable task container

Responsive design (mobile-friendly)

Smooth hover effects and transitions

🛠 Technologies Used

HTML5

CSS3

JavaScript (ES6)

LocalStorage API

⚙️ How It Works

The application uses a centralized todos array as the main state.

When a task is added, edited, deleted, or marked complete, the state array is updated.

The UI is re-rendered dynamically based on the updated state.

All tasks are saved to the browser’s LocalStorage.

When the page loads, saved tasks are retrieved and displayed automatically.

This ensures a clean data-driven approach instead of directly manipulating DOM visibility.

📂 Project Structure
todo-list/
│
├── index.html
├── style.css
├── script.js
└── README.md

▶ How to Run the Project
Method 1: Open Directly

Download or clone the repository.

Open the project folder.

Double-click index.html.

The application will open in your browser.

No installation or setup is required.

Method 2: Using Live Server (Recommended)

Open the project folder in VS Code.

Install the Live Server extension.

Right-click on index.html.

Click "Open with Live Server".

🎯 Learning Concepts

This project demonstrates:

DOM manipulation

Event handling

State management using arrays

Data-driven rendering

LocalStorage usage

Responsive layout design

UI scalability and scroll containment

📌 Purpose

This project is built as a portfolio-ready frontend application to showcase core JavaScript and UI development skills without relying on frameworks.