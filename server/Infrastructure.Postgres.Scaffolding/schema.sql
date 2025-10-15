CREATE TABLE Users (
                       Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       Email VARCHAR(255) UNIQUE NOT NULL,
                       PasswordHash VARCHAR(255) NOT NULL,
                       FirstName VARCHAR(100) NOT NULL,
                       LastName VARCHAR(100) NOT NULL,
                       PhoneNumber VARCHAR(20),
                       Role VARCHAR(20) NOT NULL CHECK (Role IN ('Admin', 'Client')),
                       IsActive BOOLEAN DEFAULT true,
                       ProfileImageUrl VARCHAR(500),
                       Language VARCHAR(5) DEFAULT 'ua' CHECK (Language IN ('ua', 'en')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_role ON Users(Role);


--------------


CREATE TABLE Projects (
                          Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          ClientId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
                          Title VARCHAR(200) NOT NULL,
                          Description TEXT,
                          Address VARCHAR(300),
                          City VARCHAR(100),
                          PostalCode VARCHAR(20),
                          Latitude DECIMAL(10, 8),
                          Longitude DECIMAL(11, 8),
                          Status VARCHAR(50) NOT NULL DEFAULT 'InProgress'
                              CHECK (Status IN ('Planned', 'InProgress', 'Completed', 'OnHold', 'Cancelled')),
                          StartDate DATE NOT NULL,
                          PlannedEndDate DATE,
                          ActualEndDate DATE,
                          TotalArea DECIMAL(10, 2), -- площа в м²
                          Budget DECIMAL(15, 2), -- бюджет у грн
                          ProgressPercentage INT DEFAULT 0 CHECK (ProgressPercentage BETWEEN 0 AND 100),
                          ThumbnailUrl VARCHAR(500),
                          CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_projects_client ON Projects(ClientId);
CREATE INDEX idx_projects_status ON Projects(Status);
CREATE INDEX idx_projects_dates ON Projects(StartDate, PlannedEndDate);


--------------


CREATE TABLE Milestones (
                            Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            ProjectId UUID NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
                            Title VARCHAR(200) NOT NULL,
                            Description TEXT,
                            OrderIndex INT NOT NULL, -- порядок відображення
                            Status VARCHAR(50) NOT NULL DEFAULT 'Pending'
                                CHECK (Status IN ('Pending', 'InProgress', 'Completed', 'Delayed')),
                            ProgressPercentage INT DEFAULT 0 CHECK (ProgressPercentage BETWEEN 0 AND 100),
                            PlannedStartDate DATE,
                            PlannedEndDate DATE,
                            ActualStartDate DATE,
                            ActualEndDate DATE,
                            Notes TEXT,
                            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT unique_project_order UNIQUE (ProjectId, OrderIndex)
);

-- Indexes
CREATE INDEX idx_milestones_project ON Milestones(ProjectId);
CREATE INDEX idx_milestones_status ON Milestones(Status);
CREATE INDEX idx_milestones_order ON Milestones(ProjectId, OrderIndex);


--------------


CREATE TABLE Photos (
                        Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        ProjectId UUID NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
                        MilestoneId UUID REFERENCES Milestones(Id) ON DELETE SET NULL,
                        FileName VARCHAR(255) NOT NULL,
                        FileUrl VARCHAR(500) NOT NULL,
                        ThumbnailUrl VARCHAR(500),
                        FileSize BIGINT, -- розмір у байтах
                        MimeType VARCHAR(100),
                        Width INT,
                        Height INT,
                        Caption TEXT,
                        TakenAt TIMESTAMP,
                        UploadedById UUID NOT NULL REFERENCES Users(Id),
                        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_photos_project ON Photos(ProjectId);
CREATE INDEX idx_photos_milestone ON Photos(MilestoneId);
CREATE INDEX idx_photos_date ON Photos(TakenAt DESC);


--------------


CREATE TABLE ThreeDScans (
                             Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             ProjectId UUID NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
                             MilestoneId UUID REFERENCES Milestones(Id) ON DELETE SET NULL,
                             RoomName VARCHAR(100) NOT NULL,
                             FileName VARCHAR(255) NOT NULL,
                             FileUrl VARCHAR(500) NOT NULL,
                             FileSize BIGINT,
                             FileFormat VARCHAR(50), -- .ply, .obj, .e57, etc.
                             RoomArea DECIMAL(10, 2), -- площа кімнати в м²
                             ScannedAt TIMESTAMP,
                             UploadedById UUID NOT NULL REFERENCES Users(Id),
                             Notes TEXT,
                             CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_3dscans_project ON ThreeDScans(ProjectId);
CREATE INDEX idx_3dscans_milestone ON ThreeDScans(MilestoneId);


--------------


CREATE TABLE Documents (
                           Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           ProjectId UUID NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
                           Title VARCHAR(200) NOT NULL,
                           FileName VARCHAR(255) NOT NULL,
                           FileUrl VARCHAR(500) NOT NULL,
                           FileSize BIGINT,
                           MimeType VARCHAR(100),
                           DocumentType VARCHAR(50) NOT NULL
                               CHECK (DocumentType IN ('Contract', 'TechnicalDoc', 'Permit', 'Report', 'Other')),
                           UploadedById UUID NOT NULL REFERENCES Users(Id),
                           IsVisibleToClient BOOLEAN DEFAULT true,
                           CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_documents_project ON Documents(ProjectId);
CREATE INDEX idx_documents_type ON Documents(DocumentType);
CREATE INDEX idx_documents_visibility ON Documents(ProjectId, IsVisibleToClient);


--------------


CREATE TABLE Messages (
                          Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          ProjectId UUID NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
                          SenderId UUID NOT NULL REFERENCES Users(Id),
                          ReceiverId UUID NOT NULL REFERENCES Users(Id),
                          Content TEXT NOT NULL,
                          IsRead BOOLEAN DEFAULT false,
                          ReadAt TIMESTAMP,
                          AttachmentUrl VARCHAR(500),
                          AttachmentType VARCHAR(50), -- 'image', 'document', 'video'
                          CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_project ON Messages(ProjectId);
CREATE INDEX idx_messages_sender ON Messages(SenderId);
CREATE INDEX idx_messages_receiver ON Messages(ReceiverId);
CREATE INDEX idx_messages_unread ON Messages(ReceiverId, IsRead) WHERE IsRead = false;
CREATE INDEX idx_messages_date ON Messages(CreatedAt DESC);


--------------


CREATE TABLE Updates (
                         Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         ProjectId UUID NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
                         MilestoneId UUID REFERENCES Milestones(Id) ON DELETE SET NULL,
                         UpdateType VARCHAR(50) NOT NULL
                             CHECK (UpdateType IN ('MilestoneStarted', 'MilestoneCompleted',
                                                   'PhotosAdded', 'DocumentAdded', 'StatusChanged', 'MessageSent', 'Other')),
                         Title VARCHAR(200) NOT NULL,
                         Description TEXT,
                         CreatedById UUID NOT NULL REFERENCES Users(Id),
                         CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_updates_project ON Updates(ProjectId);
CREATE INDEX idx_updates_type ON Updates(UpdateType);
CREATE INDEX idx_updates_date ON Updates(CreatedAt DESC);


--------------


CREATE TABLE Notifications (
                               Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
                               ProjectId UUID REFERENCES Projects(Id) ON DELETE CASCADE,
                               Title VARCHAR(200) NOT NULL,
                               Message TEXT NOT NULL,
                               Type VARCHAR(50) NOT NULL
                                   CHECK (Type IN ('NewMessage', 'MilestoneUpdate', 'PhotosAdded',
                                                   'DocumentAdded', 'ProjectUpdate', 'System')),
                               IsRead BOOLEAN DEFAULT false,
                               ReadAt TIMESTAMP,
                               ActionUrl VARCHAR(500), -- URL для переходу при кліку
                               CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user ON Notifications(UserId);
CREATE INDEX idx_notifications_unread ON Notifications(UserId, IsRead) WHERE IsRead = false;
CREATE INDEX idx_notifications_date ON Notifications(CreatedAt DESC);



--------------


CREATE TABLE RefreshTokens (
                               Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
                               Token VARCHAR(500) UNIQUE NOT NULL,
                               ExpiresAt TIMESTAMP NOT NULL,
                               CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               RevokedAt TIMESTAMP,
                               IsRevoked BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user ON RefreshTokens(UserId);
CREATE INDEX idx_refresh_tokens_token ON RefreshTokens(Token);
CREATE INDEX idx_refresh_tokens_active ON RefreshTokens(UserId, IsRevoked) WHERE IsRevoked = false;


