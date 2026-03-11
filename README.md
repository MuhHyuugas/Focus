# Focus – ADHD Medication Management App

Focus is a mobile application designed to help people with ADHD manage their medication, track symptoms and maintain treatment consistency.

The project was developed as part of a **Software Engineering course** in the Computer Engineering program at the Federal University of Sergipe (UFS).  
It was built collaboratively in a **team development environment**, following software engineering practices and architectural design principles.

## Features

- Medication reminders
- Dose logging
- Symptom tracking
- Treatment monitoring
- Offline-first data storage
- Data synchronization with cloud database
- Reports and treatment history

## Tech Stack

- React Native
- SQLite (local storage)
- MySQL (cloud database)
- Flask API
- AWS RDS
- REST APIs

## Architecture

The system follows **MVVM combined with Clean Architecture principles**.

The mobile application works with an **offline-first approach**, storing data locally using SQLite and synchronizing with a remote MySQL database hosted on AWS RDS.

This architecture allows the application to function even without internet access while ensuring that data can later be synchronized with the cloud backend.

## Database Design

The database architecture for this project was **fully designed as part of the development process**.

Two databases are used:

- **SQLite** – local database used by the mobile application for offline storage
- **MySQL** – cloud database hosted on AWS RDS for centralized data storage and synchronization

The relational schema was designed to support:

- medication management
- dose logging
- reminders and schedules
- symptom tracking
- user profiles
- treatment history

Special attention was given to **relational modeling, data consistency and synchronization between local and remote databases**.

## Key Contributions

My contributions to the project included:

- Designing the relational database schema
- Implementing the **MySQL cloud database**
- Creating the **SQLite local database** for the offline-first architecture
- Developing backend APIs using **Flask**
- Integrating the mobile application with backend services
- Supporting the system architecture design

## Learning Goals

This project was developed to explore and apply concepts such as:

- database modeling
- mobile application architecture
- API integration
- offline-first system design
- software engineering practices
- collaborative development

## Future Improvements

- synchronization optimization
- analytics dashboard
- improved data visualization
- integration with healthcare professionals for treatment monitoring
