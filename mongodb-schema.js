// MongoDB Collections Schema for DMF Roster Integration
// Import this schema into MongoDB Atlas

// ============================================================================
// Collection: artists
// Purpose: Store artist profiles, metadata, and catalog information
// ============================================================================

db.createCollection("artists", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "string", description: "Unique artist identifier" },
        name: { bsonType: "string", description: "Artist stage name" },
        legal_name: { bsonType: "string" },
        role: { bsonType: "string", enum: ["Founder & CEO", "Co-Founder & Artist", "Artist", "Artist Collective", "Producer", "Engineer"] },
        status: { bsonType: "string", enum: ["Active", "Inactive", "Pending"] },
        division: { bsonType: "string", description: "Associated division/imprint" },
        genres: { bsonType: "array", items: { bsonType: "string" } },
        catalog_status: { bsonType: "string" },
        artist_type: { bsonType: "string", enum: ["Primary", "Secondary", "Collective", "Featured"] },
        verified: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
        profile: {
          bsonType: "object",
          properties: {
            bio: { bsonType: "string" },
            photo_url: { bsonType: "string" },
            social_links: {
              bsonType: "object",
              properties: {
                twitter: { bsonType: "string" },
                instagram: { bsonType: "string" },
                tiktok: { bsonType: "string" },
                youtube: { bsonType: "string" },
                spotify: { bsonType: "string" }
              }
            }
          }
        },
        analytics: {
          bsonType: "object",
          properties: {
            total_releases: { bsonType: "int" },
            total_tracks: { bsonType: "int" },
            followers: { bsonType: "int" },
            monthly_listeners: { bsonType: "int" },
            streams_total: { bsonType: "long" }
          }
        }
      }
    }
  }
});

// ============================================================================
// Collection: divisions
// Purpose: Store internal divisions/departments and their services
// ============================================================================

db.createCollection("divisions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "type", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        type: { bsonType: "string", enum: ["Technology", "Legal & IP", "Distribution", "Generative AI", "AI Research & Testing", "Content & Production", "Finance & Admin", "Education & Training", "Security & Fraud Prevention", "Government Services"] },
        status: { bsonType: "string", enum: ["Active", "Inactive", "Planning", "Testing"] },
        description: { bsonType: "string" },
        services: { bsonType: "array", items: { bsonType: "string" } },
        owner: { bsonType: "string", description: "Owner/Lead name" },
        team_size: { bsonType: "int" },
        technology_stack: { bsonType: "array", items: { bsonType: "string" } },
        dsp_partners: { bsonType: "array", items: { bsonType: "string" } },
        visible_in_app: { bsonType: "bool" },
        icon: { bsonType: "string" },
        integration_status: { bsonType: "string", enum: ["Live", "Planned", "Beta", "Testing"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// ============================================================================
// Collection: imprints
// Purpose: Store label imprints and sub-brands
// ============================================================================

db.createCollection("imprints", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "status", "parent_label"],
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        status: { bsonType: "string", enum: ["Active", "Inactive"] },
        parent_label: { bsonType: "string" },
        description: { bsonType: "string" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// ============================================================================
// Collection: organizations
// Purpose: Store business entities and corporate structure
// ============================================================================

db.createCollection("organizations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "type"],
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        type: { bsonType: "string" },
        legal_status: { bsonType: "string" },
        business_license: { bsonType: "string" },
        founded: { bsonType: "string" },
        headquarters: { bsonType: "string" },
        status: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

// ============================================================================
// Collection: team
// Purpose: Store team member profiles and permissions
// ============================================================================

db.createCollection("team", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "role", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        legal_name: { bsonType: "string" },
        role: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        status: { bsonType: "string", enum: ["Active", "Inactive", "Pending"] },
        departments: { bsonType: "array", items: { bsonType: "string" } },
        permissions: { bsonType: "array", items: { bsonType: "string" } },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// ============================================================================
// Collection: label_metadata
// Purpose: Store master label information and branding
// ============================================================================

db.createCollection("label_metadata", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name"],
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        legal_name: { bsonType: "string" },
        ohio_business_number: { bsonType: "string" },
        founded: { bsonType: "string" },
        headquarters: { bsonType: "string" },
        website: { bsonType: "string" },
        status: { bsonType: "string" },
        color_primary: { bsonType: "string" },
        color_secondary: { bsonType: "string" },
        logo_text: { bsonType: "string" },
        total_artists: { bsonType: "int" },
        total_divisions: { bsonType: "int" },
        total_imprints: { bsonType: "int" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// ============================================================================
// Create Indexes for Performance
// ============================================================================

// Artists indexes
db.artists.createIndex({ "id": 1 }, { unique: true });
db.artists.createIndex({ "name": 1 });
db.artists.createIndex({ "division": 1 });
db.artists.createIndex({ "status": 1 });
db.artists.createIndex({ "verified": 1 });
db.artists.createIndex({ "created_at": 1 });

// Divisions indexes
db.divisions.createIndex({ "id": 1 }, { unique: true });
db.divisions.createIndex({ "name": 1 });
db.divisions.createIndex({ "type": 1 });
db.divisions.createIndex({ "status": 1 });
db.divisions.createIndex({ "integration_status": 1 });

// Imprints indexes
db.imprints.createIndex({ "id": 1 }, { unique: true });
db.imprints.createIndex({ "parent_label": 1 });
db.imprints.createIndex({ "status": 1 });

// Organizations indexes
db.organizations.createIndex({ "id": 1 }, { unique: true });
db.organizations.createIndex({ "type": 1 });

// Team indexes
db.team.createIndex({ "id": 1 }, { unique: true });
db.team.createIndex({ "email": 1 });
db.team.createIndex({ "role": 1 });
db.team.createIndex({ "status": 1 });

// Label metadata indexes
db.label_metadata.createIndex({ "id": 1 }, { unique: true });

// ============================================================================
// Insert Sample Data (Optional - can be replaced with actual data)
// ============================================================================

// This is where dmf-roster.json data would be imported
// Use mongoimport or Atlas UI to load the JSON file

// ============================================================================
// Notes:
// ============================================================================
// 1. All timestamps use ISO 8601 format (BSON Date)
// 2. IDs are strings for easy reference in code
// 3. Unique indexes prevent duplicate records
// 4. Performance indexes on frequently queried fields
// 5. Status fields use enums to maintain data consistency
// 6. Ready for real-time analytics and reporting
// 7. Scalable for future expansion (more artists, divisions, etc.)
