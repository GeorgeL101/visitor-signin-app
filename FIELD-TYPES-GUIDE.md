# Field Types Guide

## Available Field Types

The admin UI now supports multiple field types for your visitor sign-in form. Here's what each type does:

### 📝 Text Input
**Type:** `text`
- Standard single-line text input
- Best for: Names, short responses
- Example: "Your Name", "Company Name"

### 📋 Dropdown
**Type:** `dropdown`
- Drop-down selection menu with predefined options
- Best for: Multiple choice questions with limited options
- Example: "Purpose of Visit", "Department"
- **How to use:** 
  1. Change field type to "Dropdown"
  2. Enter options in the text area (one per line)
  3. Save configuration

**Example Options:**
```
Meeting
Delivery
Interview
Maintenance
Consultation
Other
```

### 📱 Phone Number
**Type:** `phone`
- Specialized input for phone numbers
- Shows numeric keyboard on mobile devices
- Best for: Contact phone numbers
- Example: "Phone Number", "Mobile"

### 📧 Email
**Type:** `email`
- Email input with validation
- Shows email keyboard on mobile devices
- Best for: Email addresses
- Example: "Email Address"

### 🔢 Number
**Type:** `number`
- Numeric input only
- Shows numeric keyboard
- Best for: Quantities, IDs
- Example: "Badge Number", "Employee ID"

### 📄 Text Area
**Type:** `textarea`
- Multi-line text input
- Best for: Longer responses, comments
- Example: "Additional Comments", "Notes"

### ✍️ Signature Pad
**Type:** `signature`
- Digital signature capture
- Required for visitor acknowledgment
- Example: "Signature"

## Changing Field Types

1. Open the admin UI: `http://localhost:3001`
2. Find the field you want to change
3. Click the "Field Type" dropdown
4. Select the new type
5. If you selected "Dropdown", enter your options (one per line)
6. Add a change description
7. Click "Save Configuration"

## Dropdown Options Tips

✅ **Do:**
- Keep options short and clear
- Use consistent capitalization
- Order options logically (alphabetical or by frequency)
- Include an "Other" option if needed

❌ **Don't:**
- Use too many options (consider text input instead)
- Duplicate options
- Leave blank lines between options

## Examples

### Purpose of Visit (Dropdown)
```
Meeting
Delivery
Interview
Job Application
Maintenance/Repair
Vendor Visit
Personal Visit
Other
```

### Department (Dropdown)
```
Human Resources
IT Department
Finance
Operations
Sales
Marketing
Executive
Reception
```

### Visit Duration (Dropdown)
```
Less than 30 minutes
30 minutes - 1 hour
1-2 hours
Half day
Full day
```

## Version Changes

When you change a field type, make sure to select the appropriate version increment:

- **Patch (1.0.X)**: Minor changes to existing dropdown options
- **Minor (1.X.0)**: Changing a field from text to dropdown (new feature)
- **Major (X.0.0)**: Removing options that might affect existing data

## Testing Your Changes

After changing field types:

1. Save the configuration in the admin UI
2. Refresh your visitor sign-in app
3. Test the new field type works correctly
4. Verify required fields still validate
5. Check mobile and desktop views

## Need Help?

- See DEV-ADMIN.md for general admin UI documentation
- See ADMIN-QUICKSTART.txt for quick reference
- Check the admin UI version history for recent changes
