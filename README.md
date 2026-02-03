# Fire Brigade Management System

## 📋 Application Overview

The **Fire Brigade Management System** is a comprehensive web-based application designed to streamline and optimize fire station operations. This system provides role-based modules for different personnel, enabling efficient management of emergency responses, inventory, inspections, donations, and reporting.

### Key Features
- **Real-time Emergency Management** - Instant emergency mode activation with live incident tracking
- **Inventory Management** - Comprehensive tracking of equipment across 15+ categories
- **Vehicle & Resource Assignment** - Smart allocation of vehicles and equipment for emergency responses
- **Inspection System** - Automated equipment inspection scheduling and tracking
- **Donation Management** - Track and manage community donations
- **Report Generation** - Automated PDF report generation for various operations
- **Multi-role Support** - Different modules for Station Officers, Firefighters, Admins, and more

### Technology Stack
- **Frontend**: React.js with Vite, React Router, Context API
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io
- **PDF Generation**: jsPDF
- **Styling**: CSS3 with custom styling

---

## 👨‍🚒 Station Officer Module

**My Role & Module**: Station Officer

The Station Officer module is the operational heart of the Fire Brigade Management System, providing comprehensive tools for managing day-to-day station operations, emergency responses, and resource allocation.

### 🎯 Core Responsibilities

As a Station Officer, the system empowers you to:
- Manage and coordinate emergency responses
- Oversee inventory and equipment readiness
- Conduct and track equipment inspections
- Assign vehicles and resources to incidents
- Generate operational reports
- Manage community donations

---

## 🚀 Features & Functionalities

### 1. **Emergency Response Management**
- **Emergency Mode Activation**: One-click emergency mode toggle that alerts the entire system
- **Real-time Incident Tracking**: Live updates on active incidents with Socket.io integration
- **Incident Assignment**: Assign firefighters, vehicles, and equipment to specific incidents
- **Emergency Banner**: Visual alerts across all pages when emergency mode is active
- **Quick Navigation**: Streamlined navigation during emergencies for rapid response

### 2. **Comprehensive Inventory Management**
The Station Officer has full control over 15 specialized equipment categories:

#### Equipment Categories:
1. **Personal Protective Equipment (PPE)** - Helmets, jackets, boots, gloves
2. **Respiratory Protection** - SCBA units, masks, filters
3. **Hose & Water Delivery** - Fire hoses, nozzles, adapters
4. **Ground Ladders** - Extension ladders, roof ladders
5. **Forcible Entry & Hand Tools** - Axes, halligan bars, pry bars
6. **Power Tools & Ventilation** - Chainsaws, fans, generators
7. **Vehicle Extrication & Stabilization** - Jaws of life, spreaders, cutters
8. **Rope & Technical Rescue** - Ropes, harnesses, carabiners
9. **HazMat & Decontamination** - Protective suits, detection equipment
10. **EMS / Medical** - First aid kits, medical supplies
11. **Communications** - Radios, repeaters, communication devices
12. **Apparatus Loadouts** - Vehicle-specific equipment
13. **Station & Facilities** - Station maintenance equipment
14. **Training & Consumables** - Training props, consumable supplies
15. **Water Supply & Rural Ops** - Portable tanks, drafting equipment

#### Inventory Features:
- **Category-based Organization**: Visual grid layout with category images
- **Item CRUD Operations**: Create, Read, Update, Delete items within each category
- **Stock Level Tracking**: Monitor quantities and availability
- **Search Functionality**: Quick search across all inventory items
- **Emergency Mode Integration**: High-alert status during emergencies
- **Visual Status Indicators**: Color-coded availability status

### 3. **Vehicle & Resource Assignment System**
- **Multi-vehicle Selection**: Assign multiple vehicles to a single incident
- **Equipment Selection**: Choose specific equipment from vehicle loadouts
- **Real-time Availability**: Check vehicle and equipment availability status
- **Confirmed Readiness Integration**: Sync with inspection data to ensure equipment is ready
- **Assignment Summary**: Review all assignments before confirmation
- **Vehicle Color Coding**: Visual identification of different vehicle types
- **Equipment Availability Checking**: Automatic validation of equipment readiness

