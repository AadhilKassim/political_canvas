# Political Canvas - Walklist & Territory Management

## New Features

### For Campaign Managers (Admin/Manager Roles)

#### Territory Management

- **Create Territories**: Organize your canvassing area into manageable zones
  - Define territory types: Neighborhood, Street, Ward, District, or Custom
  - Add descriptions (e.g., "Houses 1-50 on Main Street")
  - Assign volunteers to specific territories
  
- **Assign Voters to Territories**:

  - Bulk assign voters to territories
  - Track which voters belong to each area
  - Automatic progress tracking

- **Monitor Progress**:

  - Real-time completion rates for each territory
  - See contacted vs. not contacted voters
  - Track volunteer performance

### For Volunteers

#### My Walklist

- View all territories assigned to you
- See complete voter information for your assigned area
- Track your canvassing progress in real-time

#### Door-to-Door Canvassing

- **Voter Contact Recording**:
  - Mark contact status: Contacted, Supporter, Undecided, Opposed, Not Home, Do Not Contact
  - Record sentiment: Very Positive, Positive, Neutral, Negative, Very Negative
  - Note key issues that matter to voters
  - Add detailed notes for follow-up

- **Smart Organization**:
  - Voters sorted by contact status
  - Uncontacted voters highlighted for priority
  - Previously contacted voters shown separately
  - Progress bar shows completion percentage

#### Traditional Canvassing Features

Based on real political canvassing software:

1. **Territory-Based Organization**: Like VAN/NGP VAN and PDI
2. **Contact Status Tracking**: Similar to i360 and Voter Activation Network
3. **Sentiment Recording**: Inspired by Ecanvasser and Campaign Sidekick
4. **Issue Tracking**: Common in Walk The Vote and MiniVAN
5. **Progress Monitoring**: Standard in Organizer and Block by Block

## Setup Instructions

### 1. Migrate Database Schema

Run the migration script to update your database:

```bash
cd server
node migrate_schema.js
```

### 2. Restart Server

After migration, restart your backend server:

```bash
npm run dev
```

### 3. Using the System

#### As Admin/Manager:-

1. Navigate to "Territories" tab
2. Create territories for your canvassing area
3. Assign voters to each territory
4. Assign volunteers to territories

#### As Volunteer:-

1. Navigate to "My Walklist" tab
2. Select a territory to start canvassing
3. Click "Record Contact" on each voter
4. Fill in contact status and notes
5. Track your progress in real-time

## Workflow Example

### Traditional Door-to-Door Canvassing:-

1. **Morning Setup** (Manager):
   - Create territory: "Ward 5 - Oak Street Block 1"
   - Assign 50 voters from Oak Street
   - Assign volunteer "John" to the territory

2. **Canvassing** (Volunteer John):
   - Opens "My Walklist" on phone/tablet
   - Sees list of 50 voters to contact
   - Knocks on door, talks to voter
   - Records:
     - Status: "Supporter"
     - Sentiment: "Positive"
     - Issues: "Healthcare, Education"
     - Notes: "Wants yard sign, has questions about education policy"

3. **Evening Review** (Manager):
   - Checks territory progress
   - Sees John contacted 35/50 voters (70% complete)
   - Reviews notes for follow-up actions
   - Plans next day's canvassing

## Database Schema Updates

### Voters Table (Enhanced):-

- `territory_id`: Links voter to a territory
- `last_contacted`: Timestamp of last contact
- `contact_status`: Current status (not_contacted, supporter, etc.)

### Territories Table (Enhanced):-

- `description`: Detailed territory description
- `area_type`: Type of territory (neighborhood, street, ward, etc.)
- `created_at`: When territory was created

### Walklists Table (New Structure):-

- `territory_id`: Links to territory
- `assigned_to`: Volunteer assigned
- `status`: not_started, in_progress, completed
- `completed_at`: When walklist was finished

## API Endpoints Added

### Territories:-

- `GET /api/territories` - List all territories
- `GET /api/territories/my` - Get my assigned territories
- `GET /api/territories/:id` - Get territory details with voters
- `POST /api/territories` - Create new territory
- `PUT /api/territories/:id` - Update territory
- `DELETE /api/territories/:id` - Delete territory
- `POST /api/territories/:id/assign-voters` - Assign voters to territory

### Walklists:-

- `GET /api/walklists` - List all walklists
- `GET /api/walklists/my` - Get my walklists
- `POST /api/walklists` - Create new walklist
- `PUT /api/walklists/:id` - Update walklist status

### Voter Contact:-

- `PUT /api/voters/:id/contact` - Record voter contact

### Users:-

- `GET /api/users/volunteers` - Get list of volunteers (for assignment)

## Best Practices

### For Managers:-

1. Keep territories small and manageable (20-50 voters each)
2. Group voters by physical location (same street, building, etc.)
3. Assign volunteers to areas they know well
4. Review progress daily and provide support

### For Volunteers:-

1. Update contact status immediately after each interaction
2. Take detailed notes - they're valuable for follow-up
3. Mark "Not Home" voters for revisit
4. Respect "Do Not Contact" designations
5. Complete your territory before requesting a new one

### Privacy & Data Protection:-

1. Only volunteers see their assigned territories
2. All actions are logged with user IDs
3. Consent field tracks voter permission for contact
4. Follow local regulations for voter data handling

## Troubleshooting

**Q: I don't see the Territories tab**
A: Only Admin and Manager roles can see this tab. Volunteers see "My Walklist" instead.

**Q: Voters aren't showing in my walklist**
A: Ask your manager to assign voters to your territory.

**Q: Can't update voter contact status**
A: Ensure the server is running and you're connected to the internet.

**Q: Migration failed**
A: Check that MySQL is running and credentials are correct. Some errors about existing columns are normal.

## Future Enhancements

- Offline mode for canvassing without internet
- Mobile-optimized interface
- GPS tracking for route optimization
- Automated follow-up reminders
- Analytics and reporting dashboard
- Integration with voter databases
- SMS and email campaign tools
