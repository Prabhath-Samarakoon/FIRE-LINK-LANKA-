# Fire Brigade Call Operator Interface

## Overview
A production-ready React + Tailwind interface for the Fire Brigade Call Operator System, optimized for 1920×1080 resolution with no scrolling.

## Features

### Page 1 - Call Intake
- **Caller Panel**: Name, phone, call ID, live notes, recording controls
- **Location Panel**: Address, coordinates, map placeholder, GPS integration
- **Pre-Arrival Safety Advice**: Action chips for evacuation, safety zones, SMS sending
- **Call Controls**: Mute, hold, transfer with visual feedback

### Page 2 - Incident & Dispatch
- **Incident Details**: Type selection, hazards, people trapped/injured, crowd size, emergency scale, priority
- **Resources & Dispatch**: Station selection, unit dispatch with steppers, ETA, incident commander
- **Timeline & Logs**: Event timeline, log entry input
- **Quick Actions**: Ambulance, police, power shutdown, broadcast, hospital notifications

## Design System

### Colors
- Primary Red: `#C1121F`
- Dark Background: `#0F172A`
- White Text: High contrast for emergency use

### Typography
- Headings: `text-3xl`
- Labels: `text-xl`
- Inputs/Buttons: `text-xl`
- Large, clear fonts for emergency operators

### Components
- Buttons: Minimum 56px height, rounded-2xl, bold text
- Inputs: Large, rounded-2xl, high contrast
- Cards: Rounded-2xl with proper spacing
- Grid layout with 24px spacing

## Keyboard Shortcuts
- **E**: Evacuate SMS
- **K**: Keep Away
- **M**: Mute
- **H**: Hold
- **T**: Transfer
- **S**: Submit & Dispatch
- **X**: End Call

## Usage
1. Navigate to `/call-operator/new` to access the new interface
2. Fill in required fields on Page 1 (Call Intake)
3. Click "Next: Incident Details" to proceed to Page 2
4. Complete incident details and dispatch resources
5. Use keyboard shortcuts for quick actions
6. Submit & Dispatch when all required fields are complete

## Validation
- Page 1 requires: Caller Name, Phone, Location
- Page 2 requires: Incident Type, Station, Commander
- Real-time validation with visual feedback
- Toast notifications for user actions

## Technology Stack
- React 18
- Tailwind CSS
- Lucide React Icons
- Custom shadcn/ui components
- No external dependencies beyond core libraries
