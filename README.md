# HRMS (Human Resources Management System)

## Overview
A SharePoint Framework solution for managing employee certifications and HR processes. This application provides web parts for employee management, certification tracking, and HR request handling.

Check the video demo in the video folder.

## Key Features
- Certification request and tracking system
- Employee information management
- HR request management interface 
- Status tracking for certification requests
- Notification system for pending requests

## Tech Stack
- SharePoint Framework (SPFx) v1.17.4
- React 17.0.1
- TypeScript
- Tailwind CSS
- PnP/SP library for SharePoint operations
- Fluent UI React components
- Power Automate (for notifications and workflows)

## Web Parts

### 1. CertifWp (Certification Web Part)
- Allows employees to request certifications
- Tracks certification status
- Shows pending and on-hold requests
- Supports custom category suggestions

### 2. EmployeeWp (Employee Web Part)
- Manages employee information
- Provides employee listing and filtering
- Supports employee data management

### 3. ManageRqWp (Manage Requests Web Part)
- HR interface for managing certification requests
- Handles request approvals and rejections
- Prerequisites management for certifications

### 4. Footer Web Part
- Consistent footer across pages
- Navigation and additional information

## Installation

1. Clone repository
2. Install dependencies:
  ```bash
  npm install
  ```
3. Run development server:
  ```bash
  gulp serve
  ```

## Configuration Requirements
- SharePoint Online environment
- Site collection with appropriate permissions
- Modern SharePoint site
- Node.js version >=16.13.0 <17.0.0

## SharePoint Lists Required
- Employee Information
- Certification
- Certification Assignment
- SuggestedCertif
- Prerequisite Certifications

## Development Guidelines
- Uses TypeScript for type safety
- Follows Microsoft SharePoint Framework best practices
- Implements responsive design using Tailwind CSS
- Uses PnP libraries for SharePoint operations

## Authors
Solution created using SharePoint Framework and maintained by me.

## Version
Current version: 0.0.1
SPFx version: 1.17.4
# webpart-gen

