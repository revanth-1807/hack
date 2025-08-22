# Event Management Fix - TODO List

## [ ] 1. Fix formatDate helper in server.js
- Update the helper to handle different date formats
- Add support for format parameters like 'YYYY-MM-DD'
- Ensure proper timezone handling

## [ ] 2. Fix edit.hbs date input formatting
- Update the date input to use correct format for HTML date fields
- Remove unsupported format parameter from formatDate call

## [ ] 3. Test the application
- Verify event creation works correctly
- Check event listing displays proper dates
- Test event editing functionality
- Confirm event details show correct information

## [ ] 4. Add validation if needed
- Check if additional validation is required in controller