### 4. **Inspection Management System**
- **Scheduled Inspections**: Create and manage equipment inspection schedules
- **Inspection Forms**: Digital forms for recording inspection results
- **Condition Tracking**: Track equipment condition (Excellent, Good, Fair, Needs Repair)
- **Automated Alerts**: Notifications for overdue inspections
- **Inspection History**: Complete audit trail of all inspections
- **PDF Report Generation**: Export inspection reports as professional PDFs
- **Item Status Updates**: Automatically update inventory based on inspection results
- **Date-based Filtering**: View inspections by specific dates
- **Bulk Operations**: Perform inspections on multiple items efficiently

### 5. **Donation Management**
- **Donation Tracking**: Record and manage community donations
- **Donor Information**: Maintain donor contact details and history
- **Donation Categories**: Categorize donations (Equipment, Monetary, Supplies)
- **Amount Tracking**: Track monetary and item quantities
- **CRUD Operations**: Full create, read, update, delete functionality
- **Donation Reports**: Generate PDF reports of donation history
- **Validation**: Form validation to ensure data integrity
- **Search & Filter**: Find specific donations quickly

### 6. **Reports & Analytics**
- **Comprehensive Reporting**: Generate detailed operational reports
- **PDF Export**: Professional PDF generation with custom formatting
- **Multiple Report Types**: Incident reports, inventory reports, inspection reports
- **Date Range Filtering**: Generate reports for specific time periods
- **Visual Data Display**: Charts and graphs for quick insights
- **Report History**: Access previously generated reports
- **Custom Report Templates**: Standardized formats for different report types
- **Export Functionality**: Download reports for external use

### 7. **Dashboard & Overview**
- **Real-time Statistics**: Live updates on key operational metrics
- **Quick Actions**: Fast access to common tasks
- **Emergency Status**: Current emergency mode status display
- **Recent Activity**: View recent inspections, assignments, and donations
- **Resource Overview**: At-a-glance view of available resources
- **Alert System**: Important notifications and warnings
- **Navigation Hub**: Central access point to all Station Officer features

### 8. **User Interface Features**
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Dark Theme Navigation**: Professional dark-themed navigation bar
- **Emergency Mode UI**: Visual changes during emergency situations
- **Search Functionality**: Global search across multiple data types
- **Loading States**: User feedback during data operations
- **Error Handling**: Graceful error messages and recovery
- **Accessibility**: ARIA labels and keyboard navigation support
- **Professional Styling**: Modern, clean interface design

---

## 🔧 Technical Implementation

### Frontend Architecture
- **Component-based Structure**: Modular React components for maintainability
- **Context API**: Global state management for emergency mode and user data
- **React Router**: Client-side routing for seamless navigation
- **Custom Hooks**: Reusable logic for common operations
- **CSS Modules**: Scoped styling for each component

### Backend Integration
- **RESTful API**: Clean API endpoints for all operations
- **Authentication**: Secure role-based access control
- **Real-time Updates**: Socket.io for live data synchronization
- **Data Validation**: Server-side validation for data integrity
- **Error Handling**: Comprehensive error handling and logging

### Key APIs Used
- `/api/station-officer/inventory` - Inventory management
- `/api/station-officer/inspections` - Inspection operations
- `/api/station-officer/assignments` - Vehicle and resource assignments
- `/api/station-officer/donations` - Donation tracking
- `/api/station-officer/reports` - Report generation
- `/api/station-officer/vehicles` - Vehicle management

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
# Configure .env file with MongoDB connection string
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

---

## 🎓 Usage Guide for Station Officers

### Daily Operations Workflow
1. **Login** to the Station Officer module
2. **Check Dashboard** for any alerts or pending tasks
3. **Review Inventory** to ensure all equipment is available
4. **Conduct Inspections** as per schedule
5. **Manage Donations** if any received
6. **Generate Reports** as needed

### Emergency Response Workflow
1. **Activate Emergency Mode** when incident is reported
2. **Navigate to Assignments** page
3. **Select Incident** from active incidents list
4. **Assign Vehicles** based on incident type and severity
5. **Select Equipment** from vehicle loadouts
6. **Confirm Assignment** to dispatch resources
7. **Monitor Status** through real-time updates
8. **End Emergency Mode** when incident is resolved

---

## 🤝 Contributing
This project is part of SLIIT Year 2 Semester 2 group project.

## 📄 License
This project is developed for educational purposes.

## 📞 Support
For issues or questions regarding the Station Officer module, please contact the development team.

---

**Developed by**: Fire Brigade Management System Team  
**Module Owner**: Station Officer Module  
**Last Updated**: February 2026